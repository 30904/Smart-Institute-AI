const mongoose = require("mongoose");

const AdmissionApplication = require("../models/AdmissionApplication");
const AdmissionCycle = require("../models/AdmissionCycle");
const IntakeCapacity = require("../models/IntakeCapacity");
const MeritList = require("../models/MeritList");
const Program = require("../models/Program");
const SeatAllocation = require("../models/SeatAllocation");

const FUNNEL_STAGES = [
  {
    stage: "Applications",
    statuses: ["applied", "docs_pending", "eligible", "ineligible", "merit_listed", "allotted", "approved", "fee_pending", "enrolled", "rejected", "waitlisted"]
  },
  { stage: "Eligible", statuses: ["eligible", "merit_listed", "allotted", "approved", "fee_pending", "enrolled"] },
  { stage: "Merit Listed", statuses: ["merit_listed", "allotted", "approved", "fee_pending", "enrolled"] },
  { stage: "Allotted", statuses: ["allotted", "approved", "fee_pending", "enrolled"] },
  { stage: "Approved", statuses: ["approved", "fee_pending", "enrolled"] },
  { stage: "Enrolled", statuses: ["enrolled"] }
];

function requireValidId(value, field) {
  if (value && !mongoose.isValidObjectId(value)) {
    const error = new Error(`${field} contains an invalid id.`);
    error.statusCode = 400;
    throw error;
  }
}

function buildFilters({ cycleId, programId }) {
  requireValidId(cycleId, "cycle_id");
  requireValidId(programId, "program_id");
  const applicationFilter = {};
  const sharedFilter = {};

  if (cycleId) {
    applicationFilter.cycle_id = cycleId;
    sharedFilter.cycle_id = cycleId;
  }
  if (programId) {
    applicationFilter.program_preferences = programId;
    sharedFilter.program_id = programId;
  }
  return { applicationFilter, sharedFilter };
}

function buildLabelMaps(cycles, programs) {
  return {
    cycles: new Map(cycles.map((cycle) => [cycle._id.toString(), cycle.name])),
    programs: new Map(programs.map((program) => [program._id.toString(), `${program.name} (${program.code})`]))
  };
}

function buildSeatAvailability(intakes, allocations, labelMaps) {
  const groupedIntakes = new Map();
  intakes.forEach((intake) => {
    const key = `${intake.cycle_id}:${intake.program_id}`;
    const group = groupedIntakes.get(key) || { cycle_id: intake.cycle_id.toString(), program_id: intake.program_id.toString(), general: null, categoryTotal: 0 };
    if (intake.category_id) group.categoryTotal += intake.seats;
    else group.general = intake.seats;
    groupedIntakes.set(key, group);
  });

  const allocationCounts = new Map();
  allocations.forEach((allocation) => {
    const key = `${allocation.cycle_id}:${allocation.program_id}`;
    const counts = allocationCounts.get(key) || { allotted: 0, waitlisted: 0 };
    if (allocation.allocation_status === "allotted") counts.allotted += 1;
    if (allocation.allocation_status === "waitlisted") counts.waitlisted += 1;
    allocationCounts.set(key, counts);
  });

  return [...groupedIntakes.entries()].map(([key, group]) => {
    const totalSeats = group.general ?? group.categoryTotal;
    const counts = allocationCounts.get(key) || { allotted: 0, waitlisted: 0 };
    return {
      cycle_id: group.cycle_id,
      cycle: labelMaps.cycles.get(group.cycle_id) || group.cycle_id,
      program_id: group.program_id,
      program: labelMaps.programs.get(group.program_id) || group.program_id,
      total_seats: totalSeats,
      allotted_seats: counts.allotted,
      available_seats: Math.max(0, totalSeats - counts.allotted),
      waitlisted: counts.waitlisted
    };
  });
}

async function getAdmissionReports(filters = {}) {
  const { applicationFilter, sharedFilter } = buildFilters(filters);
  const [applications, intakes, allocations, meritRecords, cycles, programs] = await Promise.all([
    AdmissionApplication.find(applicationFilter).sort({ createdAt: -1 }).lean(),
    IntakeCapacity.find(sharedFilter).lean(),
    SeatAllocation.find(sharedFilter).lean(),
    MeritList.find(sharedFilter).sort({ overall_rank: 1 }).lean(),
    AdmissionCycle.find({}).lean(),
    Program.find({}).lean()
  ]);

  const labelMaps = buildLabelMaps(cycles, programs);
  const statusCounts = applications.reduce((counts, application) => {
    counts[application.status] = (counts[application.status] || 0) + 1;
    return counts;
  }, {});
  const totalApplications = applications.length;
  const enrolled = statusCounts.enrolled || 0;
  const today = new Date().toISOString().slice(0, 10);
  const applicationsToday = applications.filter(
    (application) => new Date(application.createdAt).toISOString().slice(0, 10) === today
  ).length;
  const pendingStatuses = ["applied", "docs_pending", "fee_pending"];
  const pendingApplications = applications
    .filter((application) => pendingStatuses.includes(application.status))
    .map((application) => ({
      application_id: application._id.toString(),
      applicant: application.personal?.full_name || "",
      email: application.personal?.email || "",
      cycle: labelMaps.cycles.get(application.cycle_id.toString()) || application.cycle_id.toString(),
      status: application.status,
      applied_on: application.createdAt
    }));

  const statusBreakdown = Object.entries(statusCounts)
    .map(([status, count]) => ({ status, count }))
    .sort((left, right) => right.count - left.count);
  const conversionFunnel = FUNNEL_STAGES.map(({ stage, statuses }) => {
    const count = applications.filter((application) => statuses.includes(application.status)).length;
    return {
      stage,
      count,
      percent: totalApplications ? Number(((count / totalApplications) * 100).toFixed(2)) : 0
    };
  });
  const seatAvailability = buildSeatAvailability(intakes, allocations, labelMaps);
  const meritList = meritRecords.map((record) => ({
    merit_record_id: record._id.toString(),
    application_id: record.application_id.toString(),
    cycle: labelMaps.cycles.get(record.cycle_id.toString()) || record.cycle_id.toString(),
    program: labelMaps.programs.get(record.program_id.toString()) || record.program_id.toString(),
    merit_score: record.merit_score,
    overall_rank: record.overall_rank,
    category_rank: record.category_rank,
    within_cutoff: record.within_cutoff,
    selection_pool: record.selection_pool
  }));

  return {
    generated_at: new Date(),
    filters: {
      cycle_id: filters.cycleId || null,
      program_id: filters.programId || null
    },
    kpis: {
      total_applications: totalApplications,
      applications_today: applicationsToday,
      pending_applications: pendingApplications.length,
      pending_verification: statusCounts.docs_pending || 0,
      merit_listed: statusCounts.merit_listed || 0,
      allotted: statusCounts.allotted || 0,
      enrolled,
      conversion_percent: totalApplications ? Number(((enrolled / totalApplications) * 100).toFixed(2)) : 0,
      total_seats: seatAvailability.reduce((total, row) => total + row.total_seats, 0),
      available_seats: seatAvailability.reduce((total, row) => total + row.available_seats, 0)
    },
    status_breakdown: statusBreakdown,
    conversion_funnel: conversionFunnel,
    seat_availability: seatAvailability,
    pending_applications: pendingApplications,
    merit_list: meritList
  };
}

function escapeCsv(value) {
  if (value === null || value === undefined) return "";
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function toCsv(rows) {
  if (!rows.length) return "No data\r\n";
  const columns = Object.keys(rows[0]);
  return [
    columns.map(escapeCsv).join(","),
    ...rows.map((row) => columns.map((column) => escapeCsv(row[column])).join(","))
  ].join("\r\n");
}

async function exportAdmissionReport({ report, cycleId, programId }) {
  const data = await getAdmissionReports({ cycleId, programId });
  const reportRows = {
    summary: [data.kpis],
    status: data.status_breakdown,
    seats: data.seat_availability,
    pending: data.pending_applications,
    merit: data.merit_list,
    conversion: data.conversion_funnel
  };
  if (!reportRows[report]) {
    const error = new Error("report must be summary, status, seats, pending, merit, or conversion.");
    error.statusCode = 400;
    throw error;
  }
  return {
    filename: `admissions-${report}-${new Date().toISOString().slice(0, 10)}.csv`,
    content: toCsv(reportRows[report])
  };
}

module.exports = { getAdmissionReports, exportAdmissionReport };

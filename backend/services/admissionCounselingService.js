const mongoose = require("mongoose");

const AdmissionApplication = require("../models/AdmissionApplication");
const MeritList = require("../models/MeritList");
const SeatAllocation = require("../models/SeatAllocation");
const { resolveSeatPlan } = require("./admissionMeritService");

function requireValidId(value, field) {
  if (!mongoose.isValidObjectId(value)) {
    const error = new Error(`${field} contains an invalid id.`);
    error.statusCode = 400;
    throw error;
  }
}

function sanitizeAllocation(document) {
  const value = document.toObject ? document.toObject() : document;
  return {
    ...value,
    id: value._id.toString(),
    _id: undefined,
    __v: undefined
  };
}

function allocateRankedCandidates(meritRecords, totalSeats, quotaSeats) {
  const selectedApplicationIds = new Set();
  const categoryCounts = new Map();
  const allocations = meritRecords.map((record) => {
    const categoryId = record.category_id.toString();
    const categoryRank = (categoryCounts.get(categoryId) || 0) + 1;
    categoryCounts.set(categoryId, categoryRank);
    const reservedSeats = quotaSeats.get(categoryId) || 0;
    const isReserved = reservedSeats > 0 && categoryRank <= reservedSeats;
    if (isReserved) selectedApplicationIds.add(record.application_id.toString());

    return {
      meritRecord: record,
      selected: isReserved,
      selection_pool: isReserved ? "reserved" : "waitlist"
    };
  });

  let remainingSeats = Math.max(0, totalSeats - selectedApplicationIds.size);
  allocations.forEach((allocation) => {
    const applicationId = allocation.meritRecord.application_id.toString();
    if (!allocation.selected && remainingSeats > 0 && !selectedApplicationIds.has(applicationId)) {
      allocation.selected = true;
      allocation.selection_pool = "open";
      selectedApplicationIds.add(applicationId);
      remainingSeats -= 1;
    }
  });

  const poolSeatCounters = new Map();
  let waitlistPosition = 0;
  return allocations.map((allocation) => {
    const categoryId = allocation.meritRecord.category_id.toString();
    if (!allocation.selected) {
      waitlistPosition += 1;
      return {
        ...allocation,
        pool_key: "waitlist",
        seat_number: null,
        waitlist_position: waitlistPosition
      };
    }

    const poolKey = allocation.selection_pool === "reserved" ? `reserved:${categoryId}` : "open";
    const seatNumber = (poolSeatCounters.get(poolKey) || 0) + 1;
    poolSeatCounters.set(poolKey, seatNumber);
    return {
      ...allocation,
      pool_key: poolKey,
      seat_number: seatNumber,
      waitlist_position: null
    };
  });
}

async function allocateCounselingSeats({ cycleId, programId, userId }) {
  requireValidId(cycleId, "cycle_id");
  requireValidId(programId, "program_id");

  const [seatPlan, meritRecords, otherProgramAllotments] = await Promise.all([
    resolveSeatPlan(cycleId, programId),
    MeritList.find({ cycle_id: cycleId, program_id: programId }).sort({ overall_rank: 1 }),
    SeatAllocation.find({
      cycle_id: cycleId,
      program_id: { $ne: programId },
      allocation_status: "allotted"
    }).select("application_id")
  ]);

  if (!meritRecords.length) {
    const error = new Error("Generate the merit list before running counseling allocation.");
    error.statusCode = 400;
    throw error;
  }

  const alreadyAllottedApplicationIds = new Set(
    otherProgramAllotments.map((allocation) => allocation.application_id.toString())
  );
  const availableMeritRecords = meritRecords.filter(
    (record) => !alreadyAllottedApplicationIds.has(record.application_id.toString())
  );

  if (!availableMeritRecords.length) {
    const error = new Error("All ranked applicants already hold allotments in other programs.");
    error.statusCode = 409;
    throw error;
  }

  const plannedAllocations = allocateRankedCandidates(
    availableMeritRecords,
    seatPlan.totalSeats,
    seatPlan.quotaSeats
  );
  const allottedAt = new Date();
  const documents = plannedAllocations.map((allocation) => ({
    cycle_id: cycleId,
    program_id: programId,
    application_id: allocation.meritRecord.application_id,
    merit_list_id: allocation.meritRecord._id,
    category_id: allocation.meritRecord.category_id,
    allocation_status: allocation.selected ? "allotted" : "waitlisted",
    selection_pool: allocation.selection_pool,
    pool_key: allocation.pool_key,
    seat_number: allocation.seat_number,
    waitlist_position: allocation.waitlist_position,
    allotted_at: allocation.selected ? allottedAt : null,
    allocated_by: userId
  }));

  await SeatAllocation.deleteMany({ cycle_id: cycleId, program_id: programId });
  const allocations = await SeatAllocation.insertMany(documents, { ordered: true });

  const allottedApplicationIds = allocations
    .filter((allocation) => allocation.allocation_status === "allotted")
    .map((allocation) => allocation.application_id);
  const waitlistedApplicationIds = allocations
    .filter((allocation) => allocation.allocation_status === "waitlisted")
    .map((allocation) => allocation.application_id);

  await Promise.all([
    AdmissionApplication.updateMany(
      { _id: { $in: allottedApplicationIds } },
      { $set: { status: "allotted" } }
    ),
    AdmissionApplication.updateMany(
      { _id: { $in: waitlistedApplicationIds } },
      { $set: { status: "waitlisted" } }
    )
  ]);

  return {
    cycle_id: String(cycleId),
    program_id: String(programId),
    total_seats: seatPlan.totalSeats,
    allotted_count: allottedApplicationIds.length,
    waitlisted_count: waitlistedApplicationIds.length,
    skipped_already_allotted: meritRecords.length - availableMeritRecords.length,
    allocations: allocations.map(sanitizeAllocation)
  };
}

async function listSeatAllocations({ cycleId, programId, status }) {
  const query = {};
  if (cycleId) {
    requireValidId(cycleId, "cycle_id");
    query.cycle_id = cycleId;
  }
  if (programId) {
    requireValidId(programId, "program_id");
    query.program_id = programId;
  }
  if (status) {
    if (!["allotted", "waitlisted", "rejected"].includes(status)) {
      const error = new Error("Allocation status must be allotted, waitlisted, or rejected.");
      error.statusCode = 400;
      throw error;
    }
    query.allocation_status = status;
  }

  const allocations = await SeatAllocation.find(query).sort({
    program_id: 1,
    allocation_status: 1,
    waitlist_position: 1,
    seat_number: 1
  });
  return allocations.map(sanitizeAllocation);
}

module.exports = { allocateCounselingSeats, listSeatAllocations };

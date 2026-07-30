const fs = require("fs/promises");
const path = require("path");

const AcademicYear = require("../models/AcademicYear");
const AdmissionApplication = require("../models/AdmissionApplication");
const AdmissionApplicationDocument = require("../models/AdmissionApplicationDocument");
const AdmissionCategory = require("../models/AdmissionCategory");
const AdmissionCycle = require("../models/AdmissionCycle");
const AdmissionDocumentType = require("../models/AdmissionDocumentType");
const AdmissionFeeConfirmation = require("../models/AdmissionFeeConfirmation");
const EligibilityCriteria = require("../models/EligibilityCriteria");
const IntakeCapacity = require("../models/IntakeCapacity");
const MeritList = require("../models/MeritList");
const OutboxEvent = require("../models/OutboxEvent");
const Program = require("../models/Program");
const SeatAllocation = require("../models/SeatAllocation");
const SequenceCounter = require("../models/SequenceCounter");
const Student = require("../models/Student");
const User = require("../models/User");

// Demo applicants are identified by this email domain so re-seeding only ever
// replaces generated rows and never touches records created through the UI.
const DEMO_EMAIL_DOMAIN = "demo.smartinstitute.test";

const CURRENT_CYCLE = "Phase 1 - Regular";
const PREVIOUS_CYCLE = "AY 2024-25 Main";

const MERIT_STATUSES = ["merit_listed", "allotted", "approved", "fee_pending", "enrolled", "waitlisted"];
const ALLOTTED_STATUSES = ["allotted", "approved", "fee_pending", "enrolled"];
const APPROVED_STATUSES = ["approved", "fee_pending", "enrolled"];
const VERIFIED_DOC_STATUSES = [
  "eligible",
  "merit_listed",
  "allotted",
  "approved",
  "fee_pending",
  "enrolled",
  "waitlisted"
];
const SCORED_STATUSES = [
  "eligible",
  "ineligible",
  "merit_listed",
  "allotted",
  "approved",
  "fee_pending",
  "enrolled",
  "rejected",
  "waitlisted"
];

const PROGRAM_FEES = {
  BCA: 45000,
  DCE: 32000,
  "ITI-COPA": 18000,
  "MBA-GEN": 85000,
  DME: 32000,
  DEE: 32000,
  DEC: 32000,
  "DCE-CIV": 32000
};

const PAYMENT_MODES = ["upi", "online", "card", "bank", "cash"];

const QUALIFICATIONS = {
  degree: {
    qualification: "12th / HSC passed",
    institution_name: "Nutan Vidyalaya Higher Secondary",
    board_or_university: "State Board",
    passing_year: 2025
  },
  diploma: {
    qualification: "10th / SSC passed",
    institution_name: "Saraswati Vidya Mandir",
    board_or_university: "State Board",
    passing_year: 2025
  },
  trade: {
    qualification: "10th / SSC passed",
    institution_name: "Gyan Bharati High School",
    board_or_university: "State Board",
    passing_year: 2025
  }
};

const DEMO_APPLICANTS = [
  { name: "Aarav Sharma", gender: "male", marks: 92.4, category: "GEN", programs: ["BCA", "DCE"], status: "enrolled" },
  { name: "Isha Patel", gender: "female", marks: 90.8, category: "OBC", programs: ["BCA", "DCE"], status: "enrolled" },
  { name: "Rohan Verma", gender: "male", marks: 89.2, category: "GEN", programs: ["BCA"], status: "enrolled" },
  { name: "Sneha Nair", gender: "female", marks: 87.6, category: "SC", programs: ["DCE", "BCA"], status: "enrolled" },
  { name: "Kabir Singh", gender: "male", marks: 86.1, category: "GEN", programs: ["MBA-GEN"], status: "enrolled" },
  { name: "Ananya Iyer", gender: "female", marks: 85.3, category: "OBC", programs: ["BCA"], status: "fee_pending" },
  { name: "Vivaan Joshi", gender: "male", marks: 84.7, category: "GEN", programs: ["DCE"], status: "fee_pending" },
  { name: "Meera Reddy", gender: "female", marks: 83.9, category: "EWS", programs: ["MBA-GEN"], status: "fee_pending" },
  { name: "Arjun Mehta", gender: "male", marks: 82.5, category: "GEN", programs: ["BCA"], status: "approved" },
  { name: "Diya Kulkarni", gender: "female", marks: 81.8, category: "OBC", programs: ["DCE"], status: "approved" },
  { name: "Aditya Rao", gender: "male", marks: 80.4, category: "ST", programs: ["BCA"], status: "allotted" },
  { name: "Kavya Desai", gender: "female", marks: 79.6, category: "GEN", programs: ["ITI-COPA"], status: "allotted" },
  { name: "Ayaan Khan", gender: "male", marks: 78.2, category: "OBC", programs: ["BCA"], status: "allotted" },
  { name: "Riya Gupta", gender: "female", marks: 77.5, category: "GEN", programs: ["DME"], status: "merit_listed" },
  { name: "Dhruv Chauhan", gender: "male", marks: 76.8, category: "SC", programs: ["BCA"], status: "merit_listed" },
  { name: "Tara Bhatt", gender: "female", marks: 75.4, category: "GEN", programs: ["DEE"], status: "merit_listed" },
  { name: "Nikhil Pillai", gender: "male", marks: 74.1, category: "OBC", programs: ["BCA"], status: "eligible" },
  { name: "Sara Menon", gender: "female", marks: 72.9, category: "GEN", programs: ["MBA-GEN"], status: "eligible" },
  { name: "Yash Thakur", gender: "male", marks: 71.3, category: "EWS", programs: ["DCE"], status: "docs_pending" },
  { name: "Pooja Shetty", gender: "female", marks: 70.6, category: "GEN", programs: ["BCA"], status: "docs_pending" },
  { name: "Rahul Yadav", gender: "male", marks: 69.8, category: "OBC", programs: ["ITI-COPA"], status: "docs_pending" },
  { name: "Neha Saxena", gender: "female", marks: 68.2, category: "GEN", programs: ["DME"], status: "applied" },
  { name: "Manav Bose", gender: "male", marks: 66.5, category: "SC", programs: ["DEE"], status: "applied" },
  { name: "Aditi Chopra", gender: "female", marks: 64.9, category: "GEN", programs: ["BCA"], status: "waitlisted" },
  { name: "Karan Malhotra", gender: "male", marks: 63.4, category: "OBC", programs: ["BCA"], status: "waitlisted" },
  { name: "Simran Kaur", gender: "female", marks: 41.2, category: "GEN", programs: ["BCA"], status: "ineligible" },
  { name: "Farhan Ali", gender: "male", marks: 58.7, category: "GEN", programs: ["MBA-GEN"], status: "rejected" },
  {
    name: "Nisha Agarwal",
    gender: "female",
    marks: 91.5,
    category: "GEN",
    programs: ["BCA"],
    status: "enrolled",
    cycle: PREVIOUS_CYCLE
  },
  {
    name: "Siddharth Jain",
    gender: "male",
    marks: 88.9,
    category: "OBC",
    programs: ["DCE"],
    status: "enrolled",
    cycle: PREVIOUS_CYCLE
  },
  {
    name: "Priya Raut",
    gender: "female",
    marks: 86.3,
    category: "SC",
    programs: ["BCA"],
    status: "enrolled",
    cycle: PREVIOUS_CYCLE
  },
  {
    name: "Omkar Deshmukh",
    gender: "male",
    marks: 84.2,
    category: "GEN",
    programs: ["DME"],
    status: "enrolled",
    cycle: PREVIOUS_CYCLE
  },
  {
    name: "Zoya Sheikh",
    gender: "female",
    marks: 82.7,
    category: "EWS",
    programs: ["BCA"],
    status: "enrolled",
    cycle: PREVIOUS_CYCLE
  },
  {
    name: "Harsh Vora",
    gender: "male",
    marks: 79.1,
    category: "GEN",
    programs: ["ITI-COPA"],
    status: "enrolled",
    cycle: PREVIOUS_CYCLE
  },
  {
    name: "Lata Kadam",
    gender: "female",
    marks: 61.4,
    category: "OBC",
    programs: ["DCE"],
    status: "rejected",
    cycle: PREVIOUS_CYCLE
  },
  {
    name: "Imran Qureshi",
    gender: "male",
    marks: 55.8,
    category: "GEN",
    programs: ["BCA"],
    status: "waitlisted",
    cycle: PREVIOUS_CYCLE
  }
];

const CITIES = [
  { city: "Pune", state: "Maharashtra", pincode: "411001" },
  { city: "Nashik", state: "Maharashtra", pincode: "422001" },
  { city: "Nagpur", state: "Maharashtra", pincode: "440001" },
  { city: "Thane", state: "Maharashtra", pincode: "400601" },
  { city: "Aurangabad", state: "Maharashtra", pincode: "431001" }
];

const GUARDIAN_FIRST_NAMES = ["Suresh", "Vandana", "Prakash", "Sunita", "Ramesh", "Anita"];

function slugify(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function emailFor(name) {
  return `${slugify(name).replace(/-/g, ".")}@${DEMO_EMAIL_DOMAIN}`;
}

function addDays(date, days) {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

function compactCode(value) {
  return String(value || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

function buildApplicationPayload(applicant, index, context) {
  const { cycleByName, programByCode, categoryByCode, criteriaByProgram } = context;
  const cycleName = applicant.cycle || CURRENT_CYCLE;
  const cycle = cycleByName.get(cycleName);
  const category = categoryByCode.get(applicant.category);
  const programs = applicant.programs.map((code) => programByCode.get(code)).filter(Boolean);

  if (!cycle || !category || !programs.length) {
    return null;
  }

  const primaryProgram = programs[0];
  const qualification = QUALIFICATIONS[primaryProgram.program_type] || QUALIFICATIONS.diploma;
  const location = CITIES[index % CITIES.length];
  const guardianFirstName = GUARDIAN_FIRST_NAMES[index % GUARDIAN_FIRST_NAMES.length];
  const surname = applicant.name.split(" ").slice(-1)[0];
  const isEligibleOverall = applicant.status !== "ineligible";

  const eligibilityResults = VERIFIED_DOC_STATUSES.includes(applicant.status) || applicant.status === "ineligible"
    ? programs.map((program) => {
        const criteria = criteriaByProgram.get(program._id.toString());
        const meetsMarks = criteria ? applicant.marks >= criteria.min_marks : true;
        const isEligible = isEligibleOverall && meetsMarks;
        return {
          program_id: program._id,
          criteria_id: criteria?._id || null,
          is_eligible: isEligible,
          reasons: isEligible
            ? []
            : [
                criteria
                  ? `Minimum marks ${criteria.min_marks}% required, scored ${applicant.marks}%.`
                  : "Eligibility criteria not configured for this program."
              ],
          evaluated_at: addDays(cycle.start_date, index + 3)
        };
      })
    : [];

  return {
    personal: {
      full_name: applicant.name,
      email: emailFor(applicant.name),
      phone: `98${String(76000000 + index * 137).padStart(8, "0")}`,
      date_of_birth: new Date(Date.UTC(2007, index % 12, ((index * 3) % 27) + 1)),
      gender: applicant.gender,
      address: {
        line1: `${index + 12}, Shivaji Nagar`,
        city: location.city,
        state: location.state,
        pincode: location.pincode
      }
    },
    academic: {
      ...qualification,
      marks_percent: applicant.marks,
      details_json: { stream: primaryProgram.program_type === "degree" ? "Science" : "General" }
    },
    guardians: [
      {
        name: `${guardianFirstName} ${surname}`,
        relationship: index % 2 === 0 ? "Father" : "Mother",
        phone: `97${String(65000000 + index * 211).padStart(8, "0")}`,
        email: `guardian.${slugify(applicant.name)}@${DEMO_EMAIL_DOMAIN}`
      }
    ],
    program_preferences: programs.map((program) => program._id),
    category_id: category._id,
    cycle_id: cycle._id,
    status: applicant.status,
    merit_score: SCORED_STATUSES.includes(applicant.status) ? applicant.marks : null,
    eligibility_results: eligibilityResults,
    eligibility_checked_at: eligibilityResults.length ? addDays(cycle.start_date, index + 3) : null
  };
}

async function clearExistingDemoData() {
  const demoApplications = await AdmissionApplication.find({
    "personal.email": new RegExp(`@${DEMO_EMAIL_DOMAIN}$`)
  })
    .select("_id")
    .lean();

  if (!demoApplications.length) {
    return;
  }

  const applicationIds = demoApplications.map((application) => application._id);
  const deduplicationKeys = applicationIds.map((id) => `admission.enrolled:${id}`);

  await Promise.all([
    Student.deleteMany({ application_id: { $in: applicationIds } }),
    AdmissionApplicationDocument.deleteMany({ application_id: { $in: applicationIds } }),
    AdmissionFeeConfirmation.deleteMany({ application_id: { $in: applicationIds } }),
    MeritList.deleteMany({ application_id: { $in: applicationIds } }),
    SeatAllocation.deleteMany({ application_id: { $in: applicationIds } }),
    OutboxEvent.deleteMany({ deduplication_key: { $in: deduplicationKeys } })
  ]);

  await AdmissionApplication.deleteMany({ _id: { $in: applicationIds } });
}

async function loadContext() {
  const [cycles, programs, categories, criteria, documentTypes, academicYears, admin] = await Promise.all([
    AdmissionCycle.find({}).lean(),
    Program.find({}).lean(),
    AdmissionCategory.find({}).lean(),
    EligibilityCriteria.find({}).lean(),
    AdmissionDocumentType.find({}).lean(),
    AcademicYear.find({}).lean(),
    User.findOne({ role: "super_admin" }).select("_id").lean()
  ]);

  return {
    cycleByName: new Map(cycles.map((cycle) => [cycle.name, cycle])),
    cycleById: new Map(cycles.map((cycle) => [cycle._id.toString(), cycle])),
    programByCode: new Map(programs.map((program) => [program.code, program])),
    programById: new Map(programs.map((program) => [program._id.toString(), program])),
    categoryByCode: new Map(categories.map((category) => [category.code, category])),
    categoryById: new Map(categories.map((category) => [category._id.toString(), category])),
    criteriaByProgram: new Map(criteria.map((item) => [item.program_id.toString(), item])),
    documentTypeByName: new Map(documentTypes.map((documentType) => [documentType.name, documentType])),
    academicYearById: new Map(academicYears.map((academicYear) => [academicYear._id.toString(), academicYear])),
    adminId: admin?._id || null
  };
}

function resolveAppliedAt(applicant, index, cycle) {
  // Keep a couple of fresh applications so the "applications today" KPI is not zero.
  if (applicant.status === "applied") {
    return new Date();
  }
  return addDays(cycle.start_date, (index % 20) + 1);
}

async function insertApplications(context) {
  const payloads = [];
  DEMO_APPLICANTS.forEach((applicant, index) => {
    const payload = buildApplicationPayload(applicant, index, context);
    if (payload) {
      payloads.push({ applicant, payload, index });
    }
  });

  const created = await AdmissionApplication.insertMany(
    payloads.map((entry) => entry.payload),
    { ordered: true }
  );

  const entries = created.map((application, position) => {
    const { applicant, index } = payloads[position];
    const cycle = context.cycleById.get(application.cycle_id.toString());
    return {
      document: application,
      applicant,
      index,
      appliedAt: resolveAppliedAt(applicant, index, cycle)
    };
  });

  // Backdate the audit timestamps so reports show a realistic spread rather than
  // every application landing on the seed date. The raw driver is used because
  // Mongoose marks `createdAt` immutable once timestamps are enabled.
  await Promise.all(
    entries.map((entry) =>
      AdmissionApplication.collection.updateOne(
        { _id: entry.document._id },
        { $set: { createdAt: entry.appliedAt, updatedAt: addDays(entry.appliedAt, 2) } }
      )
    )
  );

  return entries;
}

async function resolveSeatTotals(entries, context) {
  const intakes = await IntakeCapacity.find({}).lean();
  const generalSeats = new Map();
  intakes
    .filter((intake) => !intake.category_id)
    .forEach((intake) => {
      generalSeats.set(`${intake.cycle_id}:${intake.program_id}`, intake.seats);
    });

  const totals = new Map();
  entries.forEach((entry) => {
    const programId = entry.document.program_preferences[0].toString();
    const key = `${entry.document.cycle_id}:${programId}`;
    if (totals.has(key)) {
      return;
    }
    const program = context.programById.get(programId);
    totals.set(key, generalSeats.get(key) || program?.intake_default || 60);
  });
  return totals;
}

async function seedMeritAndAllocations(entries, context) {
  const meritEntries = entries.filter((entry) => MERIT_STATUSES.includes(entry.applicant.status));
  if (!meritEntries.length) {
    return new Map();
  }

  const seatTotals = await resolveSeatTotals(meritEntries, context);
  const groups = new Map();
  meritEntries.forEach((entry) => {
    const programId = entry.document.program_preferences[0].toString();
    const key = `${entry.document.cycle_id}:${programId}`;
    const group = groups.get(key) || [];
    group.push(entry);
    groups.set(key, group);
  });

  const meritDocuments = [];
  const allocationPlans = [];

  groups.forEach((group, key) => {
    const [cycleId, programId] = key.split(":");
    const totalSeats = seatTotals.get(key) || 60;
    const ranked = [...group].sort((left, right) => right.applicant.marks - left.applicant.marks);
    const categoryRanks = new Map();
    const poolSeatCounters = new Map();
    let waitlistPosition = 0;

    ranked.forEach((entry, position) => {
      const categoryId = entry.document.category_id.toString();
      const categoryRank = (categoryRanks.get(categoryId) || 0) + 1;
      categoryRanks.set(categoryId, categoryRank);

      const category = context.categoryById.get(categoryId);
      const quotaSeats = category?.quota_percent
        ? Math.floor((totalSeats * category.quota_percent) / 100)
        : 0;
      const isAllotted = ALLOTTED_STATUSES.includes(entry.applicant.status);
      const isReserved = isAllotted && quotaSeats > 0 && categoryRank <= quotaSeats;
      const selectionPool = isAllotted ? (isReserved ? "reserved" : "open") : "not_selected";
      const generatedAt = addDays(entry.appliedAt, 10);

      meritDocuments.push({
        cycle_id: cycleId,
        program_id: programId,
        application_id: entry.document._id,
        category_id: entry.document.category_id,
        merit_score: entry.applicant.marks,
        overall_rank: position + 1,
        category_rank: categoryRank,
        quota_seats: quotaSeats,
        within_cutoff: isAllotted,
        selection_pool: selectionPool,
        generation_batch_id: `demo-batch-${slugify(key)}`,
        generated_by: context.adminId,
        generated_at: generatedAt
      });

      if (!isAllotted && entry.applicant.status !== "waitlisted") {
        return;
      }

      if (isAllotted) {
        const poolKey = isReserved ? `reserved:${categoryId}` : "open";
        const seatNumber = (poolSeatCounters.get(poolKey) || 0) + 1;
        poolSeatCounters.set(poolKey, seatNumber);
        allocationPlans.push({
          entry,
          cycleId,
          programId,
          categoryId,
          allocation_status: "allotted",
          selection_pool: isReserved ? "reserved" : "open",
          pool_key: poolKey,
          seat_number: seatNumber,
          waitlist_position: null,
          allotted_at: addDays(generatedAt, 3)
        });
        return;
      }

      waitlistPosition += 1;
      allocationPlans.push({
        entry,
        cycleId,
        programId,
        categoryId,
        allocation_status: "waitlisted",
        selection_pool: "waitlist",
        pool_key: "waitlist",
        seat_number: null,
        waitlist_position: waitlistPosition,
        allotted_at: null
      });
    });
  });

  const meritRecords = await MeritList.insertMany(meritDocuments, { ordered: true });
  const meritIdByApplication = new Map(
    meritRecords.map((record) => [record.application_id.toString(), record._id])
  );

  const allocationDocuments = allocationPlans.map((plan) => {
    const isApproved = APPROVED_STATUSES.includes(plan.entry.applicant.status);
    return {
      cycle_id: plan.cycleId,
      program_id: plan.programId,
      application_id: plan.entry.document._id,
      merit_list_id: meritIdByApplication.get(plan.entry.document._id.toString()),
      category_id: plan.categoryId,
      allocation_status: plan.allocation_status,
      selection_pool: plan.selection_pool,
      pool_key: plan.pool_key,
      seat_number: plan.seat_number,
      waitlist_position: plan.waitlist_position,
      allotted_at: plan.allotted_at,
      allocated_by: context.adminId,
      approval_status: isApproved ? "approved" : "pending",
      approval_remarks: isApproved ? "Documents verified and eligibility confirmed." : "",
      decided_by: isApproved ? context.adminId : null,
      decided_at: isApproved ? addDays(plan.allotted_at || plan.entry.appliedAt, 2) : null
    };
  });

  const allocations = await SeatAllocation.insertMany(allocationDocuments, { ordered: true });
  return new Map(allocations.map((allocation) => [allocation.application_id.toString(), allocation]));
}

async function seedFeeConfirmations(entries, context) {
  const payable = entries.filter((entry) => ["fee_pending", "enrolled"].includes(entry.applicant.status));
  if (!payable.length) {
    return new Map();
  }

  const documents = payable.map((entry, position) => {
    const programCode = context.programById.get(entry.document.program_preferences[0].toString())?.code;
    const totalFee = PROGRAM_FEES[programCode] || 30000;
    const isEnrolled = entry.applicant.status === "enrolled";
    const amountPaid = isEnrolled ? totalFee : Math.round(totalFee * 0.4);
    const sequence = String(position + 1).padStart(4, "0");

    return {
      application_id: entry.document._id,
      payment_id: `PAY-DEMO-${sequence}`,
      receipt_no: `RCPT-DEMO-${sequence}`,
      invoice_no: `INV-DEMO-${sequence}`,
      amount_paid: amountPaid,
      currency: "INR",
      payment_mode: PAYMENT_MODES[position % PAYMENT_MODES.length],
      fee_term: "admission",
      is_full_settlement: isEnrolled,
      pending_amount: isEnrolled ? 0 : totalFee - amountPaid,
      occurred_at: addDays(entry.appliedAt, 16),
      enrollment_trigger_status: isEnrolled ? "completed" : "not_ready",
      enrollment_error: "",
      raw_event: {
        event: "fees.admission_fee_confirmed",
        source: "demo-seed",
        total_fee: totalFee
      },
      confirmed_by: context.adminId
    };
  });

  const confirmations = await AdmissionFeeConfirmation.insertMany(documents, { ordered: true });
  return new Map(confirmations.map((confirmation) => [confirmation.application_id.toString(), confirmation]));
}

async function seedStudents(entries, context, allocationByApplication) {
  const enrolled = entries
    .filter((entry) => entry.applicant.status === "enrolled")
    .sort((left, right) => {
      const dateDifference = left.appliedAt - right.appliedAt;
      return dateDifference !== 0 ? dateDifference : right.applicant.marks - left.applicant.marks;
    });

  if (!enrolled.length) {
    return;
  }

  const studentSequences = new Map();
  const rollSequences = new Map();
  const documents = [];

  enrolled.forEach((entry) => {
    const allocation = allocationByApplication.get(entry.document._id.toString());
    const cycle = context.cycleById.get(entry.document.cycle_id.toString());
    const academicYear = context.academicYearById.get(cycle.academic_year_id.toString());
    const program = context.programById.get(
      (allocation?.program_id || entry.document.program_preferences[0]).toString()
    );
    if (!academicYear || !program) {
      return;
    }

    const studentKey = `student:${academicYear._id}`;
    const rollKey = `roll:${academicYear._id}:${program._id}`;
    const studentSequence = (studentSequences.get(studentKey) || 0) + 1;
    const rollSequence = (rollSequences.get(rollKey) || 0) + 1;
    studentSequences.set(studentKey, studentSequence);
    rollSequences.set(rollKey, rollSequence);

    const academicCode = compactCode(academicYear.code);
    documents.push({
      student_id: `STU-${academicCode}-${String(studentSequence).padStart(6, "0")}`,
      roll_no: `${compactCode(program.code)}-${academicCode}-${String(rollSequence).padStart(4, "0")}`,
      application_id: entry.document._id,
      personal: entry.document.personal.toObject(),
      academic: entry.document.academic.toObject(),
      guardians: entry.document.guardians.map((guardian) => guardian.toObject()),
      program_id: program._id,
      academic_year_id: academicYear._id,
      admission_cycle_id: cycle._id,
      category_id: entry.document.category_id,
      status: "active",
      documents: []
    });
  });

  await Student.insertMany(documents, { ordered: true });

  // Advance the shared counters so real enrollments never reuse a demo id.
  await Promise.all([
    ...[...studentSequences.entries()].map(([key, sequence]) =>
      SequenceCounter.updateOne({ key }, { $max: { sequence } }, { upsert: true })
    ),
    ...[...rollSequences.entries()].map(([key, sequence]) =>
      SequenceCounter.updateOne({ key }, { $max: { sequence } }, { upsert: true })
    )
  ]);

  const events = enrolled
    .map((entry) => {
      const student = documents.find(
        (document) => document.application_id.toString() === entry.document._id.toString()
      );
      if (!student) {
        return null;
      }
      const occurredAt = addDays(entry.appliedAt, 18);
      return {
        event: "admission.enrolled",
        deduplication_key: `admission.enrolled:${entry.document._id}`,
        occurred_at: occurredAt,
        payload: {
          event: "admission.enrolled",
          occurredAt: occurredAt.toISOString(),
          data: {
            applicationId: entry.document._id.toString(),
            studentId: student.student_id,
            rollNo: student.roll_no,
            programId: student.program_id.toString(),
            academicYearId: student.academic_year_id.toString(),
            admissionCycleId: student.admission_cycle_id.toString(),
            fullName: student.personal.full_name,
            email: student.personal.email,
            phone: student.personal.phone,
            categoryId: student.category_id.toString()
          }
        },
        delivery_status: "delivered",
        delivery_attempts: 1
      };
    })
    .filter(Boolean);

  if (events.length) {
    await OutboxEvent.insertMany(events, { ordered: false });
  }
}

async function seedApplicationDocuments(entries, context) {
  const uploadDirectory = path.resolve(__dirname, "..", "uploads", "admissions");
  await fs.mkdir(uploadDirectory, { recursive: true });

  const baseChecklist = ["Passport Size Photo", "Aadhaar Card", "10th Marksheet"];
  const documents = [];
  const fileWrites = [];

  entries.forEach((entry) => {
    const preferredCodes = new Set(
      entry.document.program_preferences.map(
        (programId) => context.programById.get(programId.toString())?.code
      )
    );
    const checklist = [...baseChecklist];
    if (preferredCodes.has("BCA")) {
      checklist.push("12th Marksheet");
    }
    if (preferredCodes.has("MBA-GEN")) {
      checklist.push("Graduation Marksheet");
    }

    const isVerified = VERIFIED_DOC_STATUSES.includes(entry.applicant.status);

    checklist.forEach((documentName, position) => {
      const documentType = context.documentTypeByName.get(documentName);
      if (!documentType) {
        return;
      }

      const storageName = `demo-${slugify(entry.applicant.name)}-${slugify(documentName)}.txt`;
      const absolutePath = path.join(uploadDirectory, storageName);
      const content = `Demo placeholder for ${documentName} submitted by ${entry.applicant.name}.\n`;
      fileWrites.push(fs.writeFile(absolutePath, content, "utf8"));

      const uploadedAt = addDays(entry.appliedAt, position + 1);
      documents.push({
        application_id: entry.document._id,
        document_type_id: documentType._id,
        original_name: `${slugify(documentName)}.txt`,
        storage_name: storageName,
        file_path: path.posix.join("uploads", "admissions", storageName),
        mime_type: "text/plain",
        size: Buffer.byteLength(content, "utf8"),
        verification_status: isVerified ? "verified" : "pending",
        verification_remarks: isVerified ? "Verified against original." : "",
        verified_by: isVerified ? context.adminId : null,
        verified_at: isVerified ? addDays(uploadedAt, 2) : null,
        uploaded_by: context.adminId
      });
    });
  });

  await Promise.all(fileWrites);
  if (documents.length) {
    await AdmissionApplicationDocument.insertMany(documents, { ordered: false });
  }
}

async function seedDemoAdmissionTransactions() {
  const context = await loadContext();
  if (!context.adminId) {
    console.warn("Skipped demo admission transactions: admin user is missing.");
    return;
  }
  if (!context.cycleByName.has(CURRENT_CYCLE)) {
    console.warn("Skipped demo admission transactions: admission cycles are missing.");
    return;
  }

  await clearExistingDemoData();

  const entries = await insertApplications(context);
  const allocationByApplication = await seedMeritAndAllocations(entries, context);
  await seedFeeConfirmations(entries, context);
  await seedStudents(entries, context, allocationByApplication);
  await seedApplicationDocuments(entries, context);

  console.log(`Demo admission transactions seeded: ${entries.length} applications.`);
}

module.exports = { seedDemoAdmissionTransactions, DEMO_EMAIL_DOMAIN };

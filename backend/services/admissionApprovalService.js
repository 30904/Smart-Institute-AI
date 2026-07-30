const mongoose = require("mongoose");

const AdmissionApplication = require("../models/AdmissionApplication");
const SeatAllocation = require("../models/SeatAllocation");

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

async function findPromotionCandidate(allocation) {
  const baseQuery = {
    cycle_id: allocation.cycle_id,
    program_id: allocation.program_id,
    allocation_status: "waitlisted"
  };

  if (allocation.selection_pool === "reserved") {
    const sameCategory = await SeatAllocation.findOne({
      ...baseQuery,
      category_id: allocation.category_id
    }).sort({ waitlist_position: 1 });
    if (sameCategory) return { candidate: sameCategory, preservePool: true };
  }

  const candidate = await SeatAllocation.findOne(baseQuery).sort({ waitlist_position: 1 });
  return candidate ? { candidate, preservePool: allocation.selection_pool === "open" } : null;
}

async function getNextOpenSeatNumber(allocation) {
  const highestOpenSeat = await SeatAllocation.findOne({
    cycle_id: allocation.cycle_id,
    program_id: allocation.program_id,
    allocation_status: "allotted",
    pool_key: "open",
    seat_number: { $ne: null }
  }).sort({ seat_number: -1 });
  return (highestOpenSeat?.seat_number || 0) + 1;
}

async function promoteWaitlistedApplicant(rejectedAllocation, userId) {
  const promotion = await findPromotionCandidate(rejectedAllocation);
  if (!promotion) return null;

  const { candidate, preservePool } = promotion;
  let poolKey = rejectedAllocation.released_pool_key;
  let seatNumber = rejectedAllocation.released_seat_number;
  let selectionPool = rejectedAllocation.selection_pool;

  if (!preservePool) {
    selectionPool = "open";
    poolKey = "open";
    seatNumber = await getNextOpenSeatNumber(rejectedAllocation);
  }

  candidate.allocation_status = "allotted";
  candidate.selection_pool = selectionPool;
  candidate.pool_key = poolKey;
  candidate.seat_number = seatNumber;
  candidate.waitlist_position = null;
  candidate.allotted_at = new Date();
  candidate.allocated_by = userId;
  candidate.approval_status = "pending";
  candidate.approval_remarks = "";
  candidate.decided_by = null;
  candidate.decided_at = null;
  await candidate.save();

  await AdmissionApplication.updateOne(
    { _id: candidate.application_id },
    { $set: { status: "allotted" } }
  );

  return candidate;
}

async function decideAdmission({ applicationId, decision, remarks, userId }) {
  requireValidId(applicationId, "application_id");
  if (!["approve", "reject"].includes(decision)) {
    const error = new Error("decision must be approve or reject.");
    error.statusCode = 400;
    throw error;
  }
  if (decision === "reject" && !String(remarks || "").trim()) {
    const error = new Error("Rejection remarks are required.");
    error.statusCode = 400;
    throw error;
  }

  const application = await AdmissionApplication.findById(applicationId);
  if (!application) {
    const error = new Error("Admission application not found.");
    error.statusCode = 404;
    throw error;
  }
  if (application.status !== "allotted") {
    const error = new Error("Only an allotted application can be approved or rejected.");
    error.statusCode = 409;
    throw error;
  }

  const allocation = await SeatAllocation.findOne({
    application_id: applicationId,
    cycle_id: application.cycle_id,
    allocation_status: "allotted"
  });
  if (!allocation) {
    const error = new Error("Active seat allotment not found for this application.");
    error.statusCode = 409;
    throw error;
  }
  if (allocation.approval_status !== "pending") {
    const error = new Error("The committee decision has already been recorded.");
    error.statusCode = 409;
    throw error;
  }

  const decidedAt = new Date();
  allocation.approval_status = decision === "approve" ? "approved" : "rejected";
  allocation.approval_remarks = String(remarks || "").trim();
  allocation.decided_by = userId;
  allocation.decided_at = decidedAt;

  let promotedAllocation = null;
  if (decision === "approve") {
    application.status = "approved";
    await allocation.save();
    await application.save();
  } else {
    allocation.released_pool_key = allocation.pool_key;
    allocation.released_seat_number = allocation.seat_number;
    allocation.allocation_status = "rejected";
    allocation.pool_key = "released";
    allocation.seat_number = null;
    allocation.waitlist_position = null;
    application.status = "rejected";
    await allocation.save();
    await application.save();
    promotedAllocation = await promoteWaitlistedApplicant(allocation, userId);
  }

  return {
    application_id: application._id.toString(),
    status: application.status,
    decision,
    decided_at: decidedAt,
    allocation: sanitizeAllocation(allocation),
    promoted_allocation: promotedAllocation ? sanitizeAllocation(promotedAllocation) : null
  };
}

module.exports = { decideAdmission };

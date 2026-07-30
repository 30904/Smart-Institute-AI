const crypto = require("crypto");
const mongoose = require("mongoose");

const AdmissionApplication = require("../models/AdmissionApplication");
const AdmissionCategory = require("../models/AdmissionCategory");
const AdmissionCycle = require("../models/AdmissionCycle");
const IntakeCapacity = require("../models/IntakeCapacity");
const MeritList = require("../models/MeritList");
const Program = require("../models/Program");

function requireValidId(value, field) {
  if (!mongoose.isValidObjectId(value)) {
    const error = new Error(`${field} contains an invalid id.`);
    error.statusCode = 400;
    throw error;
  }
}

async function ensureRecord(Model, id, field) {
  requireValidId(id, field);
  const exists = await Model.exists({ _id: id });
  if (!exists) {
    const error = new Error(`${field} references a record that does not exist.`);
    error.statusCode = 400;
    throw error;
  }
}

function sanitizeMeritRecord(document) {
  const value = document.toObject ? document.toObject() : document;
  return {
    ...value,
    id: value._id.toString(),
    _id: undefined,
    __v: undefined
  };
}

async function resolveSeatPlan(cycleId, programId) {
  const [intakes, categories] = await Promise.all([
    IntakeCapacity.find({ cycle_id: cycleId, program_id: programId }).lean(),
    AdmissionCategory.find({ is_active: true }).lean()
  ]);

  if (!intakes.length) {
    const error = new Error("Intake capacity is not configured for this cycle and program.");
    error.statusCode = 400;
    throw error;
  }

  const generalIntake = intakes.find((intake) => !intake.category_id);
  const explicitQuotas = new Map(
    intakes.filter((intake) => intake.category_id).map((intake) => [intake.category_id.toString(), intake.seats])
  );
  const totalSeats = generalIntake
    ? generalIntake.seats
    : [...explicitQuotas.values()].reduce((total, seats) => total + seats, 0);

  if (totalSeats < 1) {
    const error = new Error("Configured intake capacity must contain at least one seat.");
    error.statusCode = 400;
    throw error;
  }

  const quotaSeats = new Map(explicitQuotas);
  if (generalIntake) {
    categories.forEach((category) => {
      const categoryId = category._id.toString();
      if (!quotaSeats.has(categoryId) && category.quota_percent !== null && category.quota_percent !== undefined) {
        quotaSeats.set(categoryId, Math.floor((totalSeats * category.quota_percent) / 100));
      }
    });
  }

  const reservedSeatTotal = [...quotaSeats.values()].reduce((total, seats) => total + seats, 0);
  if (reservedSeatTotal > totalSeats) {
    const error = new Error("Category quota seats exceed the configured total intake capacity.");
    error.statusCode = 400;
    throw error;
  }

  return { totalSeats, quotaSeats };
}

function rankCandidates(applications, totalSeats, quotaSeats) {
  const sorted = [...applications].sort((left, right) => {
    const scoreDifference = Number(right.merit_score) - Number(left.merit_score);
    if (scoreDifference !== 0) return scoreDifference;
    const dateDifference = new Date(left.createdAt) - new Date(right.createdAt);
    if (dateDifference !== 0) return dateDifference;
    return left._id.toString().localeCompare(right._id.toString());
  });

  const categoryCounts = new Map();
  const selectedApplicationIds = new Set();
  const ranked = sorted.map((application, index) => {
    const categoryId = application.category_id.toString();
    const categoryRank = (categoryCounts.get(categoryId) || 0) + 1;
    categoryCounts.set(categoryId, categoryRank);
    const categorySeatCount = quotaSeats.get(categoryId) || 0;
    const reserved = categorySeatCount > 0 && categoryRank <= categorySeatCount;
    if (reserved) selectedApplicationIds.add(application._id.toString());

    return {
      application,
      overall_rank: index + 1,
      category_rank: categoryRank,
      quota_seats: categorySeatCount,
      within_cutoff: reserved,
      selection_pool: reserved ? "reserved" : "not_selected"
    };
  });

  let remainingSeats = Math.max(0, totalSeats - selectedApplicationIds.size);
  ranked.forEach((entry) => {
    const applicationId = entry.application._id.toString();
    if (remainingSeats > 0 && !selectedApplicationIds.has(applicationId)) {
      entry.within_cutoff = true;
      entry.selection_pool = "open";
      selectedApplicationIds.add(applicationId);
      remainingSeats -= 1;
    }
  });

  return ranked;
}

async function generateMeritList({ cycleId, programId, userId }) {
  await Promise.all([
    ensureRecord(AdmissionCycle, cycleId, "cycle_id"),
    ensureRecord(Program, programId, "program_id")
  ]);

  const { totalSeats, quotaSeats } = await resolveSeatPlan(cycleId, programId);
  const applications = await AdmissionApplication.find({
    cycle_id: cycleId,
    status: { $in: ["eligible", "merit_listed"] },
    program_preferences: programId,
    merit_score: { $ne: null },
    eligibility_results: {
      $elemMatch: {
        program_id: programId,
        is_eligible: true
      }
    }
  });

  if (!applications.length) {
    const error = new Error("No eligible applications with merit scores were found.");
    error.statusCode = 400;
    throw error;
  }

  const ranked = rankCandidates(applications, totalSeats, quotaSeats);
  const generatedAt = new Date();
  const generationBatchId = crypto.randomUUID();
  const operations = ranked.map((entry) => ({
    updateOne: {
      filter: {
        cycle_id: cycleId,
        program_id: programId,
        application_id: entry.application._id
      },
      update: {
        $set: {
          category_id: entry.application.category_id,
          merit_score: entry.application.merit_score,
          overall_rank: entry.overall_rank,
          category_rank: entry.category_rank,
          quota_seats: entry.quota_seats,
          within_cutoff: entry.within_cutoff,
          selection_pool: entry.selection_pool,
          generation_batch_id: generationBatchId,
          generated_by: userId,
          generated_at: generatedAt
        }
      },
      upsert: true
    }
  }));

  await MeritList.bulkWrite(operations);
  const applicationIds = applications.map((application) => application._id);
  await Promise.all([
    MeritList.deleteMany({
      cycle_id: cycleId,
      program_id: programId,
      application_id: { $nin: applicationIds }
    }),
    AdmissionApplication.updateMany(
      { _id: { $in: applicationIds } },
      { $set: { status: "merit_listed" } }
    )
  ]);

  const records = await MeritList.find({ cycle_id: cycleId, program_id: programId }).sort({ overall_rank: 1 });
  return {
    cycle_id: String(cycleId),
    program_id: String(programId),
    generation_batch_id: generationBatchId,
    generated_at: generatedAt,
    total_seats: totalSeats,
    total_ranked: records.length,
    within_cutoff: records.filter((record) => record.within_cutoff).length,
    records: records.map(sanitizeMeritRecord)
  };
}

async function listMeritRecords({ cycleId, programId }) {
  requireValidId(cycleId, "cycle_id");
  requireValidId(programId, "program_id");
  const records = await MeritList.find({ cycle_id: cycleId, program_id: programId }).sort({ overall_rank: 1 });
  return records.map(sanitizeMeritRecord);
}

module.exports = { generateMeritList, listMeritRecords, resolveSeatPlan };

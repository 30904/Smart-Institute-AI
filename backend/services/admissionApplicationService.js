const mongoose = require("mongoose");

const AdmissionApplication = require("../models/AdmissionApplication");
const AdmissionCategory = require("../models/AdmissionCategory");
const AdmissionCycle = require("../models/AdmissionCycle");
const AdmissionStatus = require("../models/AdmissionStatus");
const Program = require("../models/Program");

function sanitizeApplication(document) {
  const value = document.toObject ? document.toObject() : document;
  return {
    ...value,
    id: value._id.toString(),
    _id: undefined,
    __v: undefined
  };
}

function normalizeModelError(error) {
  if (error?.code === 11000) {
    error.statusCode = 409;
    error.message = "An application with the same unique values already exists.";
  } else if (error?.name === "ValidationError" || error?.name === "CastError") {
    error.statusCode = 400;
  }
  return error;
}

function requireValidObjectId(value, field) {
  if (!mongoose.isValidObjectId(value)) {
    const error = new Error(`${field} contains an invalid id.`);
    error.statusCode = 400;
    throw error;
  }
}

async function ensureReference(Model, id, field) {
  requireValidObjectId(id, field);
  const exists = await Model.exists({ _id: id });
  if (!exists) {
    const error = new Error(`${field} references a record that does not exist.`);
    error.statusCode = 400;
    throw error;
  }
}

async function validateApplicationReferences(payload) {
  if (payload.cycle_id !== undefined) {
    await ensureReference(AdmissionCycle, payload.cycle_id, "cycle_id");
  }
  if (payload.category_id !== undefined) {
    await ensureReference(AdmissionCategory, payload.category_id, "category_id");
  }
  if (payload.program_preferences !== undefined) {
    if (!Array.isArray(payload.program_preferences) || !payload.program_preferences.length) {
      const error = new Error("program_preferences must contain at least one program id.");
      error.statusCode = 400;
      throw error;
    }

    payload.program_preferences.forEach((id) => requireValidObjectId(id, "program_preferences"));
    const uniqueIds = [...new Set(payload.program_preferences.map(String))];
    if (uniqueIds.length !== payload.program_preferences.length) {
      const error = new Error("program_preferences must contain unique program ids.");
      error.statusCode = 400;
      throw error;
    }

    const programCount = await Program.countDocuments({ _id: { $in: uniqueIds } });
    if (programCount !== uniqueIds.length) {
      const error = new Error("program_preferences references a program that does not exist.");
      error.statusCode = 400;
      throw error;
    }
  }
}

function buildApplicationFilter(filters = {}) {
  const query = {};

  if (filters.cycle_id) {
    requireValidObjectId(filters.cycle_id, "cycle_id");
    query.cycle_id = filters.cycle_id;
  }

  if (filters.status) {
    if (!AdmissionStatus.STATUS_CODES.includes(filters.status)) {
      const error = new Error("Invalid admission application status.");
      error.statusCode = 400;
      throw error;
    }
    query.status = filters.status;
  }

  return query;
}

async function listApplications(filters) {
  try {
    const query = buildApplicationFilter(filters);
    const documents = await AdmissionApplication.find(query).sort({ createdAt: -1 });
    return documents.map(sanitizeApplication);
  } catch (error) {
    throw normalizeModelError(error);
  }
}

async function getApplicationById(id) {
  try {
    const document = await AdmissionApplication.findById(id);
    if (!document) {
      const error = new Error("Admission application not found.");
      error.statusCode = 404;
      throw error;
    }
    return sanitizeApplication(document);
  } catch (error) {
    throw normalizeModelError(error);
  }
}

async function createApplication(payload) {
  try {
    await validateApplicationReferences(payload);
    const document = await AdmissionApplication.create({
      ...payload,
      status: payload.status || "applied"
    });
    return sanitizeApplication(document);
  } catch (error) {
    throw normalizeModelError(error);
  }
}

async function updateApplication(id, payload) {
  try {
    await validateApplicationReferences(payload);
    const document = await AdmissionApplication.findById(id);
    if (!document) {
      const error = new Error("Admission application not found.");
      error.statusCode = 404;
      throw error;
    }

    document.set(payload);
    await document.save();
    return sanitizeApplication(document);
  } catch (error) {
    throw normalizeModelError(error);
  }
}

module.exports = {
  listApplications,
  getApplicationById,
  createApplication,
  updateApplication
};

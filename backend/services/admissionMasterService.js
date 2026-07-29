const mongoose = require("mongoose");

const AcademicYear = require("../models/AcademicYear");
const AdmissionCategory = require("../models/AdmissionCategory");
const AdmissionCycle = require("../models/AdmissionCycle");
const AdmissionDocumentType = require("../models/AdmissionDocumentType");
const AdmissionFeeMapping = require("../models/AdmissionFeeMapping");
const AdmissionStatus = require("../models/AdmissionStatus");
const EligibilityCriteria = require("../models/EligibilityCriteria");
const IntakeCapacity = require("../models/IntakeCapacity");
const Program = require("../models/Program");
const ScholarshipRule = require("../models/ScholarshipRule");

const MASTER_CONFIGS = {
  "admission-cycles": {
    label: "Admission cycle",
    Model: AdmissionCycle,
    sort: { start_date: -1 },
    references: [{ field: "academic_year_id", Model: AcademicYear }]
  },
  "intake-capacities": {
    label: "Intake capacity",
    Model: IntakeCapacity,
    sort: { createdAt: -1 },
    references: [
      { field: "cycle_id", Model: AdmissionCycle },
      { field: "program_id", Model: Program },
      { field: "category_id", Model: AdmissionCategory, optional: true }
    ]
  },
  categories: {
    label: "Admission category",
    Model: AdmissionCategory,
    sort: { name: 1 }
  },
  "eligibility-criteria": {
    label: "Eligibility criteria",
    Model: EligibilityCriteria,
    sort: { createdAt: -1 },
    references: [{ field: "program_id", Model: Program }]
  },
  "document-types": {
    label: "Admission document type",
    Model: AdmissionDocumentType,
    sort: { name: 1 },
    references: [{ field: "applies_to_program_ids", Model: Program, many: true, optional: true }]
  },
  "fee-mappings": {
    label: "Admission fee mapping",
    Model: AdmissionFeeMapping,
    sort: { createdAt: -1 },
    references: [
      { field: "program_id", Model: Program },
      { field: "cycle_id", Model: AdmissionCycle },
      { field: "fee_structure_id" }
    ]
  },
  "scholarship-rules": {
    label: "Scholarship rule",
    Model: ScholarshipRule,
    sort: { name: 1 }
  },
  statuses: {
    label: "Admission status",
    Model: AdmissionStatus,
    sort: { sort_order: 1 }
  }
};

const OPTION_CONFIGS = {
  academicYears: { Model: AcademicYear, sort: { start_date: -1 }, labelField: "name" },
  programs: { Model: Program, sort: { name: 1 }, labelField: "name", codeField: "code" },
  cycles: { Model: AdmissionCycle, sort: { start_date: -1 }, labelField: "name" },
  categories: { Model: AdmissionCategory, sort: { name: 1 }, labelField: "name", codeField: "code" }
};

function getMasterConfig(resource) {
  const config = MASTER_CONFIGS[resource];
  if (!config) {
    const error = new Error("Admission master resource not found.");
    error.statusCode = 404;
    throw error;
  }
  return config;
}

function sanitizeDocument(document) {
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
    error.message = "A record with the same unique values already exists.";
  } else if (error?.name === "ValidationError" || error?.name === "CastError") {
    error.statusCode = 400;
  }
  return error;
}

function validateObjectIds(field, values) {
  if (values.some((value) => !mongoose.isValidObjectId(value))) {
    const error = new Error(`${field} contains an invalid id.`);
    error.statusCode = 400;
    throw error;
  }
}

async function validateReferences(config, payload) {
  for (const reference of config.references || []) {
    if (payload[reference.field] === undefined) continue;

    if (reference.many && !Array.isArray(payload[reference.field])) {
      const error = new Error(`${reference.field} must be an array.`);
      error.statusCode = 400;
      throw error;
    }

    const values = reference.many ? payload[reference.field] || [] : [payload[reference.field]];
    const populatedValues = values.filter(Boolean);
    if (!populatedValues.length && reference.optional) continue;

    validateObjectIds(reference.field, populatedValues);
    if (!reference.Model || !populatedValues.length) continue;

    const count = await reference.Model.countDocuments({ _id: { $in: populatedValues } });
    if (count !== new Set(populatedValues.map(String)).size) {
      const error = new Error(`${reference.field} references a record that does not exist.`);
      error.statusCode = 400;
      throw error;
    }
  }
}

async function listAdmissionMasters(resource) {
  const config = getMasterConfig(resource);
  const documents = await config.Model.find({}).sort(config.sort);
  return documents.map(sanitizeDocument);
}

async function listAdmissionMasterOptions(source) {
  const config = OPTION_CONFIGS[source];
  if (!config) {
    const error = new Error("Admission master option source not found.");
    error.statusCode = 404;
    throw error;
  }

  const documents = await config.Model.find({}).sort(config.sort).lean();
  return documents.map((document) => ({
    value: document._id.toString(),
    label: config.codeField ? `${document[config.labelField]} (${document[config.codeField]})` : document[config.labelField]
  }));
}

async function getAdmissionMasterById(resource, id) {
  const config = getMasterConfig(resource);
  try {
    const document = await config.Model.findById(id);
    if (!document) {
      const error = new Error(`${config.label} not found.`);
      error.statusCode = 404;
      throw error;
    }
    return sanitizeDocument(document);
  } catch (error) {
    throw normalizeModelError(error);
  }
}

async function createAdmissionMaster(resource, payload) {
  const config = getMasterConfig(resource);
  try {
    await validateReferences(config, payload);
    const document = await config.Model.create(payload);
    return sanitizeDocument(document);
  } catch (error) {
    throw normalizeModelError(error);
  }
}

async function updateAdmissionMaster(resource, id, payload) {
  const config = getMasterConfig(resource);
  try {
    await validateReferences(config, payload);
    const document = await config.Model.findById(id);
    if (!document) {
      const error = new Error(`${config.label} not found.`);
      error.statusCode = 404;
      throw error;
    }

    document.set(payload);
    await document.save();
    return sanitizeDocument(document);
  } catch (error) {
    throw normalizeModelError(error);
  }
}

async function deleteAdmissionMaster(resource, id) {
  const config = getMasterConfig(resource);
  try {
    const document = await config.Model.findByIdAndDelete(id);
    if (!document) {
      const error = new Error(`${config.label} not found.`);
      error.statusCode = 404;
      throw error;
    }
    return sanitizeDocument(document);
  } catch (error) {
    throw normalizeModelError(error);
  }
}

module.exports = {
  getMasterConfig,
  listAdmissionMasters,
  listAdmissionMasterOptions,
  getAdmissionMasterById,
  createAdmissionMaster,
  updateAdmissionMaster,
  deleteAdmissionMaster
};

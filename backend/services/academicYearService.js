const AcademicYear = require("../models/AcademicYear");

function sanitizeAcademicYear(doc) {
  return {
    id: doc._id.toString(),
    name: doc.name,
    code: doc.code,
    start_date: doc.start_date,
    end_date: doc.end_date,
    is_current: Boolean(doc.is_current),
    is_active: Boolean(doc.is_active),
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt
  };
}

async function listAcademicYears() {
  const docs = await AcademicYear.find({}).sort({ start_date: -1 });
  return docs.map(sanitizeAcademicYear);
}

async function getAcademicYearById(id) {
  const doc = await AcademicYear.findById(id);
  if (!doc) {
    const err = new Error("Academic year not found.");
    err.statusCode = 404;
    throw err;
  }
  return sanitizeAcademicYear(doc);
}

async function createAcademicYear(payload) {
  const name = String(payload.name || "").trim();
  const code = String(payload.code || "").trim();
  const start_date = payload.start_date ? new Date(payload.start_date) : null;
  const end_date = payload.end_date ? new Date(payload.end_date) : null;

  if (!name || !code || !start_date || Number.isNaN(start_date.getTime()) || !end_date || Number.isNaN(end_date.getTime())) {
    const err = new Error("name, code, start_date, and end_date are required.");
    err.statusCode = 400;
    throw err;
  }

  const duplicate = await AcademicYear.findOne({ code }).lean();
  if (duplicate) {
    const err = new Error("Academic year code already exists.");
    err.statusCode = 409;
    throw err;
  }

  const doc = await AcademicYear.create({
    name,
    code,
    start_date,
    end_date,
    is_current: Boolean(payload.is_current),
    is_active: payload.is_active === undefined ? true : Boolean(payload.is_active)
  });

  if (doc.is_current) {
    await AcademicYear.updateMany({ _id: { $ne: doc._id } }, { $set: { is_current: false } });
  }

  return sanitizeAcademicYear(doc);
}

async function updateAcademicYear(id, payload) {
  const doc = await AcademicYear.findById(id);
  if (!doc) {
    const err = new Error("Academic year not found.");
    err.statusCode = 404;
    throw err;
  }

  if (payload.name !== undefined) doc.name = String(payload.name || "").trim();
  if (payload.code !== undefined) doc.code = String(payload.code || "").trim();
  if (payload.start_date !== undefined) doc.start_date = new Date(payload.start_date);
  if (payload.end_date !== undefined) doc.end_date = new Date(payload.end_date);
  if (payload.is_active !== undefined) doc.is_active = Boolean(payload.is_active);
  if (payload.is_current !== undefined) doc.is_current = Boolean(payload.is_current);

  await doc.save();

  if (doc.is_current) {
    await AcademicYear.updateMany({ _id: { $ne: doc._id } }, { $set: { is_current: false } });
  }

  return sanitizeAcademicYear(doc);
}

async function setCurrentAcademicYear(id) {
  const doc = await AcademicYear.findById(id);
  if (!doc) {
    const err = new Error("Academic year not found.");
    err.statusCode = 404;
    throw err;
  }

  await AcademicYear.updateMany({}, { $set: { is_current: false } });
  doc.is_current = true;
  await doc.save();
  return sanitizeAcademicYear(doc);
}

module.exports = {
  listAcademicYears,
  getAcademicYearById,
  createAcademicYear,
  updateAcademicYear,
  setCurrentAcademicYear
};

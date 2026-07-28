const Department = require("../models/Department");
const Program = require("../models/Program");

function sanitizeProgram(doc) {
  return {
    id: doc._id.toString(),
    name: doc.name,
    code: doc.code,
    department_id: doc.department_id ? doc.department_id.toString() : null,
    duration: doc.duration,
    program_type: doc.program_type,
    intake_default: doc.intake_default,
    description: doc.description || "",
    is_active: Boolean(doc.is_active),
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt
  };
}

async function ensureDepartmentExists(departmentId) {
  if (!departmentId) {
    const err = new Error("department_id is required.");
    err.statusCode = 400;
    throw err;
  }
  const exists = await Department.findById(departmentId).lean();
  if (!exists) {
    const err = new Error("Invalid department_id.");
    err.statusCode = 400;
    throw err;
  }
}

async function listPrograms() {
  const docs = await Program.find({}).sort({ name: 1 });
  return docs.map(sanitizeProgram);
}

async function getProgramById(id) {
  const doc = await Program.findById(id);
  if (!doc) {
    const err = new Error("Program not found.");
    err.statusCode = 404;
    throw err;
  }
  return sanitizeProgram(doc);
}

async function createProgram(payload) {
  const name = String(payload.name || "").trim();
  const code = String(payload.code || "").trim();
  const duration = Number(payload.duration);
  const program_type = String(payload.program_type || "").trim();

  if (!name || !code || !duration || !program_type) {
    const err = new Error("name, code, department_id, duration, and program_type are required.");
    err.statusCode = 400;
    throw err;
  }

  await ensureDepartmentExists(payload.department_id);

  const duplicate = await Program.findOne({ code }).lean();
  if (duplicate) {
    const err = new Error("Program code already exists.");
    err.statusCode = 409;
    throw err;
  }

  const doc = await Program.create({
    name,
    code,
    department_id: payload.department_id,
    duration,
    program_type,
    intake_default: Number(payload.intake_default || 0),
    description: String(payload.description || "").trim(),
    is_active: payload.is_active === undefined ? true : Boolean(payload.is_active)
  });

  return sanitizeProgram(doc);
}

async function updateProgram(id, payload) {
  const doc = await Program.findById(id);
  if (!doc) {
    const err = new Error("Program not found.");
    err.statusCode = 404;
    throw err;
  }

  if (payload.department_id !== undefined) {
    await ensureDepartmentExists(payload.department_id);
    doc.department_id = payload.department_id;
  }

  if (payload.name !== undefined) doc.name = String(payload.name || "").trim();
  if (payload.code !== undefined) doc.code = String(payload.code || "").trim();
  if (payload.duration !== undefined) doc.duration = Number(payload.duration);
  if (payload.program_type !== undefined) doc.program_type = String(payload.program_type || "").trim();
  if (payload.intake_default !== undefined) doc.intake_default = Number(payload.intake_default || 0);
  if (payload.description !== undefined) doc.description = String(payload.description || "").trim();
  if (payload.is_active !== undefined) doc.is_active = Boolean(payload.is_active);

  await doc.save();
  return sanitizeProgram(doc);
}

module.exports = {
  listPrograms,
  getProgramById,
  createProgram,
  updateProgram
};

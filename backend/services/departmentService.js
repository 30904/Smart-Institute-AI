const Department = require("../models/Department");

function sanitizeDepartment(doc) {
  return {
    id: doc._id.toString(),
    name: doc.name,
    code: doc.code,
    head_user_id: doc.head_user_id ? doc.head_user_id.toString() : null,
    is_active: Boolean(doc.is_active),
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt
  };
}

async function listDepartments() {
  const docs = await Department.find({}).sort({ name: 1 });
  return docs.map(sanitizeDepartment);
}

async function getDepartmentById(id) {
  const doc = await Department.findById(id);
  if (!doc) {
    const err = new Error("Department not found.");
    err.statusCode = 404;
    throw err;
  }
  return sanitizeDepartment(doc);
}

async function createDepartment(payload) {
  const name = String(payload.name || "").trim();
  const code = String(payload.code || "").trim();

  if (!name || !code) {
    const err = new Error("name and code are required.");
    err.statusCode = 400;
    throw err;
  }

  const duplicate = await Department.findOne({ code }).lean();
  if (duplicate) {
    const err = new Error("Department code already exists.");
    err.statusCode = 409;
    throw err;
  }

  const doc = await Department.create({
    name,
    code,
    head_user_id: payload.head_user_id || null,
    is_active: payload.is_active === undefined ? true : Boolean(payload.is_active)
  });

  return sanitizeDepartment(doc);
}

async function updateDepartment(id, payload) {
  const doc = await Department.findById(id);
  if (!doc) {
    const err = new Error("Department not found.");
    err.statusCode = 404;
    throw err;
  }

  if (payload.name !== undefined) doc.name = String(payload.name || "").trim();
  if (payload.code !== undefined) doc.code = String(payload.code || "").trim();
  if (payload.head_user_id !== undefined) doc.head_user_id = payload.head_user_id || null;
  if (payload.is_active !== undefined) doc.is_active = Boolean(payload.is_active);

  await doc.save();
  return sanitizeDepartment(doc);
}

module.exports = {
  listDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment
};

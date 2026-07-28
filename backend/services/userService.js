const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Role = require("../models/Role");
const Permission = require("../models/Permission");
const UserMenuOverride = require("../models/UserMenuOverride");

function sanitizeUser(userDoc) {
  return {
    id: userDoc._id.toString(),
    name: userDoc.name,
    email: userDoc.email,
    phone: userDoc.phone || "",
    role: userDoc.role || "",
    role_id: userDoc.role_id ? userDoc.role_id.toString() : null,
    department_id: userDoc.department_id ? userDoc.department_id.toString() : null,
    linked_faculty_id: userDoc.linked_faculty_id ? userDoc.linked_faculty_id.toString() : null,
    linked_student_id: userDoc.linked_student_id ? userDoc.linked_student_id.toString() : null,
    is_active: Boolean(userDoc.is_active),
    createdAt: userDoc.createdAt,
    updatedAt: userDoc.updatedAt
  };
}

async function resolveRole(roleId, roleCode) {
  if (roleId) {
    const role = await Role.findById(roleId).lean();
    if (!role) {
      const err = new Error("Invalid role_id.");
      err.statusCode = 400;
      throw err;
    }
    return role;
  }

  if (roleCode) {
    const role = await Role.findOne({ code: roleCode }).lean();
    if (!role) {
      const err = new Error("Invalid role.");
      err.statusCode = 400;
      throw err;
    }
    return role;
  }

  return null;
}

async function listUsers() {
  const users = await User.find({}).sort({ createdAt: -1 });
  return users.map(sanitizeUser);
}

async function getUserById(userId) {
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error("User not found.");
    err.statusCode = 404;
    throw err;
  }
  return sanitizeUser(user);
}

async function createUser(payload) {
  const name = String(payload.name || "").trim();
  const email = String(payload.email || "").toLowerCase().trim();

  if (!name || !email) {
    const err = new Error("name and email are required.");
    err.statusCode = 400;
    throw err;
  }

  const role = await resolveRole(payload.role_id, payload.role);
  const existing = await User.findOne({ email }).lean();
  if (existing) {
    const err = new Error("Email already exists.");
    err.statusCode = 409;
    throw err;
  }

  const plainPassword = payload.password || process.env.DEFAULT_USER_PASSWORD || "ChangeMe@123";
  const password_hash = await bcrypt.hash(plainPassword, 10);

  const user = await User.create({
    name,
    email,
    phone: payload.phone || "",
    password_hash,
    role_id: role?._id || null,
    role: role?.code || "",
    department_id: payload.department_id || null,
    linked_faculty_id: payload.linked_faculty_id || null,
    linked_student_id: payload.linked_student_id || null,
    permissions: Array.isArray(payload.permissions) ? payload.permissions : [],
    is_active: true
  });

  return sanitizeUser(user);
}

async function updateUser(userId, payload) {
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error("User not found.");
    err.statusCode = 404;
    throw err;
  }

  if (payload.email) {
    const normalizedEmail = String(payload.email).toLowerCase().trim();
    const duplicate = await User.findOne({ email: normalizedEmail, _id: { $ne: userId } }).lean();
    if (duplicate) {
      const err = new Error("Email already exists.");
      err.statusCode = 409;
      throw err;
    }
    user.email = normalizedEmail;
  }

  if (payload.name) user.name = String(payload.name).trim();
  if (payload.phone !== undefined) user.phone = payload.phone || "";
  if (payload.department_id !== undefined) user.department_id = payload.department_id || null;
  if (payload.linked_faculty_id !== undefined) user.linked_faculty_id = payload.linked_faculty_id || null;
  if (payload.linked_student_id !== undefined) user.linked_student_id = payload.linked_student_id || null;

  if (payload.role_id || payload.role) {
    const role = await resolveRole(payload.role_id, payload.role);
    user.role_id = role?._id || null;
    user.role = role?.code || "";
  }

  if (Array.isArray(payload.permissions)) {
    user.permissions = payload.permissions;
  }

  await user.save();
  return sanitizeUser(user);
}

async function deactivateUser(userId) {
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error("User not found.");
    err.statusCode = 404;
    throw err;
  }

  user.is_active = false;
  await user.save();
  return sanitizeUser(user);
}

async function setUserPermissionOverrides(userId, payload) {
  const user = await User.findById(userId).lean();
  if (!user) {
    const err = new Error("User not found.");
    err.statusCode = 404;
    throw err;
  }

  const overrides = Array.isArray(payload?.overrides) ? payload.overrides : null;
  if (!overrides || !overrides.length) {
    const err = new Error("overrides array is required.");
    err.statusCode = 400;
    throw err;
  }

  const normalizedKeys = overrides.map((item) => String(item.key || "").trim()).filter(Boolean);
  const uniqueKeys = [...new Set(normalizedKeys)];
  const permissions = await Permission.find({ key: { $in: uniqueKeys } }).lean();
  const permissionByKey = new Map(permissions.map((permission) => [permission.key, permission]));

  const bulkOps = [];
  const applied = [];

  for (const item of overrides) {
    const key = String(item.key || "").trim();
    if (!key) continue;
    const permission = permissionByKey.get(key);
    if (!permission) {
      const err = new Error(`Invalid permission key: ${key}`);
      err.statusCode = 400;
      throw err;
    }

    const granted = Boolean(item.granted);
    bulkOps.push({
      updateOne: {
        filter: { user_id: userId, permission_id: permission._id },
        update: {
          $set: {
            user_id: userId,
            permission_id: permission._id,
            granted
          }
        },
        upsert: true
      }
    });

    applied.push({ key, granted });
  }

  if (bulkOps.length) {
    await UserMenuOverride.bulkWrite(bulkOps, { ordered: false });
  }

  return {
    user_id: userId,
    appliedCount: applied.length,
    overrides: applied
  };
}

module.exports = {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deactivateUser,
  setUserPermissionOverrides
};

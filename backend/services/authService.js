const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Role = require("../models/Role");
const Permission = require("../models/Permission");
const RolePermission = require("../models/RolePermission");
const UserMenuOverride = require("../models/UserMenuOverride");
const { signJwt } = require("../utils/jwt");

async function ensureDefaultAdmin() {
  const email = process.env.ADMIN_EMAIL || "admin@celeris.com";
  const password = process.env.ADMIN_PASSWORD || "Admin@123";

  const existingUser = await User.findOne({ email }).lean();
  if (existingUser) {
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const superAdminRole = await Role.findOne({ code: "super_admin" }).lean();

  await User.create({
    name: "System Admin",
    email,
    phone: "",
    password_hash: passwordHash,
    role_id: superAdminRole?._id || null,
    role: "super_admin",
    permissions: ["*"],
    is_active: true
  });
}

async function loginWithEmailPassword(email, password) {
  const normalizedEmail = String(email || "").toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user || !user.is_active) {
    const err = new Error("Invalid credentials.");
    err.statusCode = 401;
    throw err;
  }

  const isPasswordValid = await bcrypt.compare(password || "", user.password_hash);
  if (!isPasswordValid) {
    const err = new Error("Invalid credentials.");
    err.statusCode = 401;
    throw err;
  }

  const roleCode = user.role || "unknown";
  const token = signJwt({
    userId: user._id.toString(),
    role: roleCode
  });

  return {
    token,
    user: await toMePayload(user)
  };
}

async function resolveUserPermissionKeys(user) {
  const allPermissions = await Permission.find({}, { _id: 1, key: 1, module: 1, action: 1 }).lean();
  const permissionKeyById = new Map(allPermissions.map((permission) => [permission._id.toString(), permission.key]));

  const resolved = new Set();
  const userPermissionKeys = Array.isArray(user.permissions) ? user.permissions : [];

  if (userPermissionKeys.includes("*")) {
    allPermissions.forEach((permission) => resolved.add(permission.key));
  } else {
    userPermissionKeys.forEach((key) => resolved.add(key));
  }

  if (user.role_id) {
    const rolePermissions = await RolePermission.find({ role_id: user.role_id }, { permission_id: 1 }).lean();
    rolePermissions.forEach((entry) => {
      const key = permissionKeyById.get(entry.permission_id.toString());
      if (key) {
        resolved.add(key);
      }
    });
  }

  const overrides = await UserMenuOverride.find({ user_id: user._id }, { permission_id: 1, granted: 1 }).lean();
  overrides.forEach((override) => {
    const key = permissionKeyById.get(override.permission_id.toString());
    if (!key) {
      return;
    }
    if (override.granted) {
      resolved.add(key);
    } else {
      resolved.delete(key);
    }
  });

  return Array.from(resolved).sort();
}

function buildPermissionMatrix(permissionKeys) {
  const matrix = {};
  permissionKeys.forEach((key) => {
    const [moduleName, action] = key.split(".");
    if (!moduleName || !action) {
      return;
    }
    if (!matrix[moduleName]) {
      matrix[moduleName] = {};
    }
    matrix[moduleName][action] = true;
  });
  return matrix;
}

async function toMePayload(user) {
  const resolvedPermissionKeys = await resolveUserPermissionKeys(user);

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    role: user.role,
    role_id: user.role_id ? user.role_id.toString() : null,
    department_id: user.department_id ? user.department_id.toString() : null,
    linked_faculty_id: user.linked_faculty_id ? user.linked_faculty_id.toString() : null,
    linked_student_id: user.linked_student_id ? user.linked_student_id.toString() : null,
    permissions: resolvedPermissionKeys,
    permission_matrix: buildPermissionMatrix(resolvedPermissionKeys)
  };
}

module.exports = { ensureDefaultAdmin, loginWithEmailPassword, toMePayload };

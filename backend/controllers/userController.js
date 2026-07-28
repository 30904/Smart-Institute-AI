const {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deactivateUser,
  setUserPermissionOverrides
} = require("../services/userService");
const { sendSuccess } = require("../utils/response");
const { writeAudit } = require("../utils/writeAudit");

async function getUsers(_req, res, next) {
  try {
    const data = await listUsers();
    sendSuccess(res, { data, message: "Users fetched." });
  } catch (error) {
    next(error);
  }
}

async function getUser(req, res, next) {
  try {
    const data = await getUserById(req.params.id);
    sendSuccess(res, { data, message: "User fetched." });
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    const data = await createUser(req.body || {});
    await writeAudit({
      module: "users",
      action: "create",
      entityType: "User",
      entityId: data.id,
      user: req.user,
      req,
      details: {
        email: data.email,
        role: data.role
      }
    });
    sendSuccess(res, { data, message: "User created.", statusCode: 201 });
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const data = await updateUser(req.params.id, req.body || {});
    await writeAudit({
      module: "users",
      action: "update",
      entityType: "User",
      entityId: data.id,
      user: req.user,
      req,
      details: {
        updatedFields: Object.keys(req.body || {})
      }
    });
    sendSuccess(res, { data, message: "User updated." });
  } catch (error) {
    next(error);
  }
}

async function deactivate(req, res, next) {
  try {
    const data = await deactivateUser(req.params.id);
    await writeAudit({
      module: "users",
      action: "deactivate",
      entityType: "User",
      entityId: data.id,
      user: req.user,
      req,
      details: {
        is_active: data.is_active
      }
    });
    sendSuccess(res, { data, message: "User deactivated." });
  } catch (error) {
    next(error);
  }
}

async function updatePermissionOverrides(req, res, next) {
  try {
    const data = await setUserPermissionOverrides(req.params.id, req.body || {});
    await writeAudit({
      module: "users",
      action: "permission_override_update",
      entityType: "UserMenuOverride",
      entityId: req.params.id,
      user: req.user,
      req,
      details: {
        appliedCount: data.appliedCount,
        overrides: data.overrides
      }
    });
    sendSuccess(res, { data, message: "User permission overrides updated." });
  } catch (error) {
    next(error);
  }
}

module.exports = { getUsers, getUser, create, update, deactivate, updatePermissionOverrides };

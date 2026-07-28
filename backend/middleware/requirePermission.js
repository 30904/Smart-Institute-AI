const Permission = require("../models/Permission");
const RolePermission = require("../models/RolePermission");
const UserMenuOverride = require("../models/UserMenuOverride");

function requirePermission(moduleName, action) {
  return async function permissionMiddleware(req, _res, next) {
    try {
      const user = req.user;
      if (!user) {
        const err = new Error("Unauthorized.");
        err.statusCode = 401;
        throw err;
      }

      const permissionKey = `${moduleName}.${action}`;
      const permission = await Permission.findOne({ key: permissionKey }).lean();

      if (!permission) {
        const err = new Error(`Permission '${permissionKey}' is not configured.`);
        err.statusCode = 403;
        throw err;
      }

      let granted = false;

      if (Array.isArray(user.permissions) && (user.permissions.includes("*") || user.permissions.includes(permissionKey))) {
        granted = true;
      }

      if (user.role_id) {
        const rolePermission = await RolePermission.findOne({
          role_id: user.role_id,
          permission_id: permission._id
        }).lean();
        granted = granted || Boolean(rolePermission);
      }

      const override = await UserMenuOverride.findOne({
        user_id: user._id,
        permission_id: permission._id
      }).lean();

      if (override) {
        granted = Boolean(override.granted);
      }

      if (!granted) {
        const err = new Error("Forbidden.");
        err.statusCode = 403;
        throw err;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

module.exports = requirePermission;

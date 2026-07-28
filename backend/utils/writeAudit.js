const AuditLog = require("../models/AuditLog");

async function writeAudit({
  module,
  action,
  entityType = "",
  entityId = "",
  status = "success",
  user = null,
  req = null,
  details = {}
}) {
  try {
    if (!module || !action) {
      throw new Error("module and action are required for audit logging.");
    }

    return await AuditLog.create({
      module,
      action,
      entityType,
      entityId: String(entityId || ""),
      status,
      performedBy: {
        userId: user?._id?.toString?.() || user?.id || "",
        email: user?.email || "",
        role: user?.role || ""
      },
      requestMeta: {
        ipAddress: req?.ip || "",
        userAgent: req?.headers?.["user-agent"] || ""
      },
      details
    });
  } catch (error) {
    console.error("Audit logging failed:", error.message);
    return null;
  }
}

module.exports = { writeAudit };

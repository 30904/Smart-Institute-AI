const { decideAdmission } = require("../services/admissionApprovalService");
const { sendSuccess } = require("../utils/response");
const { writeAudit } = require("../utils/writeAudit");

async function decide(req, res, next) {
  const decision = req.body?.decision;
  try {
    const data = await decideAdmission({
      applicationId: req.params.applicationId,
      decision,
      remarks: req.body?.remarks,
      userId: req.user._id
    });

    await writeAudit({
      module: "admissions",
      action: `committee.${decision}`,
      entityType: "AdmissionApplication",
      entityId: req.params.applicationId,
      user: req.user,
      req,
      details: {
        decision,
        remarks: req.body?.remarks || "",
        promotedApplicationId: data.promoted_allocation?.application_id?.toString?.() || ""
      }
    });

    sendSuccess(res, {
      data,
      message: decision === "approve" ? "Admission approved by committee." : "Admission rejected by committee."
    });
  } catch (error) {
    await writeAudit({
      module: "admissions",
      action: `committee.${decision || "invalid"}`,
      entityType: "AdmissionApplication",
      entityId: req.params.applicationId,
      status: "failure",
      user: req.user,
      req,
      details: {
        decision: decision || "",
        error: error.message
      }
    });
    next(error);
  }
}

module.exports = { decide };

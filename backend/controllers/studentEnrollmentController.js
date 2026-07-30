const { processEnrollmentTrigger } = require("../services/studentEnrollmentService");
const { sendSuccess } = require("../utils/response");
const { writeAudit } = require("../utils/writeAudit");

async function process(req, res, next) {
  try {
    const data = await processEnrollmentTrigger(req.body?.confirmation_id);
    await writeAudit({
      module: "admissions",
      action: "student.enroll",
      entityType: "Student",
      entityId: data.student?.id || "",
      user: req.user,
      req,
      details: {
        confirmationId: req.body?.confirmation_id || "",
        applicationId: data.student?.application_id?.toString?.() || "",
        studentId: data.student?.student_id || "",
        rollNo: data.student?.roll_no || "",
        idempotent: data.idempotent
      }
    });
    sendSuccess(res, {
      data,
      message: data.idempotent ? "Student enrollment already completed." : "Student enrolled successfully."
    });
  } catch (error) {
    await writeAudit({
      module: "admissions",
      action: "student.enroll",
      entityType: "AdmissionFeeConfirmation",
      entityId: req.body?.confirmation_id || "",
      status: "failure",
      user: req.user,
      req,
      details: { error: error.message }
    });
    next(error);
  }
}

module.exports = { process };

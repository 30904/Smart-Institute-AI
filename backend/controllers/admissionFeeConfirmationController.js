const {
  confirmAdmissionFee,
  listApplicationFeeConfirmations
} = require("../services/admissionFeeConfirmationService");
const { sendSuccess } = require("../utils/response");
const { writeAudit } = require("../utils/writeAudit");

async function confirm(req, res, next) {
  try {
    const result = await confirmAdmissionFee({
      payload: req.body || {},
      userId: req.user._id
    });

    await writeAudit({
      module: "admissions",
      action: "fee.confirm",
      entityType: "AdmissionApplication",
      entityId: result.confirmation.application_id,
      user: req.user,
      req,
      details: {
        paymentId: result.confirmation.payment_id,
        receiptNo: result.confirmation.receipt_no,
        triggerStatus: result.confirmation.enrollment_trigger_status,
        idempotent: result.idempotent
      }
    });

    sendSuccess(res, {
      data: result,
      message: result.idempotent ? "Fee confirmation already processed." : "Admission fee confirmed.",
      statusCode: result.idempotent ? 200 : 201
    });
  } catch (error) {
    await writeAudit({
      module: "admissions",
      action: "fee.confirm",
      entityType: "AdmissionApplication",
      entityId: req.body?.data?.applicationId || req.body?.applicationId || "",
      status: "failure",
      user: req.user,
      req,
      details: { error: error.message }
    });
    next(error);
  }
}

async function list(req, res, next) {
  try {
    const data = await listApplicationFeeConfirmations(req.params.applicationId);
    sendSuccess(res, { data, message: "Admission fee confirmations fetched." });
  } catch (error) {
    next(error);
  }
}

module.exports = { confirm, list };

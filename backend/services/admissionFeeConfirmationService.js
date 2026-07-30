const mongoose = require("mongoose");

const AdmissionApplication = require("../models/AdmissionApplication");
const AdmissionFeeConfirmation = require("../models/AdmissionFeeConfirmation");
const { processEnrollmentTrigger } = require("./studentEnrollmentService");

function sanitizeConfirmation(document) {
  const value = document.toObject ? document.toObject() : document;
  return {
    ...value,
    id: value._id.toString(),
    _id: undefined,
    __v: undefined
  };
}

function extractFeePaidData(payload) {
  if (payload.event && payload.event !== "fee.paid") {
    const error = new Error("Only fee.paid events are accepted.");
    error.statusCode = 400;
    throw error;
  }
  return payload.data || payload;
}

function requireText(value, field) {
  const text = String(value || "").trim();
  if (!text) {
    const error = new Error(`${field} is required.`);
    error.statusCode = 400;
    throw error;
  }
  return text;
}

async function buildConfirmationResult(confirmation, idempotent) {
  let enrollment = null;
  if (["pending", "failed", "completed"].includes(confirmation.enrollment_trigger_status)) {
    enrollment = await processEnrollmentTrigger(confirmation._id);
    confirmation = await AdmissionFeeConfirmation.findById(confirmation._id);
  }
  return {
    confirmation: sanitizeConfirmation(confirmation),
    enrollment,
    idempotent
  };
}

async function confirmAdmissionFee({ payload, userId }) {
  const data = extractFeePaidData(payload);
  const applicationId = requireText(data.applicationId, "applicationId");
  const paymentId = requireText(data.paymentId, "paymentId");
  const receiptNo = requireText(data.receiptNo, "receiptNo");
  const invoiceNo = requireText(data.invoiceNo, "invoiceNo");

  if (!mongoose.isValidObjectId(applicationId)) {
    const error = new Error("applicationId contains an invalid id.");
    error.statusCode = 400;
    throw error;
  }

  const existing = await AdmissionFeeConfirmation.findOne({ payment_id: paymentId });
  if (existing) {
    if (existing.application_id.toString() !== applicationId || existing.receipt_no !== receiptNo) {
      const error = new Error("paymentId was already used for a different fee confirmation.");
      error.statusCode = 409;
      throw error;
    }
    return buildConfirmationResult(existing, true);
  }

  if ((data.feeTerm || "admission") !== "admission") {
    const error = new Error("Only admission fee payments can trigger admission enrollment.");
    error.statusCode = 400;
    throw error;
  }

  const amountPaid = Number(data.amountPaid);
  const pendingAmount = Number(data.pendingAmount);
  if (!Number.isFinite(amountPaid) || amountPaid < 0 || !Number.isFinite(pendingAmount) || pendingAmount < 0) {
    const error = new Error("amountPaid and pendingAmount must be non-negative numbers.");
    error.statusCode = 400;
    throw error;
  }

  const occurredAt = new Date(payload.occurredAt || data.occurredAt);
  if (Number.isNaN(occurredAt.getTime())) {
    const error = new Error("occurredAt must be a valid date.");
    error.statusCode = 400;
    throw error;
  }

  const application = await AdmissionApplication.findById(applicationId);
  if (!application) {
    const error = new Error("Admission application not found.");
    error.statusCode = 404;
    throw error;
  }
  if (!["approved", "fee_pending"].includes(application.status)) {
    const error = new Error("Admission fee can only be confirmed after committee approval.");
    error.statusCode = 409;
    throw error;
  }

  const isFullSettlement = data.isFullSettlement === true;
  const triggerStatus = isFullSettlement && pendingAmount === 0 ? "pending" : "not_ready";

  try {
    const confirmation = await AdmissionFeeConfirmation.create({
      application_id: applicationId,
      payment_id: paymentId,
      receipt_no: receiptNo,
      invoice_no: invoiceNo,
      amount_paid: amountPaid,
      currency: String(data.currency || "INR").trim().toUpperCase(),
      payment_mode: String(data.paymentMode || "").trim().toLowerCase(),
      fee_term: "admission",
      is_full_settlement: isFullSettlement,
      pending_amount: pendingAmount,
      occurred_at: occurredAt,
      enrollment_trigger_status: triggerStatus,
      raw_event: payload,
      confirmed_by: userId
    });

    application.status = "fee_pending";
    await application.save();
    return buildConfirmationResult(confirmation, false);
  } catch (error) {
    if (error?.code === 11000) {
      const duplicate = await AdmissionFeeConfirmation.findOne({
        $or: [{ payment_id: paymentId }, { receipt_no: receiptNo }]
      });
      if (duplicate?.payment_id === paymentId && duplicate.application_id.toString() === applicationId) {
        return buildConfirmationResult(duplicate, true);
      }
      error.statusCode = 409;
      error.message = "paymentId or receiptNo has already been recorded.";
    } else if (error?.name === "ValidationError" || error?.name === "CastError") {
      error.statusCode = 400;
    }
    throw error;
  }
}

async function listApplicationFeeConfirmations(applicationId) {
  if (!mongoose.isValidObjectId(applicationId)) {
    const error = new Error("application_id contains an invalid id.");
    error.statusCode = 400;
    throw error;
  }
  const confirmations = await AdmissionFeeConfirmation.find({ application_id: applicationId }).sort({ occurred_at: -1 });
  return confirmations.map(sanitizeConfirmation);
}

module.exports = { confirmAdmissionFee, listApplicationFeeConfirmations };

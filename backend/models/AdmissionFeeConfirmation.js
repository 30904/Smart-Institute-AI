const mongoose = require("mongoose");

const admissionFeeConfirmationSchema = new mongoose.Schema(
  {
    application_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdmissionApplication",
      required: true
    },
    payment_id: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    receipt_no: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    invoice_no: {
      type: String,
      required: true,
      trim: true
    },
    amount_paid: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: "INR",
      trim: true,
      uppercase: true
    },
    payment_mode: {
      type: String,
      enum: ["cash", "upi", "card", "bank", "online"],
      required: true
    },
    fee_term: {
      type: String,
      enum: ["admission"],
      default: "admission"
    },
    is_full_settlement: {
      type: Boolean,
      required: true
    },
    pending_amount: {
      type: Number,
      required: true,
      min: 0
    },
    occurred_at: {
      type: Date,
      required: true
    },
    enrollment_trigger_status: {
      type: String,
      enum: ["not_ready", "pending", "processing", "completed", "failed"],
      required: true
    },
    enrollment_error: {
      type: String,
      default: "",
      trim: true
    },
    raw_event: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({})
    },
    confirmed_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: true
  }
);

admissionFeeConfirmationSchema.index({ application_id: 1, createdAt: -1 });
admissionFeeConfirmationSchema.index({ enrollment_trigger_status: 1, createdAt: 1 });

module.exports = mongoose.model("AdmissionFeeConfirmation", admissionFeeConfirmationSchema);

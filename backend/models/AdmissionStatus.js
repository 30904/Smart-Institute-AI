const mongoose = require("mongoose");

const ADMISSION_STATUS_CODES = [
  "applied",
  "docs_pending",
  "eligible",
  "merit_listed",
  "allotted",
  "approved",
  "fee_pending",
  "enrolled",
  "rejected",
  "waitlisted"
];

const admissionStatusSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    code: {
      type: String,
      required: true,
      unique: true,
      enum: ADMISSION_STATUS_CODES,
      trim: true
    },
    sort_order: {
      type: Number,
      required: true,
      min: 1
    },
    is_active: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

admissionStatusSchema.index({ is_active: 1, sort_order: 1 });

const AdmissionStatus = mongoose.model("AdmissionStatus", admissionStatusSchema);

AdmissionStatus.STATUS_CODES = Object.freeze([...ADMISSION_STATUS_CODES]);

module.exports = AdmissionStatus;

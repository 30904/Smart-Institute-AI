const mongoose = require("mongoose");

const admissionApplicationDocumentSchema = new mongoose.Schema(
  {
    application_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdmissionApplication",
      required: true
    },
    document_type_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdmissionDocumentType",
      required: true
    },
    original_name: {
      type: String,
      required: true,
      trim: true
    },
    storage_name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    file_path: {
      type: String,
      required: true,
      trim: true
    },
    mime_type: {
      type: String,
      required: true,
      trim: true
    },
    size: {
      type: Number,
      required: true,
      min: 1
    },
    verification_status: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending"
    },
    verification_remarks: {
      type: String,
      default: "",
      trim: true
    },
    verified_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    verified_at: {
      type: Date,
      default: null
    },
    uploaded_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    ocr: {
      phase: {
        type: String,
        enum: ["phase_2_stub"],
        default: "phase_2_stub"
      },
      status: {
        type: String,
        enum: ["not_run"],
        default: "not_run"
      },
      authenticity: {
        type: String,
        enum: ["not_checked"],
        default: "not_checked"
      },
      completeness: {
        type: String,
        enum: ["not_checked"],
        default: "not_checked"
      },
      flags: {
        type: [String],
        default: []
      }
    }
  },
  {
    timestamps: true
  }
);

admissionApplicationDocumentSchema.index({ application_id: 1, document_type_id: 1 }, { unique: true });
admissionApplicationDocumentSchema.index({ application_id: 1, verification_status: 1 });

module.exports = mongoose.model("AdmissionApplicationDocument", admissionApplicationDocumentSchema);

const mongoose = require("mongoose");

const admissionDocumentTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    mandatory: {
      type: Boolean,
      default: false
    },
    applies_to_program_ids: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Program"
        }
      ],
      default: []
    }
  },
  {
    timestamps: true
  }
);

admissionDocumentTypeSchema.index({ mandatory: 1 });
admissionDocumentTypeSchema.index({ applies_to_program_ids: 1 });

module.exports = mongoose.model("AdmissionDocumentType", admissionDocumentTypeSchema);

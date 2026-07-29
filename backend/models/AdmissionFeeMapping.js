const mongoose = require("mongoose");

const admissionFeeMappingSchema = new mongoose.Schema(
  {
    program_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Program",
      required: true
    },
    cycle_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdmissionCycle",
      required: true
    },
    fee_structure_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FeeStructure",
      required: true
    }
  },
  {
    timestamps: true
  }
);

admissionFeeMappingSchema.index({ program_id: 1, cycle_id: 1 }, { unique: true });
admissionFeeMappingSchema.index({ fee_structure_id: 1 });

module.exports = mongoose.model("AdmissionFeeMapping", admissionFeeMappingSchema);

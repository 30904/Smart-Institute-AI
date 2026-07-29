const mongoose = require("mongoose");

const eligibilityCriteriaSchema = new mongoose.Schema(
  {
    program_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Program",
      required: true,
      unique: true
    },
    min_qualification: {
      type: String,
      required: true,
      trim: true
    },
    min_marks: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    rules_json: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({})
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("EligibilityCriteria", eligibilityCriteriaSchema);

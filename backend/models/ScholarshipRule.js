const mongoose = require("mongoose");

const scholarshipRuleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    criteria_json: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      default: () => ({})
    },
    benefit_json: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      default: () => ({})
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("ScholarshipRule", scholarshipRuleSchema);

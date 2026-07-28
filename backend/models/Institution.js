const mongoose = require("mongoose");

const institutionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    workspaceLabel: {
      type: String,
      required: true,
      trim: true
    },
    financialYear: {
      type: String,
      required: true,
      trim: true
    },
    location: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      type: String,
      default: "",
      trim: true
    },
    logo_url: {
      type: String,
      default: "",
      trim: true
    },
    default_academic_year_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicYear",
      default: null
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Institution", institutionSchema);

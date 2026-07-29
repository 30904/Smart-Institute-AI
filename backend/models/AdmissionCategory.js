const mongoose = require("mongoose");

const admissionCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    quota_percent: {
      type: Number,
      default: null,
      min: 0,
      max: 100
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

admissionCategorySchema.index({ is_active: 1, name: 1 });

module.exports = mongoose.model("AdmissionCategory", admissionCategorySchema);

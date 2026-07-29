const mongoose = require("mongoose");

const facultyTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      // e.g., "Permanent", "Visiting", "Trainer", "Contract"
    },
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      // e.g., "PERM", "VISIT", "TRN"
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

module.exports = mongoose.model("FacultyType", facultyTypeSchema);

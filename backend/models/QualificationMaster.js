const mongoose = require("mongoose");

const qualificationMasterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      // e.g., "Ph.D. in Computer Science", "Master of Business Administration", "AWS Certified Solutions Architect"
    },
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      // e.g., "PHD-CS", "MBA", "AWS-CSA"
    },
    level: {
      type: String,
      trim: true,
      // e.g., "Doctorate", "Post-Graduate", "Undergraduate", "Certification", "Diploma"
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

module.exports = mongoose.model("QualificationMaster", qualificationMasterSchema);

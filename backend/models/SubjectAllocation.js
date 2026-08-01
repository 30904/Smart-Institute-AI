const mongoose = require("mongoose");

const subjectAllocationSchema = new mongoose.Schema(
  {
    academic_year_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicYear",
      required: true
    },
    program_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Program",
      required: true
    },
    semester: {
      type: Number,
      required: true
    },
    subject_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true
    },
    faculty_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
      required: true
    },
    assigned_credits: {
      type: Number,
      required: true,
      default: 0
    },
    specialization_override: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate assignment of the same subject to the same faculty in the same semester/program
subjectAllocationSchema.index(
  { academic_year_id: 1, program_id: 1, semester: 1, subject_id: 1, faculty_id: 1 }, 
  { unique: true }
);

module.exports = mongoose.model("SubjectAllocation", subjectAllocationSchema);

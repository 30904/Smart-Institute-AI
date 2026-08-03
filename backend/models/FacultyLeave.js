const mongoose = require("mongoose");

const facultyLeaveSchema = new mongoose.Schema(
  {
    faculty_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    leave_type: {
      type: String,
      required: true,
      enum: ["Casual Leave", "Sick Leave", "Earned Leave", "Duty Leave", "Maternity Leave", "Other"]
    },
    start_date: {
      type: Date,
      required: true
    },
    end_date: {
      type: Date,
      required: true
    },
    reason: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Cancelled"],
      default: "Pending"
    },
    approved_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    comments: {
      type: String,
      default: "",
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Ensure index for faster queries on faculty_id and dates
facultyLeaveSchema.index({ faculty_id: 1, start_date: -1 });

module.exports = mongoose.model("FacultyLeave", facultyLeaveSchema);

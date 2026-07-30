const mongoose = require("mongoose");

const facultyAttendanceSchema = new mongoose.Schema(
  {
    faculty_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    punch_in_time: {
      type: Date,
      default: null
    },
    punch_out_time: {
      type: Date,
      default: null
    },
    status: {
      type: String,
      enum: ["Present", "Half-Day", "Absent", "Missing Punch", "Pending"],
      default: "Pending"
    },
    remarks: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

// Ensure only one attendance record per faculty per day
facultyAttendanceSchema.index({ faculty_id: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("FacultyAttendance", facultyAttendanceSchema);

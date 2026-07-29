const mongoose = require("mongoose");

const timetableSlotSchema = new mongoose.Schema(
  {
    program: {
      type: String,
      required: true,
      trim: true
    },
    semester: {
      type: String,
      required: true,
      trim: true
    },
    section: {
      type: String,
      required: true,
      trim: true
    },
    day: {
      type: String,
      required: true,
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    },
    period: {
      type: String,
      required: true,
      trim: true
    },
    subject: {
      type: String,
      required: true,
      trim: true
    },
    room: {
      type: String,
      default: "",
      trim: true
    },
    faculty_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
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

// Compound index to ensure a specific section doesn't have duplicate slots for the same day/period
timetableSlotSchema.index({ program: 1, semester: 1, section: 1, day: 1, period: 1 }, { unique: true });

module.exports = mongoose.model("TimetableSlot", timetableSlotSchema);

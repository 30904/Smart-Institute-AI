const mongoose = require("mongoose");

const facultyPerformanceSchema = new mongoose.Schema(
  {
    faculty_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    period: {
      type: String,
      required: true,
      trim: true // e.g., "2026-Q1", "2026-07"
    },
    teaching_rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    research_rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    service_rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    overall_rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    reviewer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
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

// Prevent multiple evaluations for the same faculty in the same period
facultyPerformanceSchema.index({ faculty_id: 1, period: 1 }, { unique: true });

module.exports = mongoose.model("FacultyPerformance", facultyPerformanceSchema);

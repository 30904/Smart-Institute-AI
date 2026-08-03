const mongoose = require("mongoose");

const facultyTrainingSchema = new mongoose.Schema(
  {
    faculty_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
      required: true,
      index: true
    },
    training_title: {
      type: String,
      required: true,
      trim: true
    },
    training_type: {
      type: String,
      enum: ["workshop", "certification", "fdp", "seminar", "course"],
      required: true
    },
    organizer: {
      type: String,
      trim: true,
      default: ""
    },
    from_date: {
      type: Date,
      required: true
    },
    to_date: {
      type: Date,
      required: true
    },
    duration_days: {
      type: Number,
      default: 1
    },
    certificate_url: {
      type: String,
      trim: true,
      default: ""
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("FacultyTraining", facultyTrainingSchema);

const mongoose = require("mongoose");

const admissionCycleSchema = new mongoose.Schema(
  {
    academic_year_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicYear",
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    start_date: {
      type: Date,
      required: true
    },
    end_date: {
      type: Date,
      required: true,
      validate: {
        validator(value) {
          return !this.start_date || value >= this.start_date;
        },
        message: "end_date must be on or after start_date."
      }
    },
    status: {
      type: String,
      enum: ["draft", "open", "closed"],
      default: "draft"
    }
  },
  {
    timestamps: true
  }
);

admissionCycleSchema.index({ academic_year_id: 1, name: 1 }, { unique: true });
admissionCycleSchema.index({ status: 1, start_date: 1, end_date: 1 });

module.exports = mongoose.model("AdmissionCycle", admissionCycleSchema);

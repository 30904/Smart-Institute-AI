const mongoose = require("mongoose");

const programSchema = new mongoose.Schema(
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
    department_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true
    },
    duration: {
      type: Number,
      required: true,
      min: 1
    },
    program_type: {
      type: String,
      enum: ["trade", "diploma", "degree"],
      required: true
    },
    intake_default: {
      type: Number,
      default: 0,
      min: 0
    },
    description: {
      type: String,
      default: "",
      trim: true
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

module.exports = mongoose.model("Program", programSchema);

const mongoose = require("mongoose");

const intakeCapacitySchema = new mongoose.Schema(
  {
    cycle_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdmissionCycle",
      required: true
    },
    program_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Program",
      required: true
    },
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdmissionCategory",
      default: null
    },
    seats: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: "seats must be a whole number."
      }
    }
  },
  {
    timestamps: true
  }
);

intakeCapacitySchema.index({ cycle_id: 1, program_id: 1, category_id: 1 }, { unique: true });
intakeCapacitySchema.index({ cycle_id: 1, program_id: 1 });

module.exports = mongoose.model("IntakeCapacity", intakeCapacitySchema);

const mongoose = require("mongoose");

const meritListSchema = new mongoose.Schema(
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
    application_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdmissionApplication",
      required: true
    },
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdmissionCategory",
      required: true
    },
    merit_score: {
      type: Number,
      required: true,
      min: 0
    },
    overall_rank: {
      type: Number,
      required: true,
      min: 1
    },
    category_rank: {
      type: Number,
      required: true,
      min: 1
    },
    quota_seats: {
      type: Number,
      default: 0,
      min: 0
    },
    within_cutoff: {
      type: Boolean,
      default: false
    },
    selection_pool: {
      type: String,
      enum: ["reserved", "open", "not_selected"],
      default: "not_selected"
    },
    generation_batch_id: {
      type: String,
      required: true,
      trim: true
    },
    generated_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    generated_at: {
      type: Date,
      required: true
    }
  },
  {
    timestamps: true
  }
);

meritListSchema.index({ cycle_id: 1, program_id: 1, application_id: 1 }, { unique: true });
meritListSchema.index({ cycle_id: 1, program_id: 1, overall_rank: 1 });
meritListSchema.index({ cycle_id: 1, program_id: 1, category_id: 1, category_rank: 1 });

module.exports = mongoose.model("MeritList", meritListSchema);

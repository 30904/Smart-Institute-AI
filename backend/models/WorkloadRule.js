const mongoose = require("mongoose");

const workloadRuleSchema = new mongoose.Schema(
  {
    // ── Rule name / label ─────────────────────────────────────────────────────
    name: {
      type: String,
      required: true,
      trim: true
      // e.g. "Professor Standard Load", "Visiting Faculty Cap"
    },

    // ── Scope: optional designation-level override ────────────────────────────
    // If null → this is a global / faculty-type-level rule
    // If set  → overrides the base rule for that specific designation
    designation_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Designation",
      default: null
    },

    // ── Also scoped to faculty type (required, one rule per type+designation) ─
    faculty_type_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FacultyType",
      default: null
    },

    // ── Primary hard limit ─────────────────────────────────────────────────────
    max_hours_per_week: {
      // Maximum total contact hours (theory + practical) per week
      type: Number,
      required: true,
      min: 0,
      default: 40
    },

    // ── Flexible extra rules (JSON) ───────────────────────────────────────────
    // Stores an open-ended set of institutional rules as a structured object.
    // Schema is flexible — validated by application logic, not Mongoose.
    // Example structure:
    // {
    //   "max_theory_hours_per_week": 20,
    //   "max_practical_hours_per_week": 12,
    //   "max_subjects_per_semester": 5,
    //   "max_batches_per_day": 3,
    //   "min_rest_hours_between_classes": 1,
    //   "allow_cross_department": false,
    //   "notes": "As per AICTE norms for contract faculty"
    // }
    rules_json: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },

    // ── Status ────────────────────────────────────────────────────────────────
    is_active: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
// Composite uniqueness: one rule per (faculty_type + designation) combination
workloadRuleSchema.index(
  { faculty_type_id: 1, designation_id: 1 },
  { unique: true, sparse: true }
);
workloadRuleSchema.index({ designation_id: 1 });

module.exports = mongoose.model("WorkloadRule", workloadRuleSchema);

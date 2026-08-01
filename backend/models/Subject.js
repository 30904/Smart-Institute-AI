const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
  {
    // ── Core identity ─────────────────────────────────────────────────────────
    name: {
      type: String,
      required: true,
      trim: true
      // e.g. "Data Structures and Algorithms"
    },
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true
      // e.g. "CS301"
    },

    // ── Academic mapping ──────────────────────────────────────────────────────
    program_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Program",
      required: true
    },
    department_id: {
      // Kept for quick queries without joining through program
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true
    },
    semester: {
      // Which semester this subject belongs to in its program
      type: Number,
      required: true,
      min: 1
    },

    // ── Theory / Practical flag ───────────────────────────────────────────────
    subject_type: {
      type: String,
      enum: ["theory", "practical", "theory_practical"],
      required: true,
      default: "theory"
      // "theory"           — Lecture-only subject
      // "practical"        — Lab/workshop-only subject
      // "theory_practical" — Combined (has both lecture + lab sessions)
    },

    // ── Credit structure (WTI = Weekly Teaching/Training Intensity) ───────────
    theory_credits: {
      // Credits for the lecture component
      type: Number,
      default: 0,
      min: 0
    },
    practical_credits: {
      // Credits for the lab/practical component
      type: Number,
      default: 0,
      min: 0
    },
    // Total credits is a virtual (theory + practical) but also stored for indexing
    total_credits: {
      type: Number,
      default: 0,
      min: 0
    },

    // ── Weekly contact hours ──────────────────────────────────────────────────
    theory_hours_per_week: {
      type: Number,
      default: 0,
      min: 0
    },
    practical_hours_per_week: {
      type: Number,
      default: 0,
      min: 0
    },

    // ── Examination ───────────────────────────────────────────────────────────
    has_internal_assessment: {
      type: Boolean,
      default: true
    },
    has_external_exam: {
      type: Boolean,
      default: true
    },
    max_internal_marks: {
      type: Number,
      default: 0
    },
    max_external_marks: {
      type: Number,
      default: 0
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

// ─── Virtual: computed total credits ─────────────────────────────────────────
subjectSchema.virtual("credits").get(function () {
  return this.theory_credits + this.practical_credits;
});

// ─── Pre-save: auto-calculate total_credits ───────────────────────────────────
subjectSchema.pre("save", function (next) {
  this.total_credits = this.theory_credits + this.practical_credits;
  next();
});

subjectSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  if (update.theory_credits !== undefined || update.practical_credits !== undefined) {
    const theory = update.theory_credits ?? 0;
    const practical = update.practical_credits ?? 0;
    this.setUpdate({ ...update, total_credits: theory + practical });
  }
  next();
});

subjectSchema.set("toJSON", { virtuals: true });
subjectSchema.set("toObject", { virtuals: true });

// ─── Indexes ──────────────────────────────────────────────────────────────────
subjectSchema.index({ program_id: 1, semester: 1 });
subjectSchema.index({ department_id: 1, is_active: 1 });
subjectSchema.index({ subject_type: 1 });

module.exports = mongoose.model("Subject", subjectSchema);

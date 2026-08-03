const mongoose = require("mongoose");

// ─── Sub-schema: Qualification entry ─────────────────────────────────────────
const qualificationEntrySchema = new mongoose.Schema(
  {
    qualification_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QualificationMaster",
      required: true
    },
    institution: { type: String, trim: true, default: "" },
    year_of_passing: { type: Number },
    grade_or_percentage: { type: String, trim: true, default: "" }
  },
  { _id: false }
);

// ─── Main Faculty Schema ──────────────────────────────────────────────────────
const facultySchema = new mongoose.Schema(
  {
    // ── Identity ──────────────────────────────────────────────────────────────
    employee_code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true
      // e.g. "FAC-2024-001"
    },

    // ── Personal details ──────────────────────────────────────────────────────
    first_name: {
      type: String,
      required: true,
      trim: true
    },
    last_name: {
      type: String,
      required: true,
      trim: true
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "male"
    },
    dob: {
      type: Date
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      type: String,
      trim: true,
      default: ""
    },
    joining_date: {
      type: Date,
      required: true
    },

    // ── Academic mapping ──────────────────────────────────────────────────────
    department_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true
    },
    designation_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Designation",
      required: true
    },
    type_id: {
      // Faculty employment type: Permanent / Visiting / Contract / Trainer
      type: mongoose.Schema.Types.ObjectId,
      ref: "FacultyType",
      required: true
    },

    // ── Qualifications (array — each entry captures one degree) ──────────────
    qualifications: {
      type: [qualificationEntrySchema],
      default: []
    },

    // ── Subjects the faculty is authorised to teach ───────────────────────────
    subjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject"
      }
    ],

    // ── System / Auth link ────────────────────────────────────────────────────
    user_id: {
      // Optional: links to a login account in the User collection
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      unique: true,
      sparse: true
    },

    // ── Status ────────────────────────────────────────────────────────────────
    is_active: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true // createdAt, updatedAt
  }
);

// ─── Virtuals ─────────────────────────────────────────────────────────────────
facultySchema.virtual("full_name").get(function () {
  return `${this.first_name} ${this.last_name}`;
});

facultySchema.set("toJSON", { virtuals: true });
facultySchema.set("toObject", { virtuals: true });

// ─── Indexes ──────────────────────────────────────────────────────────────────
facultySchema.index({ department_id: 1, is_active: 1 });
facultySchema.index({ designation_id: 1 });
facultySchema.index({ type_id: 1 });
facultySchema.index({ employee_code: 1 }, { unique: true });

module.exports = mongoose.model("Faculty", facultySchema);

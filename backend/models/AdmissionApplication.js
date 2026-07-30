const mongoose = require("mongoose");

const AdmissionStatus = require("./AdmissionStatus");

const personalSchema = new mongoose.Schema(
  {
    full_name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    date_of_birth: {
      type: Date,
      default: null
    },
    gender: {
      type: String,
      trim: true,
      default: ""
    },
    address: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({})
    }
  },
  { _id: false }
);

const academicSchema = new mongoose.Schema(
  {
    qualification: {
      type: String,
      required: true,
      trim: true
    },
    institution_name: {
      type: String,
      trim: true,
      default: ""
    },
    board_or_university: {
      type: String,
      trim: true,
      default: ""
    },
    passing_year: {
      type: Number,
      min: 1900,
      default: null
    },
    marks_percent: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    details_json: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({})
    }
  },
  { _id: false }
);

const eligibilityResultSchema = new mongoose.Schema(
  {
    program_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Program",
      required: true
    },
    criteria_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EligibilityCriteria",
      default: null
    },
    is_eligible: {
      type: Boolean,
      required: true
    },
    reasons: {
      type: [String],
      default: []
    },
    evaluated_at: {
      type: Date,
      required: true
    }
  },
  { _id: false }
);

const admissionApplicationSchema = new mongoose.Schema(
  {
    personal: {
      type: personalSchema,
      required: true
    },
    academic: {
      type: academicSchema,
      required: true
    },
    program_preferences: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Program"
        }
      ],
      required: true,
      validate: [
        {
          validator(values) {
            return values.length > 0;
          },
          message: "At least one program preference is required."
        },
        {
          validator(values) {
            return new Set(values.map(String)).size === values.length;
          },
          message: "Program preferences must be unique."
        }
      ]
    },
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdmissionCategory",
      required: true
    },
    cycle_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdmissionCycle",
      required: true
    },
    status: {
      type: String,
      enum: AdmissionStatus.STATUS_CODES,
      default: "applied"
    },
    merit_score: {
      type: Number,
      min: 0,
      default: null
    },
    eligibility_results: {
      type: [eligibilityResultSchema],
      default: []
    },
    eligibility_checked_at: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

admissionApplicationSchema.index({ cycle_id: 1, status: 1, createdAt: -1 });
admissionApplicationSchema.index({ category_id: 1, status: 1 });
admissionApplicationSchema.index({ "personal.email": 1, cycle_id: 1 });

module.exports = mongoose.model("AdmissionApplication", admissionApplicationSchema);

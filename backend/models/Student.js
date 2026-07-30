const mongoose = require("mongoose");

const guardianSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    relationship: { type: String, required: true, trim: true },
    phone: { type: String, default: "", trim: true },
    email: { type: String, default: "", trim: true, lowercase: true }
  },
  { _id: false }
);

const studentDocumentSchema = new mongoose.Schema(
  {
    source_document_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdmissionApplicationDocument",
      required: true
    },
    document_type_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdmissionDocumentType",
      required: true
    },
    original_name: { type: String, required: true, trim: true },
    file_path: { type: String, required: true, trim: true },
    mime_type: { type: String, required: true, trim: true },
    verification_status: {
      type: String,
      enum: ["verified"],
      default: "verified"
    }
  },
  { _id: false }
);

const studentSchema = new mongoose.Schema(
  {
    student_id: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    roll_no: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    application_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdmissionApplication",
      default: null,
      unique: true,
      sparse: true
    },
    personal: {
      full_name: { type: String, required: true, trim: true },
      email: { type: String, required: true, trim: true, lowercase: true },
      phone: { type: String, required: true, trim: true },
      date_of_birth: { type: Date, default: null },
      gender: { type: String, default: "", trim: true },
      address: { type: mongoose.Schema.Types.Mixed, default: () => ({}) }
    },
    academic: {
      qualification: { type: String, required: true, trim: true },
      institution_name: { type: String, default: "", trim: true },
      board_or_university: { type: String, default: "", trim: true },
      passing_year: { type: Number, min: 1900, default: null },
      marks_percent: { type: Number, required: true, min: 0, max: 100 },
      details_json: { type: mongoose.Schema.Types.Mixed, default: () => ({}) }
    },
    guardians: {
      type: [guardianSchema],
      default: []
    },
    program_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Program",
      required: true
    },
    academic_year_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicYear",
      required: true
    },
    admission_cycle_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdmissionCycle",
      required: true
    },
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdmissionCategory",
      required: true
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended", "alumni"],
      default: "active"
    },
    documents: {
      type: [studentDocumentSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

studentSchema.index({ program_id: 1, academic_year_id: 1, status: 1 });
studentSchema.index({ "personal.full_name": 1 });
studentSchema.index({ "personal.email": 1 });

module.exports = mongoose.model("Student", studentSchema);

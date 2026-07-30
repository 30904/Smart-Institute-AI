const mongoose = require("mongoose");

const AcademicYear = require("../models/AcademicYear");
const AdmissionApplication = require("../models/AdmissionApplication");
const AdmissionApplicationDocument = require("../models/AdmissionApplicationDocument");
const AdmissionCycle = require("../models/AdmissionCycle");
const AdmissionFeeConfirmation = require("../models/AdmissionFeeConfirmation");
const OutboxEvent = require("../models/OutboxEvent");
const Program = require("../models/Program");
const SeatAllocation = require("../models/SeatAllocation");
const SequenceCounter = require("../models/SequenceCounter");
const Student = require("../models/Student");

function requireValidId(value, field) {
  if (!mongoose.isValidObjectId(value)) {
    const error = new Error(`${field} contains an invalid id.`);
    error.statusCode = 400;
    throw error;
  }
}

function sanitizeStudent(document) {
  const value = document.toObject ? document.toObject() : document;
  return {
    ...value,
    id: value._id.toString(),
    _id: undefined,
    __v: undefined
  };
}

function compactCode(value) {
  return String(value || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

async function nextSequence(key) {
  const counter = await SequenceCounter.findOneAndUpdate(
    { key },
    { $inc: { sequence: 1 } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return counter.sequence;
}

async function generateStudentIdentifiers(academicYear, program) {
  const academicCode = compactCode(academicYear.code);
  const programCode = compactCode(program.code);
  const [studentSequence, rollSequence] = await Promise.all([
    nextSequence(`student:${academicYear._id}`),
    nextSequence(`roll:${academicYear._id}:${program._id}`)
  ]);

  return {
    student_id: `STU-${academicCode}-${String(studentSequence).padStart(6, "0")}`,
    roll_no: `${programCode}-${academicCode}-${String(rollSequence).padStart(4, "0")}`
  };
}

async function ensureEnrollmentEvent({ student, application, cycle }) {
  const occurredAt = new Date();
  const eventPayload = {
    event: "admission.enrolled",
    occurredAt: occurredAt.toISOString(),
    data: {
      applicationId: application._id.toString(),
      studentId: student.student_id,
      rollNo: student.roll_no,
      programId: student.program_id.toString(),
      academicYearId: student.academic_year_id.toString(),
      admissionCycleId: cycle._id.toString(),
      fullName: student.personal.full_name,
      email: student.personal.email,
      phone: student.personal.phone,
      categoryId: student.category_id.toString()
    }
  };

  await OutboxEvent.updateOne(
    { deduplication_key: `admission.enrolled:${application._id}` },
    {
      $setOnInsert: {
        event: "admission.enrolled",
        deduplication_key: `admission.enrolled:${application._id}`,
        occurred_at: occurredAt,
        payload: eventPayload,
        delivery_status: "pending"
      }
    },
    { upsert: true }
  );

  return eventPayload;
}

async function finalizeEnrollment({ confirmation, application, student, cycle }) {
  application.status = "enrolled";
  confirmation.enrollment_trigger_status = "completed";
  confirmation.enrollment_error = "";
  await Promise.all([
    application.save(),
    confirmation.save(),
    ensureEnrollmentEvent({ student, application, cycle })
  ]);
}

async function processEnrollmentTrigger(confirmationId) {
  requireValidId(confirmationId, "confirmation_id");

  let confirmation = await AdmissionFeeConfirmation.findById(confirmationId);
  if (!confirmation) {
    const error = new Error("Admission fee confirmation not found.");
    error.statusCode = 404;
    throw error;
  }
  if (confirmation.enrollment_trigger_status === "not_ready") {
    const error = new Error("Full admission fee settlement is required before enrollment.");
    error.statusCode = 409;
    throw error;
  }

  if (confirmation.enrollment_trigger_status === "completed") {
    const student = await Student.findOne({ application_id: confirmation.application_id });
    return { student: student ? sanitizeStudent(student) : null, idempotent: true };
  }

  confirmation = await AdmissionFeeConfirmation.findOneAndUpdate(
    {
      _id: confirmationId,
      enrollment_trigger_status: { $in: ["pending", "failed"] }
    },
    {
      $set: {
        enrollment_trigger_status: "processing",
        enrollment_error: ""
      }
    },
    { new: true }
  );
  if (!confirmation) {
    const error = new Error("Enrollment trigger is already being processed.");
    error.statusCode = 409;
    throw error;
  }

  try {
    const application = await AdmissionApplication.findById(confirmation.application_id);
    if (!application) {
      const error = new Error("Admission application not found.");
      error.statusCode = 404;
      throw error;
    }
    if (!["fee_pending", "enrolled"].includes(application.status)) {
      const error = new Error("Application is not ready for enrollment.");
      error.statusCode = 409;
      throw error;
    }

    const allocation = await SeatAllocation.findOne({
      application_id: application._id,
      cycle_id: application.cycle_id,
      allocation_status: "allotted",
      approval_status: "approved"
    });
    if (!allocation) {
      const error = new Error("Approved seat allocation not found.");
      error.statusCode = 409;
      throw error;
    }

    const [cycle, program, existingStudent] = await Promise.all([
      AdmissionCycle.findById(application.cycle_id),
      Program.findById(allocation.program_id),
      Student.findOne({ application_id: application._id })
    ]);
    if (!cycle) {
      const error = new Error("Admission cycle not found.");
      error.statusCode = 409;
      throw error;
    }
    if (!program) {
      const error = new Error("Allotted program not found.");
      error.statusCode = 409;
      throw error;
    }

    const academicYear = await AcademicYear.findById(cycle.academic_year_id);
    if (!academicYear) {
      const error = new Error("Academic year for the admission cycle not found.");
      error.statusCode = 409;
      throw error;
    }

    if (existingStudent) {
      await finalizeEnrollment({ confirmation, application, student: existingStudent, cycle });
      return { student: sanitizeStudent(existingStudent), idempotent: true };
    }

    const verifiedDocuments = await AdmissionApplicationDocument.find({
      application_id: application._id,
      verification_status: "verified"
    });
    const identifiers = await generateStudentIdentifiers(academicYear, program);
    const student = await Student.create({
      ...identifiers,
      application_id: application._id,
      personal: application.personal.toObject(),
      academic: application.academic.toObject(),
      guardians: application.guardians.map((guardian) => guardian.toObject()),
      program_id: program._id,
      academic_year_id: academicYear._id,
      admission_cycle_id: cycle._id,
      category_id: application.category_id,
      status: "active",
      documents: verifiedDocuments.map((document) => ({
        source_document_id: document._id,
        document_type_id: document.document_type_id,
        original_name: document.original_name,
        file_path: document.file_path,
        mime_type: document.mime_type,
        verification_status: "verified"
      }))
    });

    await finalizeEnrollment({ confirmation, application, student, cycle });
    return { student: sanitizeStudent(student), idempotent: false };
  } catch (error) {
    confirmation.enrollment_trigger_status = "failed";
    confirmation.enrollment_error = error.message;
    await confirmation.save();
    if (error?.code === 11000) {
      error.statusCode = 409;
      error.message = "Student identifiers or application enrollment already exist.";
    } else if (error?.name === "ValidationError" || error?.name === "CastError") {
      error.statusCode = 400;
    }
    throw error;
  }
}

module.exports = { processEnrollmentTrigger };

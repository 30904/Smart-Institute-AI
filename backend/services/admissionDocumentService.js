const fs = require("fs/promises");
const path = require("path");
const mongoose = require("mongoose");

const AdmissionApplication = require("../models/AdmissionApplication");
const AdmissionApplicationDocument = require("../models/AdmissionApplicationDocument");
const AdmissionDocumentType = require("../models/AdmissionDocumentType");
const { inspectAdmissionDocument } = require("./documentOcrService");

const backendRoot = path.resolve(__dirname, "..");

function sanitizeDocument(document) {
  const value = document.toObject ? document.toObject() : document;
  return {
    ...value,
    id: value._id.toString(),
    _id: undefined,
    __v: undefined
  };
}

function requireValidId(value, field) {
  if (!mongoose.isValidObjectId(value)) {
    const error = new Error(`${field} contains an invalid id.`);
    error.statusCode = 400;
    throw error;
  }
}

async function removeStoredFile(filePath) {
  if (!filePath) return;
  const absolutePath = path.resolve(backendRoot, filePath);
  const uploadsRoot = path.resolve(backendRoot, "uploads");
  if (!absolutePath.startsWith(`${uploadsRoot}${path.sep}`)) return;
  await fs.unlink(absolutePath).catch(() => {});
}

async function getApplication(applicationId) {
  requireValidId(applicationId, "application_id");
  const application = await AdmissionApplication.findById(applicationId);
  if (!application) {
    const error = new Error("Admission application not found.");
    error.statusCode = 404;
    throw error;
  }
  return application;
}

async function getDocumentType(documentTypeId) {
  requireValidId(documentTypeId, "document_type_id");
  const documentType = await AdmissionDocumentType.findById(documentTypeId);
  if (!documentType) {
    const error = new Error("Admission document type not found.");
    error.statusCode = 400;
    throw error;
  }
  return documentType;
}

function validateDocumentApplicability(application, documentType) {
  if (!documentType.applies_to_program_ids.length) return;
  const preferredPrograms = new Set(application.program_preferences.map(String));
  const applies = documentType.applies_to_program_ids.some((programId) => preferredPrograms.has(String(programId)));
  if (!applies) {
    const error = new Error("This document type does not apply to the application's program preferences.");
    error.statusCode = 400;
    throw error;
  }
}

async function uploadApplicationDocument({ applicationId, documentTypeId, file, userId }) {
  if (!file) {
    const error = new Error("A document file is required.");
    error.statusCode = 400;
    throw error;
  }

  const relativeFilePath = path.posix.join("uploads", "admissions", file.filename);

  try {
    const application = await getApplication(applicationId);
    const documentType = await getDocumentType(documentTypeId);
    validateDocumentApplicability(application, documentType);

    const ocr = await inspectAdmissionDocument(file);
    let document = await AdmissionApplicationDocument.findOne({
      application_id: applicationId,
      document_type_id: documentTypeId
    });
    const previousFilePath = document?.file_path;

    if (!document) {
      document = new AdmissionApplicationDocument({
        application_id: applicationId,
        document_type_id: documentTypeId
      });
    }

    document.set({
      original_name: String(file.originalname || "document").split(/[\\/]/).pop(),
      storage_name: file.filename,
      file_path: relativeFilePath,
      mime_type: file.mimetype,
      size: file.size,
      verification_status: "pending",
      verification_remarks: "",
      verified_by: null,
      verified_at: null,
      uploaded_by: userId,
      ocr
    });
    await document.save();

    if (previousFilePath && previousFilePath !== relativeFilePath) {
      await removeStoredFile(previousFilePath);
    }

    return sanitizeDocument(document);
  } catch (error) {
    await removeStoredFile(relativeFilePath);
    if (error?.code === 11000) {
      error.statusCode = 409;
      error.message = "A document of this checklist type already exists.";
    } else if (error?.name === "ValidationError" || error?.name === "CastError") {
      error.statusCode = 400;
    }
    throw error;
  }
}

async function listApplicationDocuments(applicationId) {
  await getApplication(applicationId);
  const documents = await AdmissionApplicationDocument.find({ application_id: applicationId }).sort({ createdAt: 1 });
  return documents.map(sanitizeDocument);
}

async function updateDocumentVerification({ applicationId, documentId, status, remarks, userId }) {
  requireValidId(applicationId, "application_id");
  requireValidId(documentId, "document_id");

  if (!["verified", "rejected"].includes(status)) {
    const error = new Error("Verification status must be verified or rejected.");
    error.statusCode = 400;
    throw error;
  }
  if (status === "rejected" && !String(remarks || "").trim()) {
    const error = new Error("Rejection remarks are required.");
    error.statusCode = 400;
    throw error;
  }

  const document = await AdmissionApplicationDocument.findOne({
    _id: documentId,
    application_id: applicationId
  });
  if (!document) {
    const error = new Error("Application document not found.");
    error.statusCode = 404;
    throw error;
  }

  document.verification_status = status;
  document.verification_remarks = String(remarks || "").trim();
  document.verified_by = userId;
  document.verified_at = new Date();
  await document.save();
  return sanitizeDocument(document);
}

module.exports = {
  uploadApplicationDocument,
  listApplicationDocuments,
  updateDocumentVerification
};

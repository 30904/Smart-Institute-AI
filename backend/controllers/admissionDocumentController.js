const {
  uploadApplicationDocument,
  listApplicationDocuments,
  updateDocumentVerification
} = require("../services/admissionDocumentService");
const { sendSuccess } = require("../utils/response");

async function upload(req, res, next) {
  try {
    const data = await uploadApplicationDocument({
      applicationId: req.params.applicationId,
      documentTypeId: req.body?.document_type_id,
      file: req.file,
      userId: req.user._id
    });
    sendSuccess(res, { data, message: "Application document uploaded.", statusCode: 201 });
  } catch (error) {
    next(error);
  }
}

async function list(req, res, next) {
  try {
    const data = await listApplicationDocuments(req.params.applicationId);
    sendSuccess(res, { data, message: "Application documents fetched." });
  } catch (error) {
    next(error);
  }
}

async function verify(req, res, next) {
  try {
    const data = await updateDocumentVerification({
      applicationId: req.params.applicationId,
      documentId: req.params.documentId,
      status: "verified",
      remarks: req.body?.remarks,
      userId: req.user._id
    });
    sendSuccess(res, { data, message: "Application document verified." });
  } catch (error) {
    next(error);
  }
}

async function reject(req, res, next) {
  try {
    const data = await updateDocumentVerification({
      applicationId: req.params.applicationId,
      documentId: req.params.documentId,
      status: "rejected",
      remarks: req.body?.remarks,
      userId: req.user._id
    });
    sendSuccess(res, { data, message: "Application document rejected." });
  } catch (error) {
    next(error);
  }
}

module.exports = { upload, list, verify, reject };

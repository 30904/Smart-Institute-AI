const express = require("express");

const { list, getById, create, update } = require("../controllers/admissionApplicationController");
const {
  upload: uploadDocument,
  list: listDocuments,
  verify: verifyDocument,
  reject: rejectDocument
} = require("../controllers/admissionDocumentController");
const requireAuth = require("../middleware/requireAuth");
const requirePermission = require("../middleware/requirePermission");
const { uploadAdmissionDocument } = require("../middleware/uploadAdmissionDocument");

const router = express.Router();

router.use(requireAuth);

router.get("/", requirePermission("admissions", "view"), list);
router.get("/:applicationId/documents", requirePermission("admissions", "view"), listDocuments);
router.post(
  "/:applicationId/documents",
  requirePermission("admissions", "create"),
  uploadAdmissionDocument,
  uploadDocument
);
router.patch(
  "/:applicationId/documents/:documentId/verify",
  requirePermission("admissions", "edit"),
  verifyDocument
);
router.patch(
  "/:applicationId/documents/:documentId/reject",
  requirePermission("admissions", "edit"),
  rejectDocument
);
router.get("/:id", requirePermission("admissions", "view"), getById);
router.post("/", requirePermission("admissions", "create"), create);
router.put("/:id", requirePermission("admissions", "edit"), update);

module.exports = router;

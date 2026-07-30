const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const uploadDirectory = path.resolve(__dirname, "..", "uploads", "admissions");
fs.mkdirSync(uploadDirectory, { recursive: true });

const allowedTypes = {
  "application/pdf": ".pdf",
  "image/jpeg": ".jpg",
  "image/png": ".png"
};

const storage = multer.diskStorage({
  destination: uploadDirectory,
  filename(_req, file, callback) {
    callback(null, `${crypto.randomUUID()}${allowedTypes[file.mimetype]}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 1
  },
  fileFilter(_req, file, callback) {
    if (!allowedTypes[file.mimetype]) {
      const error = new Error("Only PDF, JPEG, and PNG admission documents are allowed.");
      error.statusCode = 400;
      callback(error);
      return;
    }
    callback(null, true);
  }
});

function uploadAdmissionDocument(req, res, next) {
  upload.single("file")(req, res, (error) => {
    if (error) {
      error.statusCode = error.statusCode || 400;
      next(error);
      return;
    }
    next();
  });
}

module.exports = { uploadAdmissionDocument, uploadDirectory };

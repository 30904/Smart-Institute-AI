const express = require("express");

const { summary, exportCsv } = require("../controllers/admissionReportController");
const requireAuth = require("../middleware/requireAuth");
const requirePermission = require("../middleware/requirePermission");

const router = express.Router();

router.use(requireAuth);

router.get("/", requirePermission("admissions", "view"), summary);
router.get("/export", requirePermission("admissions", "view"), exportCsv);

module.exports = router;

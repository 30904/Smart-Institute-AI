const express = require("express");

const { process } = require("../controllers/studentEnrollmentController");
const requireAuth = require("../middleware/requireAuth");
const requirePermission = require("../middleware/requirePermission");

const router = express.Router();

router.use(requireAuth);

router.post("/process", requirePermission("admissions", "approve"), process);

module.exports = router;

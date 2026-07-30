const express = require("express");

const { generate, list } = require("../controllers/admissionMeritController");
const requireAuth = require("../middleware/requireAuth");
const requirePermission = require("../middleware/requirePermission");

const router = express.Router();

router.use(requireAuth);

router.get("/", requirePermission("admissions", "view"), list);
router.post("/generate", requirePermission("admissions", "approve"), generate);

module.exports = router;

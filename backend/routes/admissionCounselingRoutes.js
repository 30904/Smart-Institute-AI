const express = require("express");

const { allocate, list } = require("../controllers/admissionCounselingController");
const requireAuth = require("../middleware/requireAuth");
const requirePermission = require("../middleware/requirePermission");

const router = express.Router();

router.use(requireAuth);

router.get("/allocations", requirePermission("admissions", "view"), list);
router.post("/allocate", requirePermission("admissions", "approve"), allocate);

module.exports = router;

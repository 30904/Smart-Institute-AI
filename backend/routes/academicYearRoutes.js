const express = require("express");

const { getAcademicYears, getAcademicYear, create, update, setCurrent } = require("../controllers/academicYearController");
const requireAuth = require("../middleware/requireAuth");
const requirePermission = require("../middleware/requirePermission");

const router = express.Router();

router.use(requireAuth);

router.get("/", requirePermission("settings", "view"), getAcademicYears);
router.get("/:id", requirePermission("settings", "view"), getAcademicYear);
router.post("/", requirePermission("settings", "create"), create);
router.put("/:id", requirePermission("settings", "edit"), update);
router.patch("/:id/set-current", requirePermission("settings", "edit"), setCurrent);

module.exports = router;

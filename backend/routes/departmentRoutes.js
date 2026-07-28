const express = require("express");

const { getDepartments, getDepartment, create, update } = require("../controllers/departmentController");
const requireAuth = require("../middleware/requireAuth");
const requirePermission = require("../middleware/requirePermission");

const router = express.Router();

router.use(requireAuth);

router.get("/", requirePermission("settings", "view"), getDepartments);
router.get("/:id", requirePermission("settings", "view"), getDepartment);
router.post("/", requirePermission("settings", "create"), create);
router.put("/:id", requirePermission("settings", "edit"), update);

module.exports = router;

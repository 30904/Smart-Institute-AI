const express = require("express");

const { getPrograms, getProgram, create, update } = require("../controllers/programController");
const requireAuth = require("../middleware/requireAuth");
const requirePermission = require("../middleware/requirePermission");

const router = express.Router();

router.use(requireAuth);

router.get("/", requirePermission("settings", "view"), getPrograms);
router.get("/:id", requirePermission("settings", "view"), getProgram);
router.post("/", requirePermission("settings", "create"), create);
router.put("/:id", requirePermission("settings", "edit"), update);

module.exports = router;

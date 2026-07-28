const express = require("express");

const { getContext, getProfile, updateProfile } = require("../controllers/institutionController");
const requireAuth = require("../middleware/requireAuth");
const requirePermission = require("../middleware/requirePermission");

const router = express.Router();

router.get("/context", getContext);
router.get("/profile", requireAuth, requirePermission("settings", "view"), getProfile);
router.put("/profile", requireAuth, requirePermission("settings", "edit"), updateProfile);

module.exports = router;

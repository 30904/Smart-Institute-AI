const express = require("express");

const { getUsers, getUser, create, update, deactivate, updatePermissionOverrides } = require("../controllers/userController");
const requireAuth = require("../middleware/requireAuth");
const requirePermission = require("../middleware/requirePermission");

const router = express.Router();

router.use(requireAuth);

router.get("/", requirePermission("users", "view"), getUsers);
router.get("/:id", requirePermission("users", "view"), getUser);
router.post("/", requirePermission("users", "create"), create);
router.put("/:id", requirePermission("users", "edit"), update);
router.put("/:id/permission-overrides", requirePermission("users", "edit"), updatePermissionOverrides);
router.patch("/:id/deactivate", requirePermission("users", "edit"), deactivate);

module.exports = router;

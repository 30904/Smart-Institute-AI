const express = require("express");

const { listOptions, list, getById, create, update, remove } = require("../controllers/admissionMasterController");
const requireAuth = require("../middleware/requireAuth");
const requirePermission = require("../middleware/requirePermission");

const router = express.Router();

router.use(requireAuth);

router.get("/options/:source", requirePermission("admissions", "view"), listOptions);
router.get("/:resource", requirePermission("admissions", "view"), list);
router.get("/:resource/:id", requirePermission("admissions", "view"), getById);
router.post("/:resource", requirePermission("admissions", "create"), create);
router.put("/:resource/:id", requirePermission("admissions", "edit"), update);
router.delete("/:resource/:id", requirePermission("admissions", "delete"), remove);

module.exports = router;

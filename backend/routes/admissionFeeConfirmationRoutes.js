const express = require("express");

const { confirm, list } = require("../controllers/admissionFeeConfirmationController");
const requireAuth = require("../middleware/requireAuth");
const requirePermission = require("../middleware/requirePermission");

const router = express.Router();

router.use(requireAuth);

router.post("/", requirePermission("fees", "create"), confirm);
router.get("/:applicationId", requirePermission("admissions", "view"), list);

module.exports = router;

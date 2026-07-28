const express = require("express");

const coreRoutes = require("./coreRoutes");
const academicRoutes = require("./academicRoutes");

const router = express.Router();

router.use("/", coreRoutes);
router.use("/academic", academicRoutes);

module.exports = router;

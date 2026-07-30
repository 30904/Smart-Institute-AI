const express = require("express");

const healthRoutes = require("./healthRoutes");
const authRoutes = require("./authRoutes");
const institutionRoutes = require("./institutionRoutes");
const userRoutes = require("./userRoutes");
const academicYearRoutes = require("./academicYearRoutes");
const departmentRoutes = require("./departmentRoutes");
const programRoutes = require("./programRoutes");
const admissionMasterRoutes = require("./admissionMasterRoutes");
const admissionApplicationRoutes = require("./admissionApplicationRoutes");

const router = express.Router();

router.use("/", healthRoutes);
router.use("/auth", authRoutes);
router.use("/institution", institutionRoutes);
router.use("/users", userRoutes);
router.use("/academic-years", academicYearRoutes);
router.use("/departments", departmentRoutes);
router.use("/programs", programRoutes);
router.use("/admissions/masters", admissionMasterRoutes);
router.use("/admissions/applications", admissionApplicationRoutes);

module.exports = router;

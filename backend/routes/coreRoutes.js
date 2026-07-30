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
const admissionMeritRoutes = require("./admissionMeritRoutes");
const admissionCounselingRoutes = require("./admissionCounselingRoutes");
const admissionFeeConfirmationRoutes = require("./admissionFeeConfirmationRoutes");
const studentEnrollmentRoutes = require("./studentEnrollmentRoutes");
const admissionReportRoutes = require("./admissionReportRoutes");

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
router.use("/admissions/merit-lists", admissionMeritRoutes);
router.use("/admissions/counseling", admissionCounselingRoutes);
router.use("/admissions/fee-confirmations", admissionFeeConfirmationRoutes);
router.use("/admissions/enrollments", studentEnrollmentRoutes);
router.use("/admissions/reports", admissionReportRoutes);

module.exports = router;

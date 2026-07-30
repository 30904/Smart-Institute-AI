const express = require("express");
const {
  getSlots,
  createSlot,
  assignFacultyToSlot,
  getFacultyAvailability
} = require("../controllers/timetableController");
const academicMasterController = require("../controllers/academicMasterController");
const facultyAttendanceController = require("../controllers/facultyAttendanceController");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

// Faculty Type Routes
router.route("/faculty-types")
  .get(academicMasterController.getFacultyTypes)
  .post(academicMasterController.createFacultyType);
router.route("/faculty-types/:id")
  .get(academicMasterController.getFacultyType)
  .put(academicMasterController.updateFacultyType);

// Designation Routes
router.route("/designations")
  .get(academicMasterController.getDesignations)
  .post(academicMasterController.createDesignation);
router.route("/designations/:id")
  .get(academicMasterController.getDesignation)
  .put(academicMasterController.updateDesignation);

// Qualification Master Routes
router.route("/qualification-masters")
  .get(academicMasterController.getQualificationMasters)
  .post(academicMasterController.createQualificationMaster);
router.route("/qualification-masters/:id")
  .get(academicMasterController.getQualificationMaster)
  .put(academicMasterController.updateQualificationMaster);

// Subject Routes
router.route("/subjects")
  .get(academicMasterController.getSubjects)
  .post(academicMasterController.createSubject);
router.route("/subjects/:id")
  .get(academicMasterController.getSubject)
  .put(academicMasterController.updateSubject);

// Timetable Routes
router.route("/timetable/slots")
  .get(getSlots)
  .post(createSlot);

router.put("/timetable/slots/:id/assign-faculty", assignFacultyToSlot);
router.get("/timetable/faculty-availability", getFacultyAvailability);

// Attendance Routes
router.get("/attendance/status", requireAuth, facultyAttendanceController.getStatus);
router.post("/attendance/punch-in", requireAuth, facultyAttendanceController.punchIn);
router.post("/attendance/punch-out", requireAuth, facultyAttendanceController.punchOut);
router.get("/attendance/records", requireAuth, facultyAttendanceController.getRecords);

module.exports = router;

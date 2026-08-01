const express = require("express");
const {
  getSlots,
  createSlot,
  assignFacultyToSlot,
  getFacultyAvailability
} = require("../controllers/timetableController");
const academicMasterController = require("../controllers/academicMasterController");
const facultyAttendanceController = require("../controllers/facultyAttendanceController");
const facultyLeaveController = require("../controllers/facultyLeaveController");
const facultyPerformanceController = require("../controllers/facultyPerformanceController");
const facultyRegistrationController = require("../controllers/facultyRegistrationController");
const workloadRuleController = require("../controllers/workloadRuleController");
const subjectAllocationController = require("../controllers/subjectAllocationController");
const facultyResearchController = require("../controllers/facultyResearchController");
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

// Leave Routes
router.get("/leaves/conflicts", requireAuth, facultyLeaveController.checkConflicts);
router.route("/leaves")
  .get(requireAuth, facultyLeaveController.getLeaves)
  .post(requireAuth, facultyLeaveController.applyLeave);
router.put("/leaves/:id/status", requireAuth, facultyLeaveController.updateLeaveStatus);

// Performance Routes
router.get("/performance/stats", requireAuth, facultyPerformanceController.getPerformanceStats);
router.route("/performance")
  .get(requireAuth, facultyPerformanceController.getPerformanceRecords)
  .post(requireAuth, facultyPerformanceController.addPerformanceRecord);

// Faculty Registration Routes
router.route("/faculty-registration")
  .get(requireAuth, facultyRegistrationController.getAllFaculty)
  .post(requireAuth, facultyRegistrationController.registerFaculty);
router.route("/faculty-registration/:id")
  .get(requireAuth, facultyRegistrationController.getFacultyById)
  .put(requireAuth, facultyRegistrationController.updateFaculty)
  .delete(requireAuth, facultyRegistrationController.deleteFaculty);

// Workload Rules Routes
router.route("/workload-rules")
  .get(requireAuth, workloadRuleController.getAllWorkloadRules)
  .post(requireAuth, workloadRuleController.createWorkloadRule);
router.route("/workload-rules/:id")
  .get(requireAuth, workloadRuleController.getWorkloadRuleById)
  .put(requireAuth, workloadRuleController.updateWorkloadRule)
  .delete(requireAuth, workloadRuleController.deleteWorkloadRule);

// Subject Allocation Routes
router.route("/subject-allocations")
  .get(requireAuth, subjectAllocationController.getAllocations)
  .post(requireAuth, subjectAllocationController.assignSubject);
router.route("/subject-allocations/:id")
  .delete(requireAuth, subjectAllocationController.removeAllocation);

// Research — Publications Routes
router.route("/publications")
  .get(requireAuth, facultyResearchController.getPublications)
  .post(requireAuth, facultyResearchController.addPublication);
router.route("/publications/:id")
  .put(requireAuth, facultyResearchController.updatePublication)
  .delete(requireAuth, facultyResearchController.deletePublication);

// Research — Training Routes
router.route("/trainings")
  .get(requireAuth, facultyResearchController.getTrainings)
  .post(requireAuth, facultyResearchController.addTraining);
router.route("/trainings/:id")
  .put(requireAuth, facultyResearchController.updateTraining)
  .delete(requireAuth, facultyResearchController.deleteTraining);

module.exports = router;

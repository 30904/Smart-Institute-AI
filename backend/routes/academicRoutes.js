const express = require("express");
const {
  getSlots,
  createSlot,
  assignFacultyToSlot,
  getFacultyAvailability
} = require("../controllers/timetableController");

const router = express.Router();

// Timetable Routes
router.route("/timetable/slots")
  .get(getSlots)
  .post(createSlot);

router.put("/timetable/slots/:id/assign-faculty", assignFacultyToSlot);
router.get("/timetable/faculty-availability", getFacultyAvailability);

module.exports = router;

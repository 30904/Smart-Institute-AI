const facultyAttendanceService = require("../services/facultyAttendanceService");
const { sendSuccess } = require("../utils/response");

async function getStatus(req, res, next) {
  try {
    const userId = req.user.id;
    const data = await facultyAttendanceService.getPunchStatus(userId);
    sendSuccess(res, { data, message: "Punch status fetched." });
  } catch (error) {
    next(error);
  }
}

async function punchIn(req, res, next) {
  try {
    const userId = req.user.id;
    const data = await facultyAttendanceService.punchIn(userId);
    sendSuccess(res, { data, message: "Punched in successfully." });
  } catch (error) {
    next(error);
  }
}

async function punchOut(req, res, next) {
  try {
    const userId = req.user.id;
    const data = await facultyAttendanceService.punchOut(userId);
    sendSuccess(res, { data, message: "Punched out successfully." });
  } catch (error) {
    next(error);
  }
}

async function getRecords(req, res, next) {
  try {
    const { faculty_id, startDate, endDate } = req.query;
    
    // If user is not an admin, they can only see their own records
    // Assuming simple authorization here for demonstration
    // In a real scenario, check req.user.permissions or role
    let filterFacultyId = faculty_id;
    if (req.user.role !== "Admin" && !req.user.permissions?.includes("faculty:view")) {
      filterFacultyId = req.user.id;
    }

    const filters = {
      faculty_id: filterFacultyId,
      startDate,
      endDate
    };

    const data = await facultyAttendanceService.getAttendanceRecords(filters);
    sendSuccess(res, { data, message: "Attendance records fetched." });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getStatus,
  punchIn,
  punchOut,
  getRecords
};

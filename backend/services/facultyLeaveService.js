const FacultyLeave = require("../models/FacultyLeave");
const TimetableSlot = require("../models/TimetableSlot");

/**
 * Helper: Given a start date and end date, returns an array of unique weekday names
 * (e.g. ["Monday", "Tuesday", "Wednesday"]) that fall within the range.
 */
function getDaysInRange(startDate, endDate) {
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const start = new Date(startDate);
  const end = new Date(endDate);
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  const daysFound = new Set();
  let current = new Date(start);
  
  // If the range spans 7 or more days, it covers all days of the week.
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays >= 7) {
    return daysOfWeek;
  }

  while (current <= end) {
    daysFound.add(daysOfWeek[current.getDay()]);
    current.setDate(current.getDate() + 1);
  }

  return Array.from(daysFound);
}

const checkConflicts = async (facultyId, startDate, endDate) => {
  const daysInRange = getDaysInRange(startDate, endDate);
  
  // Find timetable slots for this faculty on those days
  const conflictingSlots = await TimetableSlot.find({
    faculty_id: facultyId,
    day: { $in: daysInRange },
    is_active: true
  }).sort({ day: 1, period: 1 });

  return conflictingSlots;
};

const applyLeave = async (data) => {
  const { faculty_id, leave_type, start_date, end_date, reason } = data;
  
  if (new Date(start_date) > new Date(end_date)) {
    throw new Error("Start date cannot be after end date.");
  }

  const newLeave = new FacultyLeave({
    faculty_id,
    leave_type,
    start_date,
    end_date,
    reason,
    status: "Pending"
  });

  await newLeave.save();
  return newLeave;
};

const getLeaves = async (query = {}) => {
  const leaves = await FacultyLeave.find(query)
    .populate("faculty_id", "name email")
    .populate("approved_by", "name email")
    .sort({ createdAt: -1 });
  return leaves;
};

const updateLeaveStatus = async (leaveId, status, approvedBy, comments = "") => {
  const leave = await FacultyLeave.findById(leaveId);
  if (!leave) {
    throw new Error("Leave application not found.");
  }

  leave.status = status;
  leave.approved_by = approvedBy;
  leave.comments = comments;
  
  await leave.save();
  return leave;
};

module.exports = {
  checkConflicts,
  applyLeave,
  getLeaves,
  updateLeaveStatus
};

const FacultyAttendance = require("../models/FacultyAttendance");

// Helper to get the start of the current day in UTC
function getStartOfDay() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

async function getPunchStatus(userId) {
  const startOfDay = getStartOfDay();
  let record = await FacultyAttendance.findOne({
    faculty_id: userId,
    date: startOfDay
  });

  if (!record) {
    return { status: "Not Punched In", record: null };
  }

  if (record.punch_in_time && !record.punch_out_time) {
    return { status: "Punched In", record };
  }

  if (record.punch_in_time && record.punch_out_time) {
    return { status: "Punched Out", record };
  }

  return { status: "Unknown", record };
}

async function punchIn(userId) {
  const startOfDay = getStartOfDay();
  let record = await FacultyAttendance.findOne({
    faculty_id: userId,
    date: startOfDay
  });

  if (record && record.punch_in_time) {
    throw new Error("Already punched in for today.");
  }

  if (!record) {
    record = new FacultyAttendance({
      faculty_id: userId,
      date: startOfDay,
      punch_in_time: new Date(),
      status: "Missing Punch" // Will be updated on punch out
    });
  } else {
    record.punch_in_time = new Date();
    record.status = "Missing Punch";
  }

  await record.save();
  return record;
}

async function punchOut(userId) {
  const startOfDay = getStartOfDay();
  let record = await FacultyAttendance.findOne({
    faculty_id: userId,
    date: startOfDay
  });

  if (!record || !record.punch_in_time) {
    throw new Error("Cannot punch out without punching in first.");
  }

  if (record.punch_out_time) {
    throw new Error("Already punched out for today.");
  }

  const punchOutTime = new Date();
  record.punch_out_time = punchOutTime;

  // Calculate duration to determine status
  const durationMs = punchOutTime - record.punch_in_time;
  const hours = durationMs / (1000 * 60 * 60);

  if (hours >= 8) {
    record.status = "Present";
  } else if (hours >= 4) {
    record.status = "Half-Day";
  } else {
    record.status = "Absent"; // Or maybe "Half-Day" depending on rules
  }

  await record.save();
  return record;
}

async function getAttendanceRecords(filters = {}) {
  const query = {};
  if (filters.faculty_id) {
    query.faculty_id = filters.faculty_id;
  }
  if (filters.startDate || filters.endDate) {
    query.date = {};
    if (filters.startDate) query.date.$gte = new Date(filters.startDate);
    if (filters.endDate) query.date.$lte = new Date(filters.endDate);
  }

  return FacultyAttendance.find(query)
    .populate("faculty_id", "firstName lastName email")
    .sort({ date: -1 });
}

module.exports = {
  getPunchStatus,
  punchIn,
  punchOut,
  getAttendanceRecords
};

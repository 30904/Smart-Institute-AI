const facultyLeaveService = require("../services/facultyLeaveService");

const applyLeave = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      faculty_id: req.user.id // assuming requireAuth middleware populates req.user
    };
    const newLeave = await facultyLeaveService.applyLeave(data);
    res.status(201).json({ success: true, data: newLeave });
  } catch (error) {
    next(error);
  }
};

const getLeaves = async (req, res, next) => {
  try {
    const query = {};
    // If the user does not have approval permissions, restrict to their own leaves
    if (!req.user.permissions?.includes("faculty_leave:approve")) {
      query.faculty_id = req.user.id;
    }
    
    const leaves = await facultyLeaveService.getLeaves(query);
    res.status(200).json({ success: true, data: leaves });
  } catch (error) {
    next(error);
  }
};

const updateLeaveStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, comments } = req.body;
    
    if (!req.user.permissions?.includes("faculty_leave:approve")) {
      return res.status(403).json({ success: false, message: "Forbidden: You cannot approve/reject leaves." });
    }

    const updatedLeave = await facultyLeaveService.updateLeaveStatus(id, status, req.user.id, comments);
    res.status(200).json({ success: true, data: updatedLeave });
  } catch (error) {
    next(error);
  }
};

const checkConflicts = async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;
    if (!start_date || !end_date) {
      return res.status(400).json({ success: false, message: "start_date and end_date are required." });
    }

    const conflicts = await facultyLeaveService.checkConflicts(req.user.id, start_date, end_date);
    res.status(200).json({ success: true, data: conflicts });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  applyLeave,
  getLeaves,
  updateLeaveStatus,
  checkConflicts
};

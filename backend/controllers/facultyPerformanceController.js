const facultyPerformanceService = require("../services/facultyPerformanceService");

const addPerformanceRecord = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      reviewer_id: req.user.id
    };
    const newRecord = await facultyPerformanceService.addPerformanceRecord(data);
    res.status(201).json({ success: true, data: newRecord });
  } catch (error) {
    next(error);
  }
};

const getPerformanceRecords = async (req, res, next) => {
  try {
    const query = {};
    // If not an approver/admin, restrict to own performance records
    if (!req.user.permissions?.includes("faculty_performance:manage")) {
      query.faculty_id = req.user.id;
    }
    
    // Optional filter by a specific faculty if admin requests it
    if (req.query.faculty_id && req.user.permissions?.includes("faculty_performance:manage")) {
      query.faculty_id = req.query.faculty_id;
    }

    const records = await facultyPerformanceService.getPerformanceRecords(query);
    res.status(200).json({ success: true, data: records });
  } catch (error) {
    next(error);
  }
};

const getPerformanceStats = async (req, res, next) => {
  try {
    const query = {};
    if (!req.user.permissions?.includes("faculty_performance:manage")) {
      query.faculty_id = req.user.id;
    }
    
    if (req.query.faculty_id && req.user.permissions?.includes("faculty_performance:manage")) {
      query.faculty_id = req.query.faculty_id;
    }

    const stats = await facultyPerformanceService.getPerformanceStats(query);
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addPerformanceRecord,
  getPerformanceRecords,
  getPerformanceStats
};

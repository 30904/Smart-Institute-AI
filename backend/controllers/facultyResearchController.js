const FacultyPublication = require("../models/FacultyPublication");
const FacultyTraining = require("../models/FacultyTraining");
const { sendSuccess } = require("../utils/response");

// ─── PUBLICATIONS ─────────────────────────────────────────────────────────────

exports.getPublications = async (req, res, next) => {
  try {
    const { faculty_id, year, publication_type } = req.query;
    const query = {};
    if (faculty_id) query.faculty_id = faculty_id;
    if (year) query.year = year;
    if (publication_type) query.publication_type = publication_type;

    const records = await FacultyPublication.find(query)
      .populate("faculty_id", "first_name last_name employee_id department_id")
      .sort({ year: -1, createdAt: -1 });

    sendSuccess(res, { data: records, message: "Publications fetched." });
  } catch (error) {
    next(error);
  }
};

exports.addPublication = async (req, res, next) => {
  try {
    const record = await FacultyPublication.create(req.body);
    sendSuccess(res, { data: record, message: "Publication added.", statusCode: 201 });
  } catch (error) {
    next(error);
  }
};

exports.updatePublication = async (req, res, next) => {
  try {
    const record = await FacultyPublication.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!record) return res.status(404).json({ success: false, message: "Publication not found." });
    sendSuccess(res, { data: record, message: "Publication updated." });
  } catch (error) {
    next(error);
  }
};

exports.deletePublication = async (req, res, next) => {
  try {
    const record = await FacultyPublication.findByIdAndDelete(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: "Publication not found." });
    sendSuccess(res, { message: "Publication deleted." });
  } catch (error) {
    next(error);
  }
};

// ─── TRAININGS ────────────────────────────────────────────────────────────────

exports.getTrainings = async (req, res, next) => {
  try {
    const { faculty_id, training_type } = req.query;
    const query = {};
    if (faculty_id) query.faculty_id = faculty_id;
    if (training_type) query.training_type = training_type;

    const records = await FacultyTraining.find(query)
      .populate("faculty_id", "first_name last_name employee_id department_id")
      .sort({ from_date: -1 });

    sendSuccess(res, { data: records, message: "Training records fetched." });
  } catch (error) {
    next(error);
  }
};

exports.addTraining = async (req, res, next) => {
  try {
    const record = await FacultyTraining.create(req.body);
    sendSuccess(res, { data: record, message: "Training record added.", statusCode: 201 });
  } catch (error) {
    next(error);
  }
};

exports.updateTraining = async (req, res, next) => {
  try {
    const record = await FacultyTraining.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!record) return res.status(404).json({ success: false, message: "Training record not found." });
    sendSuccess(res, { data: record, message: "Training updated." });
  } catch (error) {
    next(error);
  }
};

exports.deleteTraining = async (req, res, next) => {
  try {
    const record = await FacultyTraining.findByIdAndDelete(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: "Training not found." });
    sendSuccess(res, { message: "Training record deleted." });
  } catch (error) {
    next(error);
  }
};

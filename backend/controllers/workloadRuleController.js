const WorkloadRule = require("../models/WorkloadRule");
const { sendSuccess } = require("../utils/response");

exports.getAllWorkloadRules = async (req, res, next) => {
  try {
    const rules = await WorkloadRule.find().populate("faculty_type_id", "name code");
    sendSuccess(res, { data: rules, message: "Workload rules fetched successfully." });
  } catch (error) {
    next(error);
  }
};

exports.getWorkloadRuleById = async (req, res, next) => {
  try {
    const rule = await WorkloadRule.findById(req.params.id).populate("faculty_type_id", "name code");
    if (!rule) {
      return res.status(404).json({ success: false, message: "Workload rule not found" });
    }
    sendSuccess(res, { data: rule, message: "Workload rule fetched successfully." });
  } catch (error) {
    next(error);
  }
};

exports.createWorkloadRule = async (req, res, next) => {
  try {
    const existing = await WorkloadRule.findOne({ faculty_type_id: req.body.faculty_type_id });
    if (existing) {
      return res.status(400).json({ success: false, message: "A workload rule already exists for this Faculty Type." });
    }
    const newRule = await WorkloadRule.create(req.body);
    sendSuccess(res, { data: newRule, message: "Workload rule created successfully.", statusCode: 201 });
  } catch (error) {
    next(error);
  }
};

exports.updateWorkloadRule = async (req, res, next) => {
  try {
    const rule = await WorkloadRule.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!rule) {
      return res.status(404).json({ success: false, message: "Workload rule not found" });
    }
    sendSuccess(res, { data: rule, message: "Workload rule updated successfully." });
  } catch (error) {
    next(error);
  }
};

exports.deleteWorkloadRule = async (req, res, next) => {
  try {
    const rule = await WorkloadRule.findByIdAndDelete(req.params.id);
    if (!rule) {
      return res.status(404).json({ success: false, message: "Workload rule not found" });
    }
    sendSuccess(res, { message: "Workload rule deleted successfully." });
  } catch (error) {
    next(error);
  }
};

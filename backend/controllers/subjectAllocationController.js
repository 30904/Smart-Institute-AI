const SubjectAllocation = require("../models/SubjectAllocation");
const WorkloadRule = require("../models/WorkloadRule");
const Faculty = require("../models/Faculty");
const Subject = require("../models/Subject");
const { sendSuccess } = require("../utils/response");
const mongoose = require("mongoose");

exports.getAllocations = async (req, res, next) => {
  try {
    const { academic_year_id, program_id, semester, faculty_id } = req.query;
    let query = {};
    if (academic_year_id) query.academic_year_id = academic_year_id;
    if (program_id) query.program_id = program_id;
    if (semester) query.semester = semester;
    if (faculty_id) query.faculty_id = faculty_id;

    const allocations = await SubjectAllocation.find(query)
      .populate("academic_year_id", "name")
      .populate("program_id", "name code")
      .populate("subject_id", "name code credits department")
      .populate({
        path: "faculty_id",
        select: "first_name last_name employee_id department_id faculty_type_id",
        populate: [
          { path: "department_id", select: "name" },
          { path: "faculty_type_id", select: "name" }
        ]
      })
      .sort({ semester: 1, createdAt: -1 });

    sendSuccess(res, { data: allocations, message: "Subject allocations fetched successfully." });
  } catch (error) {
    next(error);
  }
};

exports.assignSubject = async (req, res, next) => {
  try {
    const { academic_year_id, program_id, semester, subject_id, faculty_id, specialization_override } = req.body;

    // 1. Fetch Faculty and Subject details
    const faculty = await Faculty.findById(faculty_id);
    const subject = await Subject.findById(subject_id);

    if (!faculty) return res.status(404).json({ success: false, message: "Faculty not found" });
    if (!subject) return res.status(404).json({ success: false, message: "Subject not found" });

    // 2. Validate Specialization
    const isSameDepartment = String(faculty.department_id) === String(subject.department);
    if (!isSameDepartment && !specialization_override) {
      return res.status(400).json({ 
        success: false, 
        message: "Specialization Mismatch: The selected faculty is not in the same department as the subject.",
        requiresOverride: true 
      });
    }

    // 3. Validate Workload Rules
    const workloadRule = await WorkloadRule.findOne({ faculty_type_id: faculty.faculty_type_id });
    if (workloadRule) {
      // Find current allocations for this faculty in the given academic year and semester
      const currentAllocations = await SubjectAllocation.find({
        faculty_id: faculty._id,
        academic_year_id: academic_year_id,
        semester: semester
      });

      const currentCredits = currentAllocations.reduce((sum, alloc) => sum + alloc.assigned_credits, 0);
      const newTotalCredits = currentCredits + (subject.credits || 0);
      const newTotalSubjects = currentAllocations.length + 1;

      if (newTotalCredits > workloadRule.max_weekly_hours) {
        return res.status(400).json({ 
          success: false, 
          message: `Workload Exceeded: Assigning this subject will exceed the maximum allowed credits (${workloadRule.max_weekly_hours}) for this faculty's type. Current: ${currentCredits}, Adding: ${subject.credits}.` 
        });
      }

      if (newTotalSubjects > workloadRule.max_subjects_per_semester) {
        return res.status(400).json({ 
          success: false, 
          message: `Workload Exceeded: Maximum subjects allowed per semester is ${workloadRule.max_subjects_per_semester}.` 
        });
      }
    }

    // 4. Create Allocation
    const allocation = await SubjectAllocation.create({
      academic_year_id,
      program_id,
      semester,
      subject_id,
      faculty_id,
      assigned_credits: subject.credits || 0,
      specialization_override: !isSameDepartment
    });

    const populatedAllocation = await SubjectAllocation.findById(allocation._id)
      .populate("subject_id", "name code credits")
      .populate("faculty_id", "first_name last_name employee_id");

    sendSuccess(res, { data: populatedAllocation, message: "Subject assigned successfully.", statusCode: 201 });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "This subject is already assigned to this faculty for the selected semester and program." });
    }
    next(error);
  }
};

exports.removeAllocation = async (req, res, next) => {
  try {
    const allocation = await SubjectAllocation.findByIdAndDelete(req.params.id);
    if (!allocation) {
      return res.status(404).json({ success: false, message: "Allocation not found" });
    }
    sendSuccess(res, { message: "Subject allocation removed successfully." });
  } catch (error) {
    next(error);
  }
};

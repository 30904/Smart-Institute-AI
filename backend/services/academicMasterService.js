const FacultyType = require("../models/FacultyType");
const Designation = require("../models/Designation");
const QualificationMaster = require("../models/QualificationMaster");
const Subject = require("../models/Subject");

// ==========================================
// Faculty Type Services
// ==========================================
async function listFacultyTypes() {
  return FacultyType.find({}).sort({ createdAt: -1 });
}

async function getFacultyTypeById(id) {
  const facultyType = await FacultyType.findById(id);
  if (!facultyType) throw new Error("FacultyType not found");
  return facultyType;
}

async function createFacultyType(data) {
  const facultyType = new FacultyType(data);
  return facultyType.save();
}

async function updateFacultyType(id, data) {
  const facultyType = await FacultyType.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!facultyType) throw new Error("FacultyType not found");
  return facultyType;
}

// ==========================================
// Designation Services
// ==========================================
async function listDesignations() {
  return Designation.find({}).sort({ createdAt: -1 });
}

async function getDesignationById(id) {
  const designation = await Designation.findById(id);
  if (!designation) throw new Error("Designation not found");
  return designation;
}

async function createDesignation(data) {
  const designation = new Designation(data);
  return designation.save();
}

async function updateDesignation(id, data) {
  const designation = await Designation.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!designation) throw new Error("Designation not found");
  return designation;
}

// ==========================================
// Qualification Master Services
// ==========================================
async function listQualificationMasters() {
  return QualificationMaster.find({}).sort({ createdAt: -1 });
}

async function getQualificationMasterById(id) {
  const qualificationMaster = await QualificationMaster.findById(id);
  if (!qualificationMaster) throw new Error("QualificationMaster not found");
  return qualificationMaster;
}

async function createQualificationMaster(data) {
  const qualificationMaster = new QualificationMaster(data);
  return qualificationMaster.save();
}

async function updateQualificationMaster(id, data) {
  const qualificationMaster = await QualificationMaster.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!qualificationMaster) throw new Error("QualificationMaster not found");
  return qualificationMaster;
}

// ==========================================
// Subject Services
// ==========================================
async function listSubjects() {
  return Subject.find({}).populate("department", "name code").sort({ createdAt: -1 });
}

async function getSubjectById(id) {
  const subject = await Subject.findById(id).populate("department", "name code");
  if (!subject) throw new Error("Subject not found");
  return subject;
}

async function createSubject(data) {
  const subject = new Subject(data);
  return subject.save();
}

async function updateSubject(id, data) {
  const subject = await Subject.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!subject) throw new Error("Subject not found");
  return subject;
}

module.exports = {
  listFacultyTypes,
  getFacultyTypeById,
  createFacultyType,
  updateFacultyType,
  
  listDesignations,
  getDesignationById,
  createDesignation,
  updateDesignation,
  
  listQualificationMasters,
  getQualificationMasterById,
  createQualificationMaster,
  updateQualificationMaster,
  
  listSubjects,
  getSubjectById,
  createSubject,
  updateSubject
};

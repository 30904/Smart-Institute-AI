const academicMasterService = require("../services/academicMasterService");
const { sendSuccess } = require("../utils/response");

// ==========================================
// Faculty Type Handlers
// ==========================================
async function getFacultyTypes(_req, res, next) {
  try {
    const data = await academicMasterService.listFacultyTypes();
    sendSuccess(res, { data, message: "Faculty Types fetched." });
  } catch (error) {
    next(error);
  }
}

async function getFacultyType(req, res, next) {
  try {
    const data = await academicMasterService.getFacultyTypeById(req.params.id);
    sendSuccess(res, { data, message: "Faculty Type fetched." });
  } catch (error) {
    next(error);
  }
}

async function createFacultyType(req, res, next) {
  try {
    const data = await academicMasterService.createFacultyType(req.body || {});
    sendSuccess(res, { data, message: "Faculty Type created.", statusCode: 201 });
  } catch (error) {
    next(error);
  }
}

async function updateFacultyType(req, res, next) {
  try {
    const data = await academicMasterService.updateFacultyType(req.params.id, req.body || {});
    sendSuccess(res, { data, message: "Faculty Type updated." });
  } catch (error) {
    next(error);
  }
}

// ==========================================
// Designation Handlers
// ==========================================
async function getDesignations(_req, res, next) {
  try {
    const data = await academicMasterService.listDesignations();
    sendSuccess(res, { data, message: "Designations fetched." });
  } catch (error) {
    next(error);
  }
}

async function getDesignation(req, res, next) {
  try {
    const data = await academicMasterService.getDesignationById(req.params.id);
    sendSuccess(res, { data, message: "Designation fetched." });
  } catch (error) {
    next(error);
  }
}

async function createDesignation(req, res, next) {
  try {
    const data = await academicMasterService.createDesignation(req.body || {});
    sendSuccess(res, { data, message: "Designation created.", statusCode: 201 });
  } catch (error) {
    next(error);
  }
}

async function updateDesignation(req, res, next) {
  try {
    const data = await academicMasterService.updateDesignation(req.params.id, req.body || {});
    sendSuccess(res, { data, message: "Designation updated." });
  } catch (error) {
    next(error);
  }
}

// ==========================================
// Qualification Master Handlers
// ==========================================
async function getQualificationMasters(_req, res, next) {
  try {
    const data = await academicMasterService.listQualificationMasters();
    sendSuccess(res, { data, message: "Qualification Masters fetched." });
  } catch (error) {
    next(error);
  }
}

async function getQualificationMaster(req, res, next) {
  try {
    const data = await academicMasterService.getQualificationMasterById(req.params.id);
    sendSuccess(res, { data, message: "Qualification Master fetched." });
  } catch (error) {
    next(error);
  }
}

async function createQualificationMaster(req, res, next) {
  try {
    const data = await academicMasterService.createQualificationMaster(req.body || {});
    sendSuccess(res, { data, message: "Qualification Master created.", statusCode: 201 });
  } catch (error) {
    next(error);
  }
}

async function updateQualificationMaster(req, res, next) {
  try {
    const data = await academicMasterService.updateQualificationMaster(req.params.id, req.body || {});
    sendSuccess(res, { data, message: "Qualification Master updated." });
  } catch (error) {
    next(error);
  }
}

// ==========================================
// Subject Handlers
// ==========================================
async function getSubjects(_req, res, next) {
  try {
    const data = await academicMasterService.listSubjects();
    sendSuccess(res, { data, message: "Subjects fetched." });
  } catch (error) {
    next(error);
  }
}

async function getSubject(req, res, next) {
  try {
    const data = await academicMasterService.getSubjectById(req.params.id);
    sendSuccess(res, { data, message: "Subject fetched." });
  } catch (error) {
    next(error);
  }
}

async function createSubject(req, res, next) {
  try {
    const data = await academicMasterService.createSubject(req.body || {});
    sendSuccess(res, { data, message: "Subject created.", statusCode: 201 });
  } catch (error) {
    next(error);
  }
}

async function updateSubject(req, res, next) {
  try {
    const data = await academicMasterService.updateSubject(req.params.id, req.body || {});
    sendSuccess(res, { data, message: "Subject updated." });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getFacultyTypes,
  getFacultyType,
  createFacultyType,
  updateFacultyType,

  getDesignations,
  getDesignation,
  createDesignation,
  updateDesignation,

  getQualificationMasters,
  getQualificationMaster,
  createQualificationMaster,
  updateQualificationMaster,

  getSubjects,
  getSubject,
  createSubject,
  updateSubject
};

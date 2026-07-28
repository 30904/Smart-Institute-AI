const {
  listAcademicYears,
  getAcademicYearById,
  createAcademicYear,
  updateAcademicYear,
  setCurrentAcademicYear
} = require("../services/academicYearService");
const { sendSuccess } = require("../utils/response");

async function getAcademicYears(_req, res, next) {
  try {
    const data = await listAcademicYears();
    sendSuccess(res, { data, message: "Academic years fetched." });
  } catch (error) {
    next(error);
  }
}

async function getAcademicYear(req, res, next) {
  try {
    const data = await getAcademicYearById(req.params.id);
    sendSuccess(res, { data, message: "Academic year fetched." });
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    const data = await createAcademicYear(req.body || {});
    sendSuccess(res, { data, message: "Academic year created.", statusCode: 201 });
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const data = await updateAcademicYear(req.params.id, req.body || {});
    sendSuccess(res, { data, message: "Academic year updated." });
  } catch (error) {
    next(error);
  }
}

async function setCurrent(req, res, next) {
  try {
    const data = await setCurrentAcademicYear(req.params.id);
    sendSuccess(res, { data, message: "Current academic year updated." });
  } catch (error) {
    next(error);
  }
}

module.exports = { getAcademicYears, getAcademicYear, create, update, setCurrent };

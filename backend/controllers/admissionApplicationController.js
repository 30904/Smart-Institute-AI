const {
  listApplications,
  getApplicationById,
  createApplication,
  updateApplication
} = require("../services/admissionApplicationService");
const { sendSuccess } = require("../utils/response");

async function list(req, res, next) {
  try {
    const data = await listApplications({
      cycle_id: req.query.cycle_id,
      status: req.query.status
    });
    sendSuccess(res, { data, message: "Admission applications fetched." });
  } catch (error) {
    next(error);
  }
}

async function getById(req, res, next) {
  try {
    const data = await getApplicationById(req.params.id);
    sendSuccess(res, { data, message: "Admission application fetched." });
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    const data = await createApplication(req.body || {});
    sendSuccess(res, { data, message: "Admission application registered.", statusCode: 201 });
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const data = await updateApplication(req.params.id, req.body || {});
    sendSuccess(res, { data, message: "Admission application updated." });
  } catch (error) {
    next(error);
  }
}

module.exports = { list, getById, create, update };

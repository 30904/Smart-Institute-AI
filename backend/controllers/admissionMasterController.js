const {
  getMasterConfig,
  listAdmissionMasters,
  listAdmissionMasterOptions,
  getAdmissionMasterById,
  createAdmissionMaster,
  updateAdmissionMaster,
  deleteAdmissionMaster
} = require("../services/admissionMasterService");
const { sendSuccess } = require("../utils/response");

async function listOptions(req, res, next) {
  try {
    const data = await listAdmissionMasterOptions(req.params.source);
    sendSuccess(res, { data, message: "Admission master options fetched." });
  } catch (error) {
    next(error);
  }
}

async function list(req, res, next) {
  try {
    const config = getMasterConfig(req.params.resource);
    const data = await listAdmissionMasters(req.params.resource);
    sendSuccess(res, { data, message: `${config.label}s fetched.` });
  } catch (error) {
    next(error);
  }
}

async function getById(req, res, next) {
  try {
    const config = getMasterConfig(req.params.resource);
    const data = await getAdmissionMasterById(req.params.resource, req.params.id);
    sendSuccess(res, { data, message: `${config.label} fetched.` });
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    const config = getMasterConfig(req.params.resource);
    const data = await createAdmissionMaster(req.params.resource, req.body || {});
    sendSuccess(res, { data, message: `${config.label} created.`, statusCode: 201 });
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const config = getMasterConfig(req.params.resource);
    const data = await updateAdmissionMaster(req.params.resource, req.params.id, req.body || {});
    sendSuccess(res, { data, message: `${config.label} updated.` });
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    const config = getMasterConfig(req.params.resource);
    const data = await deleteAdmissionMaster(req.params.resource, req.params.id);
    sendSuccess(res, { data, message: `${config.label} deleted.` });
  } catch (error) {
    next(error);
  }
}

module.exports = { listOptions, list, getById, create, update, remove };

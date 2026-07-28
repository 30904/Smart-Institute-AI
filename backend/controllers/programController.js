const { listPrograms, getProgramById, createProgram, updateProgram } = require("../services/programService");
const { sendSuccess } = require("../utils/response");

async function getPrograms(_req, res, next) {
  try {
    const data = await listPrograms();
    sendSuccess(res, { data, message: "Programs fetched." });
  } catch (error) {
    next(error);
  }
}

async function getProgram(req, res, next) {
  try {
    const data = await getProgramById(req.params.id);
    sendSuccess(res, { data, message: "Program fetched." });
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    const data = await createProgram(req.body || {});
    sendSuccess(res, { data, message: "Program created.", statusCode: 201 });
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const data = await updateProgram(req.params.id, req.body || {});
    sendSuccess(res, { data, message: "Program updated." });
  } catch (error) {
    next(error);
  }
}

module.exports = { getPrograms, getProgram, create, update };

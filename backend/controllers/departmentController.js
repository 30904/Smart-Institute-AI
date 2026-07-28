const { listDepartments, getDepartmentById, createDepartment, updateDepartment } = require("../services/departmentService");
const { sendSuccess } = require("../utils/response");

async function getDepartments(_req, res, next) {
  try {
    const data = await listDepartments();
    sendSuccess(res, { data, message: "Departments fetched." });
  } catch (error) {
    next(error);
  }
}

async function getDepartment(req, res, next) {
  try {
    const data = await getDepartmentById(req.params.id);
    sendSuccess(res, { data, message: "Department fetched." });
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    const data = await createDepartment(req.body || {});
    sendSuccess(res, { data, message: "Department created.", statusCode: 201 });
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const data = await updateDepartment(req.params.id, req.body || {});
    sendSuccess(res, { data, message: "Department updated." });
  } catch (error) {
    next(error);
  }
}

module.exports = { getDepartments, getDepartment, create, update };

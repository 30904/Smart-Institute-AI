const { sendError } = require("../utils/response");

function errorHandler(err, _req, res, _next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  sendError(res, {
    statusCode,
    message,
    data: err.data || null
  });
}

module.exports = errorHandler;

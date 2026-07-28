function sendSuccess(res, { data = null, message = "OK", statusCode = 200 }) {
  res.status(statusCode).json({
    success: true,
    data,
    message
  });
}

function sendError(res, { message = "Internal server error", statusCode = 500, data = null }) {
  res.status(statusCode).json({
    success: false,
    data,
    message
  });
}

module.exports = { sendSuccess, sendError };

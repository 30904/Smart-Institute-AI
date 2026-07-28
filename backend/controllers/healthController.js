const { getHealthPayload } = require("../services/healthService");
const { sendSuccess } = require("../utils/response");

function getHealth(_req, res) {
  sendSuccess(res, {
    data: getHealthPayload(),
    message: "Backend scaffold is running."
  });
}

module.exports = { getHealth };

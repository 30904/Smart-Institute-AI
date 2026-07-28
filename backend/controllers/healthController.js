const { getHealthPayload } = require("../services/healthService");

function getHealth(_req, res) {
  res.json(getHealthPayload());
}

module.exports = { getHealth };

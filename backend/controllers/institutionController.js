const { getInstitutionContext } = require("../services/institutionService");
const { sendSuccess } = require("../utils/response");

async function getContext(_req, res, next) {
  try {
    const data = await getInstitutionContext();
    sendSuccess(res, {
      data,
      message: "Institution context fetched."
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getContext };

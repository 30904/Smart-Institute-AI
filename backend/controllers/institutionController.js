const { getInstitutionContext, getInstitutionProfile, updateInstitutionProfile } = require("../services/institutionService");
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

async function getProfile(_req, res, next) {
  try {
    const data = await getInstitutionProfile();
    sendSuccess(res, {
      data,
      message: "Institution profile fetched."
    });
  } catch (error) {
    next(error);
  }
}

async function updateProfile(req, res, next) {
  try {
    const data = await updateInstitutionProfile(req.body || {});
    sendSuccess(res, {
      data,
      message: "Institution profile updated."
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getContext, getProfile, updateProfile };

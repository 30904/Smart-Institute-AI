const { validateApplicationEligibility } = require("../services/admissionEligibilityService");
const { sendSuccess } = require("../utils/response");

async function validate(req, res, next) {
  try {
    const data = await validateApplicationEligibility(req.params.applicationId, req.body?.program_id);
    sendSuccess(res, {
      data,
      message: data.status === "eligible" ? "Application is eligible." : "Application is ineligible."
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { validate };

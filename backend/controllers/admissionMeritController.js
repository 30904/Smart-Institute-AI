const { generateMeritList, listMeritRecords } = require("../services/admissionMeritService");
const { sendSuccess } = require("../utils/response");

async function generate(req, res, next) {
  try {
    const data = await generateMeritList({
      cycleId: req.body?.cycle_id,
      programId: req.body?.program_id,
      userId: req.user._id
    });
    sendSuccess(res, { data, message: "Merit list generated." });
  } catch (error) {
    next(error);
  }
}

async function list(req, res, next) {
  try {
    const data = await listMeritRecords({
      cycleId: req.query.cycle_id,
      programId: req.query.program_id
    });
    sendSuccess(res, { data, message: "Merit list fetched." });
  } catch (error) {
    next(error);
  }
}

module.exports = { generate, list };

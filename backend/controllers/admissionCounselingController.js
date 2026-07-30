const {
  allocateCounselingSeats,
  listSeatAllocations
} = require("../services/admissionCounselingService");
const { sendSuccess } = require("../utils/response");

async function allocate(req, res, next) {
  try {
    const data = await allocateCounselingSeats({
      cycleId: req.body?.cycle_id,
      programId: req.body?.program_id,
      userId: req.user._id
    });
    sendSuccess(res, { data, message: "Counseling seat allocation completed." });
  } catch (error) {
    next(error);
  }
}

async function list(req, res, next) {
  try {
    const data = await listSeatAllocations({
      cycleId: req.query.cycle_id,
      programId: req.query.program_id,
      status: req.query.status
    });
    sendSuccess(res, { data, message: "Counseling allocations fetched." });
  } catch (error) {
    next(error);
  }
}

module.exports = { allocate, list };

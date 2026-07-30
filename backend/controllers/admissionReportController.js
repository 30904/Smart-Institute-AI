const { getAdmissionReports, exportAdmissionReport } = require("../services/admissionReportService");
const { sendSuccess } = require("../utils/response");

async function summary(req, res, next) {
  try {
    const data = await getAdmissionReports({
      cycleId: req.query.cycle_id,
      programId: req.query.program_id
    });
    sendSuccess(res, { data, message: "Admission reports fetched." });
  } catch (error) {
    next(error);
  }
}

async function exportCsv(req, res, next) {
  try {
    const result = await exportAdmissionReport({
      report: req.query.report,
      cycleId: req.query.cycle_id,
      programId: req.query.program_id
    });
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${result.filename}"`);
    res.status(200).send(`\uFEFF${result.content}`);
  } catch (error) {
    next(error);
  }
}

module.exports = { summary, exportCsv };

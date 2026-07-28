const Institution = require("../models/Institution");

async function ensureDefaultInstitution() {
  const existing = await Institution.findOne({ isActive: true }).lean();
  if (existing) {
    return;
  }

  await Institution.create({
    name: "Smart Institute AI",
    workspaceLabel: "Celeris Technologies Pvt Ltd",
    financialYear: "FY 2025-26",
    location: "Head Office",
    isActive: true
  });
}

async function getInstitutionContext() {
  const institution = await Institution.findOne({ isActive: true }).lean();
  if (!institution) {
    const err = new Error("Institution context not found.");
    err.statusCode = 404;
    throw err;
  }

  return {
    name: institution.name,
    workspaceLabel: institution.workspaceLabel,
    financialYear: institution.financialYear,
    location: institution.location
  };
}

module.exports = { ensureDefaultInstitution, getInstitutionContext };

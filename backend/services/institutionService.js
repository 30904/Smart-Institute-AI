const Institution = require("../models/Institution");
const AcademicYear = require("../models/AcademicYear");

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
    address: "Head Office Address",
    logo_url: "",
    default_academic_year_id: null,
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
    id: institution._id.toString(),
    name: institution.name,
    workspaceLabel: institution.workspaceLabel,
    financialYear: institution.financialYear,
    location: institution.location,
    address: institution.address || "",
    logo_url: institution.logo_url || "",
    default_academic_year_id: institution.default_academic_year_id ? institution.default_academic_year_id.toString() : null
  };
}

async function getInstitutionProfile() {
  return getInstitutionContext();
}

async function updateInstitutionProfile(payload) {
  const institution = await Institution.findOne({ isActive: true });
  if (!institution) {
    const err = new Error("Institution profile not found.");
    err.statusCode = 404;
    throw err;
  }

  if (payload.name !== undefined) institution.name = String(payload.name || "").trim();
  if (payload.workspaceLabel !== undefined) institution.workspaceLabel = String(payload.workspaceLabel || "").trim();
  if (payload.financialYear !== undefined) institution.financialYear = String(payload.financialYear || "").trim();
  if (payload.location !== undefined) institution.location = String(payload.location || "").trim();
  if (payload.address !== undefined) institution.address = String(payload.address || "").trim();
  if (payload.logo_url !== undefined) institution.logo_url = String(payload.logo_url || "").trim();

  if (payload.default_academic_year_id !== undefined) {
    if (!payload.default_academic_year_id) {
      institution.default_academic_year_id = null;
    } else {
      const academicYear = await AcademicYear.findById(payload.default_academic_year_id).lean();
      if (!academicYear) {
        const err = new Error("Invalid default_academic_year_id.");
        err.statusCode = 400;
        throw err;
      }
      institution.default_academic_year_id = payload.default_academic_year_id;
      institution.financialYear = academicYear.name;
    }
  }

  await institution.save();
  return getInstitutionContext();
}

module.exports = { ensureDefaultInstitution, getInstitutionContext, getInstitutionProfile, updateInstitutionProfile };

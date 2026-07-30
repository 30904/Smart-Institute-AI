const mongoose = require("mongoose");

const AdmissionApplication = require("../models/AdmissionApplication");
const EligibilityCriteria = require("../models/EligibilityCriteria");

const QUALIFICATION_RANKS = {
  "class 10": 1,
  "10th": 1,
  ssc: 1,
  iti: 2,
  "class 12": 2,
  "12th": 2,
  hsc: 2,
  diploma: 3,
  bachelor: 4,
  bachelors: 4,
  undergraduate: 4,
  master: 5,
  masters: 5,
  postgraduate: 5,
  doctorate: 6,
  phd: 6
};

function normalizeText(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ");
}

function getQualificationRank(value) {
  const normalized = normalizeText(value);
  const directRank = QUALIFICATION_RANKS[normalized];
  if (directRank) return directRank;

  const matchingKey = Object.keys(QUALIFICATION_RANKS).find((key) => normalized.includes(key));
  return matchingKey ? QUALIFICATION_RANKS[matchingKey] : null;
}

function satisfiesMinimumQualification(actual, minimum) {
  const actualRank = getQualificationRank(actual);
  const minimumRank = getQualificationRank(minimum);
  if (actualRank !== null && minimumRank !== null) return actualRank >= minimumRank;
  return normalizeText(actual) === normalizeText(minimum);
}

function calculateAge(dateOfBirth, asOf = new Date()) {
  if (!dateOfBirth) return null;
  const birthDate = new Date(dateOfBirth);
  if (Number.isNaN(birthDate.getTime())) return null;
  let age = asOf.getUTCFullYear() - birthDate.getUTCFullYear();
  const monthDifference = asOf.getUTCMonth() - birthDate.getUTCMonth();
  if (monthDifference < 0 || (monthDifference === 0 && asOf.getUTCDate() < birthDate.getUTCDate())) age -= 1;
  return age;
}

function getRule(rules, snakeCaseKey, camelCaseKey) {
  return rules?.[snakeCaseKey] ?? rules?.[camelCaseKey];
}

function evaluateCriteria(application, criteria) {
  if (!criteria) {
    return {
      is_eligible: false,
      reasons: ["Eligibility criteria are not configured for this program."]
    };
  }

  const reasons = [];
  const actualQualification = application.academic.qualification;
  const rules = criteria.rules_json && typeof criteria.rules_json === "object" ? criteria.rules_json : {};
  const acceptedQualifications = getRule(rules, "accepted_qualifications", "acceptedQualifications");

  if (Array.isArray(acceptedQualifications) && acceptedQualifications.length) {
    const accepted = acceptedQualifications.map(normalizeText);
    if (!accepted.includes(normalizeText(actualQualification))) {
      reasons.push(`Qualification must be one of: ${acceptedQualifications.join(", ")}.`);
    }
  } else if (!satisfiesMinimumQualification(actualQualification, criteria.min_qualification)) {
    reasons.push(`Minimum qualification is ${criteria.min_qualification}.`);
  }

  if (Number(application.academic.marks_percent) < Number(criteria.min_marks)) {
    reasons.push(`Minimum marks required are ${criteria.min_marks}%.`);
  }

  const requiredSubjects = getRule(rules, "required_subjects", "requiredSubjects");
  if (Array.isArray(requiredSubjects) && requiredSubjects.length) {
    const applicantSubjects = (application.academic.details_json?.subjects || []).map(normalizeText);
    const missingSubjects = requiredSubjects.filter((subject) => !applicantSubjects.includes(normalizeText(subject)));
    if (missingSubjects.length) reasons.push(`Missing required subjects: ${missingSubjects.join(", ")}.`);
  }

  const minimumAge = getRule(rules, "minimum_age", "minimumAge");
  const maximumAge = getRule(rules, "maximum_age", "maximumAge");
  if (minimumAge !== undefined || maximumAge !== undefined) {
    const age = calculateAge(application.personal.date_of_birth);
    if (age === null) {
      reasons.push("Date of birth is required for age-based eligibility.");
    } else {
      if (minimumAge !== undefined && age < Number(minimumAge)) reasons.push(`Minimum age is ${minimumAge}.`);
      if (maximumAge !== undefined && age > Number(maximumAge)) reasons.push(`Maximum age is ${maximumAge}.`);
    }
  }

  return {
    is_eligible: reasons.length === 0,
    reasons
  };
}

async function validateApplicationEligibility(applicationId, programId) {
  if (!mongoose.isValidObjectId(applicationId)) {
    const error = new Error("application_id contains an invalid id.");
    error.statusCode = 400;
    throw error;
  }

  const application = await AdmissionApplication.findById(applicationId);
  if (!application) {
    const error = new Error("Admission application not found.");
    error.statusCode = 404;
    throw error;
  }

  const allowedStatuses = ["applied", "docs_pending", "eligible", "ineligible"];
  if (!allowedStatuses.includes(application.status)) {
    const error = new Error(`Eligibility cannot be re-evaluated while application status is ${application.status}.`);
    error.statusCode = 409;
    throw error;
  }

  const preferredProgramIds = application.program_preferences.map(String);
  let programIds = preferredProgramIds;
  if (programId) {
    if (!mongoose.isValidObjectId(programId)) {
      const error = new Error("program_id contains an invalid id.");
      error.statusCode = 400;
      throw error;
    }
    if (!preferredProgramIds.includes(String(programId))) {
      const error = new Error("program_id is not present in this application's preferences.");
      error.statusCode = 400;
      throw error;
    }
    programIds = [String(programId)];
  }

  const criteriaDocuments = await EligibilityCriteria.find({ program_id: { $in: programIds } });
  const criteriaByProgram = new Map(criteriaDocuments.map((criteria) => [criteria.program_id.toString(), criteria]));
  const evaluatedAt = new Date();
  const evaluatedResults = programIds.map((id) => {
    const criteria = criteriaByProgram.get(id);
    const result = evaluateCriteria(application, criteria);
    return {
      program_id: id,
      criteria_id: criteria?._id || null,
      is_eligible: result.is_eligible,
      reasons: result.reasons,
      evaluated_at: evaluatedAt
    };
  });

  const evaluatedProgramIds = new Set(programIds);
  const preservedResults = application.eligibility_results.filter(
    (result) => !evaluatedProgramIds.has(result.program_id.toString())
  );
  application.eligibility_results = [...preservedResults, ...evaluatedResults];
  application.eligibility_checked_at = evaluatedAt;
  application.status = application.eligibility_results.some((result) => result.is_eligible) ? "eligible" : "ineligible";
  await application.save();

  return {
    application_id: application._id.toString(),
    status: application.status,
    eligibility_checked_at: application.eligibility_checked_at,
    results: application.eligibility_results
  };
}

module.exports = { validateApplicationEligibility };

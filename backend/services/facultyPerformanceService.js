const FacultyPerformance = require("../models/FacultyPerformance");
const mongoose = require("mongoose");

const addPerformanceRecord = async (data) => {
  // calculate overall rating if not provided
  const { faculty_id, period, teaching_rating, research_rating, service_rating, reviewer_id, comments } = data;
  
  let overall_rating = data.overall_rating;
  if (!overall_rating) {
    overall_rating = parseFloat(((teaching_rating + research_rating + service_rating) / 3).toFixed(1));
  }

  const record = new FacultyPerformance({
    faculty_id,
    period,
    teaching_rating,
    research_rating,
    service_rating,
    overall_rating,
    reviewer_id,
    comments
  });

  await record.save();
  return record;
};

const getPerformanceRecords = async (query = {}) => {
  const records = await FacultyPerformance.find(query)
    .populate("faculty_id", "name email")
    .populate("reviewer_id", "name email")
    .sort({ period: -1, createdAt: -1 });
  return records;
};

const getPerformanceStats = async (query = {}) => {
  // Aggregates performance data for the dashboard widget
  // E.g., average ratings across all periods, or most recent period stats
  const records = await FacultyPerformance.find(query).sort({ period: -1 });
  
  if (records.length === 0) {
    return {
      average_teaching: 0,
      average_research: 0,
      average_service: 0,
      average_overall: 0,
      total_evaluations: 0,
      latest_evaluation: null
    };
  }

  let totalTeaching = 0, totalResearch = 0, totalService = 0, totalOverall = 0;
  
  records.forEach(r => {
    totalTeaching += r.teaching_rating;
    totalResearch += r.research_rating;
    totalService += r.service_rating;
    totalOverall += r.overall_rating;
  });

  const count = records.length;
  return {
    average_teaching: parseFloat((totalTeaching / count).toFixed(1)),
    average_research: parseFloat((totalResearch / count).toFixed(1)),
    average_service: parseFloat((totalService / count).toFixed(1)),
    average_overall: parseFloat((totalOverall / count).toFixed(1)),
    total_evaluations: count,
    latest_evaluation: records[0]
  };
};

module.exports = {
  addPerformanceRecord,
  getPerformanceRecords,
  getPerformanceStats
};

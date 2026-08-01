import client from "../client";

export async function addPerformanceRecord(payload) {
  const response = await client.post("/academic/performance", payload);
  return response.data;
}

export async function getPerformanceRecords(params = {}) {
  const response = await client.get("/academic/performance", { params });
  return response.data;
}

export async function getPerformanceStats(params = {}) {
  const response = await client.get("/academic/performance/stats", { params });
  return response.data;
}

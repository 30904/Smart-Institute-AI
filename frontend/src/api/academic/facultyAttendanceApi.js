import client from "@/api/client";

export async function fetchPunchStatus() {
  const response = await client.get("/academic/attendance/status");
  return response.data;
}

export async function punchIn() {
  const response = await client.post("/academic/attendance/punch-in");
  return response.data;
}

export async function punchOut() {
  const response = await client.post("/academic/attendance/punch-out");
  return response.data;
}

export async function fetchAttendanceRecords(filters = {}) {
  const response = await client.get("/academic/attendance/records", { params: filters });
  return response.data;
}

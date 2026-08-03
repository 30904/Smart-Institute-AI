import client from "../client";

export async function applyLeave(payload) {
  const response = await client.post("/academic/leaves", payload);
  return response.data;
}

export async function getLeaves() {
  const response = await client.get("/academic/leaves");
  return response.data;
}

export async function updateLeaveStatus(id, payload) {
  const response = await client.put(`/academic/leaves/${id}/status`, payload);
  return response.data;
}

export async function checkLeaveConflicts(startDate, endDate) {
  const response = await client.get("/academic/leaves/conflicts", {
    params: { start_date: startDate, end_date: endDate }
  });
  return response.data;
}

import client from "@/api/client";

export async function getWorkloadRules() {
  const response = await client.get("/academic/workload-rules");
  return response.data;
}

export async function createWorkloadRule(payload) {
  const response = await client.post("/academic/workload-rules", payload);
  return response.data;
}

export async function updateWorkloadRule(id, payload) {
  const response = await client.put(`/academic/workload-rules/${id}`, payload);
  return response.data;
}

export async function deleteWorkloadRule(id) {
  const response = await client.delete(`/academic/workload-rules/${id}`);
  return response.data;
}

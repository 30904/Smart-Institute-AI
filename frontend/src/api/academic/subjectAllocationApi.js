import client from "@/api/client";

export async function getSubjectAllocations(params = {}) {
  const response = await client.get("/academic/subject-allocations", { params });
  return response.data;
}

export async function assignSubject(payload) {
  const response = await client.post("/academic/subject-allocations", payload);
  return response.data;
}

export async function removeAllocation(id) {
  const response = await client.delete(`/academic/subject-allocations/${id}`);
  return response.data;
}

import client from "@/api/client";

export async function fetchDepartments() {
  const response = await client.get("/departments");
  return response.data;
}

export async function createDepartment(payload) {
  const response = await client.post("/departments", payload);
  return response.data;
}

export async function updateDepartment(id, payload) {
  const response = await client.put(`/departments/${id}`, payload);
  return response.data;
}

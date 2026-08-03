import client from "@/api/client";

export async function getFaculties(params = {}) {
  const response = await client.get("/academic/faculty-registration", { params });
  return response.data;
}

export async function getFacultyById(id) {
  const response = await client.get(`/academic/faculty-registration/${id}`);
  return response.data;
}

export async function registerFaculty(payload) {
  const response = await client.post("/academic/faculty-registration", payload);
  return response.data;
}

export async function updateFaculty(id, payload) {
  const response = await client.put(`/academic/faculty-registration/${id}`, payload);
  return response.data;
}

export async function deleteFaculty(id) {
  const response = await client.delete(`/academic/faculty-registration/${id}`);
  return response.data;
}

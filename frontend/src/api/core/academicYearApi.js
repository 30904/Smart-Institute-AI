import client from "@/api/client";

export async function fetchAcademicYears() {
  const response = await client.get("/academic-years");
  return response.data;
}

export async function createAcademicYear(payload) {
  const response = await client.post("/academic-years", payload);
  return response.data;
}

export async function updateAcademicYear(id, payload) {
  const response = await client.put(`/academic-years/${id}`, payload);
  return response.data;
}

export async function setCurrentAcademicYear(id) {
  const response = await client.patch(`/academic-years/${id}/set-current`);
  return response.data;
}

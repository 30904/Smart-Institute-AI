import client from "@/api/client";

// Faculty Types
export async function fetchFacultyTypes() {
  const response = await client.get("/academic/faculty-types");
  return response.data;
}

export async function createFacultyType(data) {
  const response = await client.post("/academic/faculty-types", data);
  return response.data;
}

export async function updateFacultyType(id, data) {
  const response = await client.put(`/academic/faculty-types/${id}`, data);
  return response.data;
}

// Designations
export async function fetchDesignations() {
  const response = await client.get("/academic/designations");
  return response.data;
}

export async function createDesignation(data) {
  const response = await client.post("/academic/designations", data);
  return response.data;
}

export async function updateDesignation(id, data) {
  const response = await client.put(`/academic/designations/${id}`, data);
  return response.data;
}

// Qualification Masters
export async function fetchQualificationMasters() {
  const response = await client.get("/academic/qualification-masters");
  return response.data;
}

export async function createQualificationMaster(data) {
  const response = await client.post("/academic/qualification-masters", data);
  return response.data;
}

export async function updateQualificationMaster(id, data) {
  const response = await client.put(`/academic/qualification-masters/${id}`, data);
  return response.data;
}

// Subjects
export async function fetchSubjects() {
  const response = await client.get("/academic/subjects");
  return response.data;
}

export async function createSubject(data) {
  const response = await client.post("/academic/subjects", data);
  return response.data;
}

export async function updateSubject(id, data) {
  const response = await client.put(`/academic/subjects/${id}`, data);
  return response.data;
}

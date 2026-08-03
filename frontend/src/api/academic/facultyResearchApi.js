import client from "@/api/client";

// ─── Publications ──────────────────────────────────────────────────────────

export async function getPublications(params = {}) {
  const response = await client.get("/academic/publications", { params });
  return response.data;
}

export async function addPublication(payload) {
  const response = await client.post("/academic/publications", payload);
  return response.data;
}

export async function updatePublication(id, payload) {
  const response = await client.put(`/academic/publications/${id}`, payload);
  return response.data;
}

export async function deletePublication(id) {
  const response = await client.delete(`/academic/publications/${id}`);
  return response.data;
}

// ─── Trainings ─────────────────────────────────────────────────────────────

export async function getTrainings(params = {}) {
  const response = await client.get("/academic/trainings", { params });
  return response.data;
}

export async function addTraining(payload) {
  const response = await client.post("/academic/trainings", payload);
  return response.data;
}

export async function updateTraining(id, payload) {
  const response = await client.put(`/academic/trainings/${id}`, payload);
  return response.data;
}

export async function deleteTraining(id) {
  const response = await client.delete(`/academic/trainings/${id}`);
  return response.data;
}

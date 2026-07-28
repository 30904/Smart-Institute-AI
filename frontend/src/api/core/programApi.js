import client from "@/api/client";

export async function fetchPrograms() {
  const response = await client.get("/programs");
  return response.data;
}

export async function createProgram(payload) {
  const response = await client.post("/programs", payload);
  return response.data;
}

export async function updateProgram(id, payload) {
  const response = await client.put(`/programs/${id}`, payload);
  return response.data;
}

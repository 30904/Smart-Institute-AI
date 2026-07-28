import client from "@/api/client";

export async function fetchUsers() {
  const response = await client.get("/users");
  return response.data;
}

export async function createUser(payload) {
  const response = await client.post("/users", payload);
  return response.data;
}

export async function updateUser(userId, payload) {
  const response = await client.put(`/users/${userId}`, payload);
  return response.data;
}

export async function deactivateUser(userId) {
  const response = await client.patch(`/users/${userId}/deactivate`);
  return response.data;
}

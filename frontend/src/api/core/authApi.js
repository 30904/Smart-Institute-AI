import client from "@/api/client";

export async function login(payload) {
  const response = await client.post("/auth/login", payload);
  return response.data;
}

export async function fetchCurrentUser() {
  const response = await client.get("/auth/me");
  return response.data;
}

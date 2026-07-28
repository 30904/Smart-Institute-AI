import client from "@/api/client";

export async function fetchHealth() {
  const response = await client.get("/health");
  return response.data;
}

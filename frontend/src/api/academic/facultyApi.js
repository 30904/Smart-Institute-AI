import client from "@/api/client";

export async function fetchFacultySummary() {
  const response = await client.get("/academic/faculty/summary");
  return response.data;
}

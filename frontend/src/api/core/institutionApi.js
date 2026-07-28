import client from "@/api/client";

export async function fetchInstitutionContext() {
  const response = await client.get("/institution/context");
  return response.data;
}

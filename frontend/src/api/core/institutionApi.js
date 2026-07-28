import client from "@/api/client";

export async function fetchInstitutionContext() {
  const response = await client.get("/institution/context");
  return response.data;
}

export async function fetchInstitutionProfile() {
  const response = await client.get("/institution/profile");
  return response.data;
}

export async function updateInstitutionProfile(payload) {
  const response = await client.put("/institution/profile", payload);
  return response.data;
}

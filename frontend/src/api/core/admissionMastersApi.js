import client from "@/api/client";

const BASE_PATH = "/admissions/masters";

export async function fetchAdmissionMasters(resource) {
  const response = await client.get(`${BASE_PATH}/${resource}`);
  return response.data;
}

export async function fetchAdmissionMasterOptions(source) {
  const response = await client.get(`${BASE_PATH}/options/${source}`);
  return response.data;
}

export async function createAdmissionMaster(resource, payload) {
  const response = await client.post(`${BASE_PATH}/${resource}`, payload);
  return response.data;
}

export async function updateAdmissionMaster(resource, id, payload) {
  const response = await client.put(`${BASE_PATH}/${resource}/${id}`, payload);
  return response.data;
}

export async function deleteAdmissionMaster(resource, id) {
  const response = await client.delete(`${BASE_PATH}/${resource}/${id}`);
  return response.data;
}

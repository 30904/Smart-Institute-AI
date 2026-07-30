import client from "@/api/client";

const APPLICATIONS_PATH = "/admissions/applications";

export async function fetchAdmissionApplications(filters = {}) {
  const response = await client.get(APPLICATIONS_PATH, { params: filters });
  return response.data;
}

export async function fetchAdmissionApplication(id) {
  const response = await client.get(`${APPLICATIONS_PATH}/${id}`);
  return response.data;
}

export async function createAdmissionApplication(payload) {
  const response = await client.post(APPLICATIONS_PATH, payload);
  return response.data;
}

export async function updateAdmissionApplication(id, payload) {
  const response = await client.put(`${APPLICATIONS_PATH}/${id}`, payload);
  return response.data;
}

export async function fetchApplicationDocuments(applicationId) {
  const response = await client.get(`${APPLICATIONS_PATH}/${applicationId}/documents`);
  return response.data;
}

export async function uploadApplicationDocument(applicationId, documentTypeId, file) {
  const formData = new FormData();
  formData.append("document_type_id", documentTypeId);
  formData.append("file", file);
  const response = await client.post(`${APPLICATIONS_PATH}/${applicationId}/documents`, formData);
  return response.data;
}

export async function verifyApplicationDocument(applicationId, documentId, remarks = "") {
  const response = await client.patch(`${APPLICATIONS_PATH}/${applicationId}/documents/${documentId}/verify`, { remarks });
  return response.data;
}

export async function rejectApplicationDocument(applicationId, documentId, remarks) {
  const response = await client.patch(`${APPLICATIONS_PATH}/${applicationId}/documents/${documentId}/reject`, { remarks });
  return response.data;
}

export async function validateApplicationEligibility(applicationId, programId = "") {
  const response = await client.post(`${APPLICATIONS_PATH}/${applicationId}/validate-eligibility`, {
    program_id: programId || undefined
  });
  return response.data;
}

export async function decideAdmissionApplication(applicationId, decision, remarks = "") {
  const response = await client.patch(`${APPLICATIONS_PATH}/${applicationId}/approval`, { decision, remarks });
  return response.data;
}

export async function generateAdmissionMeritList(cycleId, programId) {
  const response = await client.post("/admissions/merit-lists/generate", {
    cycle_id: cycleId,
    program_id: programId
  });
  return response.data;
}

export async function fetchAdmissionMeritList(cycleId, programId) {
  const response = await client.get("/admissions/merit-lists", {
    params: { cycle_id: cycleId, program_id: programId }
  });
  return response.data;
}

export async function allocateCounselingSeats(cycleId, programId) {
  const response = await client.post("/admissions/counseling/allocate", {
    cycle_id: cycleId,
    program_id: programId
  });
  return response.data;
}

export async function fetchCounselingAllocations(filters = {}) {
  const response = await client.get("/admissions/counseling/allocations", { params: filters });
  return response.data;
}

export async function fetchApplicationFeeConfirmations(applicationId) {
  const response = await client.get(`/admissions/fee-confirmations/${applicationId}`);
  return response.data;
}

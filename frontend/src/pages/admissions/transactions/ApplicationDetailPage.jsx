import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  decideAdmissionApplication,
  fetchAdmissionApplication,
  fetchAdmissionMasterOptions,
  fetchAdmissionMasters,
  fetchApplicationFeeConfirmations,
  validateApplicationEligibility
} from "@/api/core";
import { DataTable, PageHeader, StatusBadge } from "@/components/ui";
import usePermission from "@/hooks/usePermission";
import ModuleShell from "@/layout/ModuleShell";
import ApplicationDocumentsPanel from "@/pages/admissions/transactions/ApplicationDocumentsPanel";

function statusTone(status) {
  if (["eligible", "approved", "enrolled"].includes(status)) return "success";
  if (["ineligible", "rejected"].includes(status)) return "danger";
  if (["docs_pending", "fee_pending", "waitlisted"].includes(status)) return "warning";
  return "info";
}

function ApplicationDetailPage() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = usePermission();
  const canView = hasPermission("admissions", "view");
  const canCreate = hasPermission("admissions", "create");
  const canEdit = hasPermission("admissions", "edit");
  const canApprove = hasPermission("admissions", "approve");

  const [application, setApplication] = useState(null);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [feeConfirmations, setFeeConfirmations] = useState([]);
  const [eligibilityProgram, setEligibilityProgram] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadApplication() {
    const response = await fetchAdmissionApplication(applicationId);
    setApplication(response?.data || null);
  }

  useEffect(() => {
    if (!canView) {
      setLoading(false);
      return;
    }
    async function loadData() {
      try {
        setLoading(true);
        const [applicationResponse, documentResponse, programResponse, feeResponse] = await Promise.all([
          fetchAdmissionApplication(applicationId),
          fetchAdmissionMasters("document-types"),
          fetchAdmissionMasterOptions("programs"),
          fetchApplicationFeeConfirmations(applicationId)
        ]);
        setApplication(applicationResponse?.data || null);
        setDocumentTypes(Array.isArray(documentResponse?.data) ? documentResponse.data : []);
        setPrograms(Array.isArray(programResponse?.data) ? programResponse.data : []);
        setFeeConfirmations(Array.isArray(feeResponse?.data) ? feeResponse.data : []);
      } catch (apiError) {
        setError(apiError?.response?.data?.message || "Failed to load application details.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [applicationId, canView]);

  const programLabels = useMemo(
    () => new Map(programs.map((program) => [program.value, program.label])),
    [programs]
  );

  if (!canView) return <main className="app-shell"><h3>Access denied</h3><p>You do not have permission to view this application.</p></main>;

  const eligibilityColumns = [
    { key: "program", label: "Program" },
    { key: "result", label: "Result" },
    { key: "reasons", label: "Reasons" },
    { key: "checked", label: "Checked At" }
  ];
  const eligibilityRows = (application?.eligibility_results || []).map((result, index) => ({
    id: `${result.program_id}-${index}`,
    program: programLabels.get(String(result.program_id)) || result.program_id,
    result: <StatusBadge label={result.is_eligible ? "Eligible" : "Ineligible"} tone={result.is_eligible ? "success" : "danger"} />,
    reasons: result.reasons?.join(" ") || "All configured criteria passed.",
    checked: result.evaluated_at ? new Date(result.evaluated_at).toLocaleString() : "-"
  }));

  const feeColumns = [
    { key: "receipt", label: "Receipt" },
    { key: "amount", label: "Amount" },
    { key: "mode", label: "Mode" },
    { key: "settlement", label: "Settlement" },
    { key: "trigger", label: "Enrollment Trigger" }
  ];
  const feeRows = feeConfirmations.map((confirmation) => ({
    id: confirmation.id,
    receipt: confirmation.receipt_no,
    amount: `${confirmation.currency} ${confirmation.amount_paid}`,
    mode: confirmation.payment_mode,
    settlement: confirmation.is_full_settlement ? "Full" : `Pending ${confirmation.pending_amount}`,
    trigger: <StatusBadge label={confirmation.enrollment_trigger_status} tone={confirmation.enrollment_trigger_status === "completed" ? "success" : "warning"} />
  }));

  return (
    <ModuleShell title="Admissions" subtitle="Manage applications, enrollment, and admission workflows." activeTab="Transactions" basePath="/admissions">
      <PageHeader
        title={application?.personal?.full_name || "Application Detail"}
        subtitle={application ? `Application ID: ${application.id}` : "Loading application..."}
        actions={<button type="button" className="btn-secondary" onClick={() => navigate("/admissions/transactions")}>Back to Applications</button>}
      />
      {error ? <p className="ui-error-text">{error}</p> : null}
      {success ? <p className="ui-success-text">{success}</p> : null}
      {loading ? <p>Loading application...</p> : null}

      {application ? (
        <>
          <section className="admission-detail-grid">
            <article className="admission-workflow-card">
              <h3>Application Status</h3>
              <StatusBadge label={application.status.replaceAll("_", " ")} tone={statusTone(application.status)} />
              <dl>
                <dt>Merit Score</dt><dd>{application.merit_score ?? "-"}</dd>
                <dt>Applied On</dt><dd>{new Date(application.createdAt).toLocaleString()}</dd>
              </dl>
            </article>
            <article className="admission-workflow-card">
              <h3>Personal Details</h3>
              <dl>
                <dt>Email</dt><dd>{application.personal.email}</dd>
                <dt>Phone</dt><dd>{application.personal.phone}</dd>
                <dt>Date of Birth</dt><dd>{application.personal.date_of_birth ? new Date(application.personal.date_of_birth).toLocaleDateString() : "-"}</dd>
              </dl>
            </article>
            <article className="admission-workflow-card">
              <h3>Academic Details</h3>
              <dl>
                <dt>Qualification</dt><dd>{application.academic.qualification}</dd>
                <dt>Institution</dt><dd>{application.academic.institution_name || "-"}</dd>
                <dt>Marks</dt><dd>{application.academic.marks_percent}%</dd>
              </dl>
            </article>
          </section>

          <section className="admission-workflow-card">
            <h3>Eligibility</h3>
            {canEdit && ["applied", "docs_pending", "eligible", "ineligible"].includes(application.status) ? (
              <div className="admission-action-bar">
                <select value={eligibilityProgram} onChange={(event) => setEligibilityProgram(event.target.value)}>
                  <option value="">Evaluate all program preferences</option>
                  {application.program_preferences.map((programId) => (
                    <option key={programId} value={programId}>{programLabels.get(String(programId)) || programId}</option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btn-primary"
                  disabled={busy}
                  onClick={async () => {
                    try {
                      setBusy(true);
                      setError("");
                      await validateApplicationEligibility(applicationId, eligibilityProgram);
                      await loadApplication();
                      setSuccess("Eligibility evaluation completed.");
                    } catch (apiError) {
                      setError(apiError?.response?.data?.message || "Eligibility evaluation failed.");
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  Validate Eligibility
                </button>
              </div>
            ) : null}
            <DataTable columns={eligibilityColumns} rows={eligibilityRows} emptyMessage="Eligibility has not been evaluated." />
          </section>

          <ApplicationDocumentsPanel applicationId={applicationId} documentTypes={documentTypes} canCreate={canCreate} canEdit={canEdit} />

          {canApprove && application.status === "allotted" ? (
            <section className="admission-workflow-card">
              <h3>Committee Decision</h3>
              <div className="ui-inline-actions">
                <button
                  type="button"
                  className="btn-primary"
                  disabled={busy}
                  onClick={async () => {
                    try {
                      setBusy(true);
                      await decideAdmissionApplication(applicationId, "approve");
                      await loadApplication();
                      setSuccess("Application approved by committee.");
                    } catch (apiError) {
                      setError(apiError?.response?.data?.message || "Approval failed.");
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  Approve Admission
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={busy}
                  onClick={async () => {
                    const remarks = window.prompt("Enter committee rejection reason:");
                    if (!remarks) return;
                    try {
                      setBusy(true);
                      await decideAdmissionApplication(applicationId, "reject", remarks);
                      await loadApplication();
                      setSuccess("Application rejected and the seat was released.");
                    } catch (apiError) {
                      setError(apiError?.response?.data?.message || "Rejection failed.");
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  Reject Admission
                </button>
              </div>
            </section>
          ) : null}

          <section className="admission-workflow-card">
            <h3>Fee Confirmations & Enrollment</h3>
            <DataTable columns={feeColumns} rows={feeRows} emptyMessage="No admission fee confirmations received." />
          </section>
        </>
      ) : null}
    </ModuleShell>
  );
}

export default ApplicationDetailPage;

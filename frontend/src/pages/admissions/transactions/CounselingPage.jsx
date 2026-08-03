import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  allocateCounselingSeats,
  fetchAdmissionMasterOptions,
  fetchAdmissionMeritList,
  fetchCounselingAllocations,
  generateAdmissionMeritList
} from "@/api/core";
import { DataTable, PageHeader, StatusBadge } from "@/components/ui";
import usePermission from "@/hooks/usePermission";
import ModuleShell from "@/layout/ModuleShell";

function CounselingPage() {
  const navigate = useNavigate();
  const { hasPermission } = usePermission();
  const canView = hasPermission("admissions", "view");
  const canApprove = hasPermission("admissions", "approve");
  const [cycles, setCycles] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [cycleId, setCycleId] = useState("");
  const [programId, setProgramId] = useState("");
  const [meritRows, setMeritRows] = useState([]);
  const [allocationRows, setAllocationRows] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!canView) return;
    async function loadOptions() {
      try {
        const [cycleResponse, programResponse] = await Promise.all([
          fetchAdmissionMasterOptions("cycles"),
          fetchAdmissionMasterOptions("programs")
        ]);
        setCycles(Array.isArray(cycleResponse?.data) ? cycleResponse.data : []);
        setPrograms(Array.isArray(programResponse?.data) ? programResponse.data : []);
      } catch (apiError) {
        setError(apiError?.response?.data?.message || "Failed to load counseling options.");
      }
    }
    loadOptions();
  }, [canView]);

  async function loadResults() {
    if (!cycleId || !programId) return;
    const [meritResponse, allocationResponse] = await Promise.all([
      fetchAdmissionMeritList(cycleId, programId),
      fetchCounselingAllocations({ cycle_id: cycleId, program_id: programId })
    ]);
    setMeritRows(Array.isArray(meritResponse?.data) ? meritResponse.data : []);
    setAllocationRows(Array.isArray(allocationResponse?.data) ? allocationResponse.data : []);
  }

  if (!canView) return <main className="app-shell"><h3>Access denied</h3><p>You do not have permission to view counseling.</p></main>;

  const meritColumns = [
    { key: "rank", label: "Overall Rank" },
    { key: "application", label: "Application ID" },
    { key: "score", label: "Merit Score" },
    { key: "categoryRank", label: "Category Rank" },
    { key: "cutoff", label: "Cutoff" },
    { key: "pool", label: "Pool" }
  ];
  const formattedMeritRows = meritRows.map((record) => ({
    id: record.id,
    rank: record.overall_rank,
    application: record.application_id,
    score: record.merit_score,
    categoryRank: record.category_rank,
    cutoff: <StatusBadge label={record.within_cutoff ? "Within" : "Outside"} tone={record.within_cutoff ? "success" : "warning"} />,
    pool: record.selection_pool
  }));

  const allocationColumns = [
    { key: "application", label: "Application ID" },
    { key: "status", label: "Status" },
    { key: "pool", label: "Pool" },
    { key: "seat", label: "Seat No." },
    { key: "waitlist", label: "Waitlist Position" },
    { key: "approval", label: "Committee" }
  ];
  const formattedAllocationRows = allocationRows.map((record) => ({
    id: record.id,
    application: record.application_id,
    status: <StatusBadge label={record.allocation_status} tone={record.allocation_status === "allotted" ? "success" : record.allocation_status === "rejected" ? "danger" : "warning"} />,
    pool: record.selection_pool,
    seat: record.seat_number || "-",
    waitlist: record.waitlist_position || "-",
    approval: record.approval_status
  }));

  return (
    <ModuleShell title="Admissions" subtitle="Manage applications, enrollment, and admission workflows.">
      <PageHeader
        title="Merit & Counseling"
        subtitle="Generate ranked merit lists and allocate available seats."
        actions={<button type="button" className="btn-secondary" onClick={() => navigate("/admissions/transactions")}>Back to Applications</button>}
      />
      <div className="admission-action-bar">
        <select value={cycleId} onChange={(event) => setCycleId(event.target.value)}>
          <option value="">Select admission cycle</option>
          {cycles.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
        <select value={programId} onChange={(event) => setProgramId(event.target.value)}>
          <option value="">Select program</option>
          {programs.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
        <button
          type="button"
          className="btn-secondary"
          disabled={!cycleId || !programId || busy}
          onClick={async () => {
            try {
              setBusy(true);
              setError("");
              await loadResults();
            } catch (apiError) {
              setError(apiError?.response?.data?.message || "Failed to load merit and counseling results.");
            } finally {
              setBusy(false);
            }
          }}
        >
          Load Results
        </button>
        {canApprove ? (
          <>
            <button
              type="button"
              className="btn-primary"
              disabled={!cycleId || !programId || busy}
              onClick={async () => {
                try {
                  setBusy(true);
                  setError("");
                  await generateAdmissionMeritList(cycleId, programId);
                  await loadResults();
                  setSuccess("Merit list generated.");
                } catch (apiError) {
                  setError(apiError?.response?.data?.message || "Merit generation failed.");
                } finally {
                  setBusy(false);
                }
              }}
            >
              Generate Merit List
            </button>
            <button
              type="button"
              className="btn-primary"
              disabled={!cycleId || !programId || busy}
              onClick={async () => {
                try {
                  setBusy(true);
                  setError("");
                  await allocateCounselingSeats(cycleId, programId);
                  await loadResults();
                  setSuccess("Counseling allocation completed.");
                } catch (apiError) {
                  setError(apiError?.response?.data?.message || "Seat allocation failed.");
                } finally {
                  setBusy(false);
                }
              }}
            >
              Allocate Seats
            </button>
          </>
        ) : null}
      </div>
      {error ? <p className="ui-error-text">{error}</p> : null}
      {success ? <p className="ui-success-text">{success}</p> : null}

      <section className="admission-workflow-card">
        <h3>Merit List</h3>
        <DataTable columns={meritColumns} rows={formattedMeritRows} emptyMessage="No merit list generated for this selection." />
      </section>
      <section className="admission-workflow-card">
        <h3>Seat Allocations & Waitlist</h3>
        <DataTable columns={allocationColumns} rows={formattedAllocationRows} emptyMessage="No counseling allocation generated." />
      </section>
    </ModuleShell>
  );
}

export default CounselingPage;

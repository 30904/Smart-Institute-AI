import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  createAdmissionApplication,
  fetchAdmissionApplications,
  fetchAdmissionMasterOptions,
  updateAdmissionApplication
} from "@/api/core";
import { DataTable, FormDrawer, PageHeader, StatusBadge } from "@/components/ui";
import usePermission from "@/hooks/usePermission";
import ModuleShell from "@/layout/ModuleShell";
import ApplicationForm from "@/pages/admissions/transactions/ApplicationForm";

const statusOptions = [
  "applied", "docs_pending", "eligible", "ineligible", "merit_listed", "allotted",
  "approved", "fee_pending", "enrolled", "rejected", "waitlisted"
];

function getStatusTone(status) {
  if (["eligible", "approved", "enrolled"].includes(status)) return "success";
  if (["ineligible", "rejected"].includes(status)) return "danger";
  if (["docs_pending", "fee_pending", "waitlisted"].includes(status)) return "warning";
  return "info";
}

function AdmissionTransactionsPage() {
  const navigate = useNavigate();
  const { hasPermission } = usePermission();
  const canView = hasPermission("admissions", "view");
  const canCreate = hasPermission("admissions", "create");
  const canEdit = hasPermission("admissions", "edit");

  const [rows, setRows] = useState([]);
  const [optionSets, setOptionSets] = useState({ cycles: [], categories: [], programs: [] });
  const [filters, setFilters] = useState({ cycle_id: "", status: "" });
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function loadRows(nextFilters = filters) {
    const response = await fetchAdmissionApplications({
      cycle_id: nextFilters.cycle_id || undefined,
      status: nextFilters.status || undefined
    });
    setRows(Array.isArray(response?.data) ? response.data : []);
  }

  useEffect(() => {
    if (!canView) {
      setLoading(false);
      return;
    }
    async function loadData() {
      try {
        setLoading(true);
        const [applications, cycles, categories, programs] = await Promise.all([
          fetchAdmissionApplications(),
          fetchAdmissionMasterOptions("cycles"),
          fetchAdmissionMasterOptions("categories"),
          fetchAdmissionMasterOptions("programs")
        ]);
        setRows(Array.isArray(applications?.data) ? applications.data : []);
        setOptionSets({
          cycles: Array.isArray(cycles?.data) ? cycles.data : [],
          categories: Array.isArray(categories?.data) ? categories.data : [],
          programs: Array.isArray(programs?.data) ? programs.data : []
        });
      } catch (apiError) {
        setError(apiError?.response?.data?.message || "Failed to load admission applications.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [canView]);

  const labels = useMemo(
    () => ({
      cycles: new Map(optionSets.cycles.map((option) => [option.value, option.label])),
      categories: new Map(optionSets.categories.map((option) => [option.value, option.label]))
    }),
    [optionSets]
  );

  const columns = [
    { key: "applicant", label: "Applicant" },
    { key: "cycle", label: "Cycle" },
    { key: "category", label: "Category" },
    { key: "status", label: "Status" },
    { key: "merit", label: "Merit Score" },
    { key: "created", label: "Applied On" },
    { key: "actions", label: "Actions" }
  ];

  const tableRows = rows.map((row) => ({
    id: row.id,
    applicant: row.personal?.full_name || "-",
    cycle: labels.cycles.get(String(row.cycle_id)) || row.cycle_id,
    category: labels.categories.get(String(row.category_id)) || row.category_id,
    status: <StatusBadge label={String(row.status || "").replaceAll("_", " ")} tone={getStatusTone(row.status)} />,
    merit: row.merit_score ?? "-",
    created: row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "-",
    actions: (
      <div className="ui-inline-actions">
        <button type="button" className="btn-link" onClick={() => navigate(`/admissions/transactions/${row.id}`)}>View</button>
        {canEdit ? (
          <button type="button" className="btn-link" onClick={() => { setSelectedRow(row); setDrawerOpen(true); }}>Edit</button>
        ) : null}
      </div>
    )
  }));

  async function handleSave(payload) {
    try {
      setSubmitting(true);
      setError("");
      if (selectedRow) await updateAdmissionApplication(selectedRow.id, payload);
      else await createAdmissionApplication(payload);
      await loadRows();
      setDrawerOpen(false);
      setSelectedRow(null);
    } catch (apiError) {
      setError(apiError?.response?.data?.message || "Failed to save admission application.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!canView) {
    return <main className="app-shell"><h3>Access denied</h3><p>You do not have permission to view admission transactions.</p></main>;
  }

  return (
    <ModuleShell title="Admissions" subtitle="Manage applications, enrollment, and admission workflows." activeTab="Transactions" basePath="/admissions">
      <PageHeader
        title="Admission Applications"
        subtitle="Register applicants and track each admission workflow."
        actions={
          <div className="ui-inline-actions">
            <button type="button" className="btn-secondary" onClick={() => navigate("/admissions/transactions/counseling")}>Merit & Counseling</button>
            {canCreate ? <button type="button" className="btn-primary" onClick={() => { setSelectedRow(null); setDrawerOpen(true); }}>Register Application</button> : null}
          </div>
        }
      />
      <form
        className="admission-filter-bar"
        onSubmit={async (event) => {
          event.preventDefault();
          try {
            setLoading(true);
            setError("");
            await loadRows(filters);
          } catch (apiError) {
            setError(apiError?.response?.data?.message || "Failed to filter applications.");
          } finally {
            setLoading(false);
          }
        }}
      >
        <select value={filters.cycle_id} onChange={(event) => setFilters((previous) => ({ ...previous, cycle_id: event.target.value }))}>
          <option value="">All cycles</option>
          {optionSets.cycles.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
        <select value={filters.status} onChange={(event) => setFilters((previous) => ({ ...previous, status: event.target.value }))}>
          <option value="">All statuses</option>
          {statusOptions.map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}
        </select>
        <button type="submit" className="btn-secondary">Apply Filters</button>
      </form>
      {error ? <p className="ui-error-text">{error}</p> : null}
      {loading ? <p>Loading applications...</p> : <DataTable columns={columns} rows={tableRows} emptyMessage="No admission applications found." />}

      <FormDrawer title={selectedRow ? "Edit Application" : "Register Application"} open={drawerOpen} onClose={() => !submitting && setDrawerOpen(false)}>
        <ApplicationForm
          initialValue={selectedRow}
          optionSets={optionSets}
          submitting={submitting}
          onSubmit={handleSave}
          onCancel={() => { if (!submitting) { setDrawerOpen(false); setSelectedRow(null); } }}
        />
      </FormDrawer>
    </ModuleShell>
  );
}

export default AdmissionTransactionsPage;

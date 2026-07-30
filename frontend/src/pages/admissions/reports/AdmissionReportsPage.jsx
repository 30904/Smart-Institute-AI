import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import {
  exportAdmissionReportCsv,
  fetchAdmissionMasterOptions,
  fetchAdmissionReports
} from "@/api/core";
import { DataTable, PageHeader, StatusBadge } from "@/components/ui";
import usePermission from "@/hooks/usePermission";
import ModuleShell from "@/layout/ModuleShell";

const EMPTY_REPORTS = {
  kpis: {},
  status_breakdown: [],
  conversion_funnel: [],
  seat_availability: [],
  pending_applications: [],
  merit_list: []
};

function AdmissionReportsPage() {
  const { hasPermission } = usePermission();
  const canView = hasPermission("admissions", "view");
  const [cycles, setCycles] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [filters, setFilters] = useState({ cycle_id: "", program_id: "" });
  const [reportType, setReportType] = useState("summary");
  const [reports, setReports] = useState(EMPTY_REPORTS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadReports(nextFilters = filters) {
    const response = await fetchAdmissionReports({
      cycle_id: nextFilters.cycle_id || undefined,
      program_id: nextFilters.program_id || undefined
    });
    setReports(response?.data || EMPTY_REPORTS);
  }

  useEffect(() => {
    if (!canView) {
      setLoading(false);
      return;
    }
    async function loadData() {
      try {
        setLoading(true);
        const [reportResponse, cycleResponse, programResponse] = await Promise.all([
          fetchAdmissionReports(),
          fetchAdmissionMasterOptions("cycles"),
          fetchAdmissionMasterOptions("programs")
        ]);
        setReports(reportResponse?.data || EMPTY_REPORTS);
        setCycles(Array.isArray(cycleResponse?.data) ? cycleResponse.data : []);
        setPrograms(Array.isArray(programResponse?.data) ? programResponse.data : []);
      } catch (apiError) {
        setError(apiError?.response?.data?.message || "Failed to load admission reports.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [canView]);

  if (!canView) return <main className="app-shell"><h3>Access denied</h3><p>You do not have permission to view admission reports.</p></main>;

  const kpiCards = [
    ["Applications", reports.kpis.total_applications || 0],
    ["Pending", reports.kpis.pending_applications || 0],
    ["Allotted", reports.kpis.allotted || 0],
    ["Enrolled", reports.kpis.enrolled || 0],
    ["Conversion", `${reports.kpis.conversion_percent || 0}%`],
    ["Seats Available", reports.kpis.available_seats || 0]
  ];

  const seatColumns = [
    { key: "cycle", label: "Cycle" },
    { key: "program", label: "Program" },
    { key: "total", label: "Total Seats" },
    { key: "allotted", label: "Allotted" },
    { key: "available", label: "Available" },
    { key: "waitlisted", label: "Waitlisted" }
  ];
  const seatRows = reports.seat_availability.map((row) => ({
    id: `${row.cycle_id}-${row.program_id}`,
    cycle: row.cycle,
    program: row.program,
    total: row.total_seats,
    allotted: row.allotted_seats,
    available: row.available_seats,
    waitlisted: row.waitlisted
  }));

  const pendingColumns = [
    { key: "applicant", label: "Applicant" },
    { key: "email", label: "Email" },
    { key: "cycle", label: "Cycle" },
    { key: "status", label: "Pending Stage" },
    { key: "date", label: "Applied On" }
  ];
  const pendingRows = reports.pending_applications.map((row) => ({
    id: row.application_id,
    applicant: row.applicant,
    email: row.email,
    cycle: row.cycle,
    status: <StatusBadge label={row.status.replaceAll("_", " ")} tone="warning" />,
    date: new Date(row.applied_on).toLocaleDateString()
  }));

  const meritColumns = [
    { key: "rank", label: "Rank" },
    { key: "application", label: "Application ID" },
    { key: "program", label: "Program" },
    { key: "score", label: "Score" },
    { key: "categoryRank", label: "Category Rank" },
    { key: "cutoff", label: "Cutoff" }
  ];
  const meritRows = reports.merit_list.map((row) => ({
    id: row.merit_record_id,
    rank: row.overall_rank,
    application: row.application_id,
    program: row.program,
    score: row.merit_score,
    categoryRank: row.category_rank,
    cutoff: <StatusBadge label={row.within_cutoff ? "Within" : "Outside"} tone={row.within_cutoff ? "success" : "warning"} />
  }));

  return (
    <ModuleShell title="Admissions" subtitle="Manage applications, enrollment, and admission workflows." activeTab="Reports" basePath="/admissions">
      <PageHeader title="Admission Reports" subtitle="Analyze applications, status, seats, merit, pending work, and conversion." />
      <form
        className="admission-filter-bar"
        onSubmit={async (event) => {
          event.preventDefault();
          try {
            setLoading(true);
            setError("");
            await loadReports(filters);
          } catch (apiError) {
            setError(apiError?.response?.data?.message || "Failed to apply report filters.");
          } finally {
            setLoading(false);
          }
        }}
      >
        <select value={filters.cycle_id} onChange={(event) => setFilters((previous) => ({ ...previous, cycle_id: event.target.value }))}>
          <option value="">All admission cycles</option>
          {cycles.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
        <select value={filters.program_id} onChange={(event) => setFilters((previous) => ({ ...previous, program_id: event.target.value }))}>
          <option value="">All programs</option>
          {programs.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
        <button type="submit" className="btn-primary" disabled={loading}>Apply Filters</button>
        <select value={reportType} onChange={(event) => setReportType(event.target.value)}>
          <option value="summary">Admission Summary</option>
          <option value="status">Application Status</option>
          <option value="seats">Seat Availability</option>
          <option value="pending">Pending Applications</option>
          <option value="merit">Merit List</option>
          <option value="conversion">Conversion Funnel</option>
        </select>
        <button
          type="button"
          className="btn-secondary"
          onClick={async () => {
            try {
              setError("");
              const result = await exportAdmissionReportCsv(reportType, {
                cycle_id: filters.cycle_id || undefined,
                program_id: filters.program_id || undefined
              });
              const url = URL.createObjectURL(result.blob);
              const anchor = document.createElement("a");
              anchor.href = url;
              anchor.download = result.filename;
              anchor.click();
              URL.revokeObjectURL(url);
            } catch (apiError) {
              setError(apiError?.response?.data?.message || "Failed to export report CSV.");
            }
          }}
        >
          Export CSV
        </button>
      </form>
      {error ? <p className="ui-error-text">{error}</p> : null}
      {loading ? <p>Loading reports...</p> : null}

      <section className="admission-kpi-grid">
        {kpiCards.map(([label, value]) => (
          <article key={label} className="admission-kpi-card">
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </section>

      <section className="admission-chart-grid">
        <article className="admission-workflow-card">
          <h3>Application Status</h3>
          <div className="admission-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reports.status_breakdown}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
        <article className="admission-workflow-card">
          <h3>Application Conversion</h3>
          <div className="admission-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reports.conversion_funnel}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="stage" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#059669" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>

      <section className="admission-workflow-card">
        <h3>Seat Availability</h3>
        <DataTable columns={seatColumns} rows={seatRows} emptyMessage="No intake capacity found." />
      </section>
      <section className="admission-workflow-card">
        <h3>Pending Applications</h3>
        <DataTable columns={pendingColumns} rows={pendingRows} emptyMessage="No pending applications." />
      </section>
      <section className="admission-workflow-card">
        <h3>Merit List</h3>
        <DataTable columns={meritColumns} rows={meritRows} emptyMessage="No merit records found." />
      </section>
    </ModuleShell>
  );
}

export default AdmissionReportsPage;

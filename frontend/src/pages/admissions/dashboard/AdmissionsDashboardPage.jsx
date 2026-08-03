import { useCallback, useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import { fetchAdmissionApplications, fetchAdmissionMasterOptions, fetchAdmissionReports } from "@/api/core";
import NavIcon from "@/components/NavIcon";
import { StatusBadge } from "@/components/ui";
import ModuleShell from "@/layout/ModuleShell";

const EMPTY_KPIS = {
  total_applications: 0,
  applications_today: 0,
  pending_applications: 0,
  pending_verification: 0,
  merit_listed: 0,
  allotted: 0,
  enrolled: 0,
  conversion_percent: 0,
  total_seats: 0,
  available_seats: 0
};

function getStatusTone(status) {
  if (["eligible", "approved", "enrolled", "merit_listed"].includes(status)) return "success";
  if (["ineligible", "rejected"].includes(status)) return "danger";
  if (["docs_pending", "fee_pending", "waitlisted", "allotted"].includes(status)) return "warning";
  return "info";
}

function formatAppCode(id = "") {
  const tail = String(id).replace(/[^a-zA-Z0-9]/g, "").slice(-4).toUpperCase();
  return `APP-${tail || "0000"}`;
}

function AdmissionsDashboardPage() {
  const navigate = useNavigate();
  const [kpis, setKpis] = useState(EMPTY_KPIS);
  const [recentApplications, setRecentApplications] = useState([]);
  const [programLabels, setProgramLabels] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [reportsRes, applicationsRes, programsRes] = await Promise.all([
        fetchAdmissionReports(),
        fetchAdmissionApplications(),
        fetchAdmissionMasterOptions("programs").catch(() => ({ data: [] }))
      ]);

      setKpis({ ...EMPTY_KPIS, ...(reportsRes?.data?.kpis || {}) });

      const programs = Array.isArray(programsRes?.data) ? programsRes.data : [];
      setProgramLabels(new Map(programs.map((program) => [String(program.value || program.id), program.label || program.name])));

      const applications = Array.isArray(applicationsRes?.data) ? applicationsRes.data : [];
      setRecentApplications(applications.slice(0, 6));
    } catch (apiError) {
      setError(apiError?.response?.data?.message || "Failed to load Admissions dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const metricCards = useMemo(
    () => [
      { key: "total", label: "Total Applications", value: kpis.total_applications, tone: "blue", icon: "students" },
      { key: "today", label: "New Admissions", value: kpis.applications_today, tone: "green", icon: "admissions" },
      { key: "pending", label: "Pending Admissions", value: kpis.pending_applications, tone: "amber", icon: "bell" },
      { key: "merit", label: "Merit Listed", value: kpis.merit_listed, tone: "indigo", icon: "exams" },
      { key: "allotted", label: "Seats Allotted", value: kpis.allotted, tone: "teal", icon: "academics" },
      { key: "faculty", label: "Enrolled", value: kpis.enrolled, tone: "navy", icon: "faculty" },
      { key: "verification", label: "Pending Verification", value: kpis.pending_verification, tone: "sky", icon: "search" },
      { key: "conversion", label: "Conversion %", value: `${kpis.conversion_percent}%`, tone: "green", icon: "dashboard" },
      { key: "seats-total", label: "Total Seats", value: kpis.total_seats, tone: "emerald", icon: "apps" },
      { key: "seats-left", label: "Available Seats", value: kpis.available_seats, tone: "red", icon: "fees" },
      { key: "reports", label: "Reports Ready", value: kpis.total_applications ? 1 : 0, tone: "orange", icon: "lms" },
      { key: "pipeline", label: "In Pipeline", value: Math.max(0, kpis.total_applications - kpis.enrolled), tone: "blue", icon: "admissions" }
    ],
    [kpis]
  );

  const summaryRows = [
    { label: "Total Applications", value: kpis.total_applications },
    { label: "Pending Admissions", value: kpis.pending_applications },
    { label: "Pending Verification", value: kpis.pending_verification },
    { label: "Enrolled Students", value: kpis.enrolled }
  ];

  const quickActions = [
    { label: "Admission Application", path: "/admissions/transactions", icon: "admissions" },
    { label: "Document Verification", path: "/admissions/transactions", icon: "search" },
    { label: "Merit & Counseling", path: "/admissions/transactions/counseling", icon: "exams" },
    { label: "Admission Masters", path: "/admissions/masters", icon: "settings" },
    { label: "Admissions Reports", path: "/admissions/reports", icon: "dashboard" }
  ];

  const actionQueue = recentApplications.filter((row) =>
    ["applied", "docs_pending", "fee_pending", "allotted"].includes(row.status)
  );

  return (
    <ModuleShell
      title="Admissions"
      subtitle="Manage applications, enrollment, and admission workflows."
      activeTab="Dashboard"
      basePath="/admissions"
    >
      <section className="adm-dash">
        <header className="adm-dash-hero">
          <div className="adm-dash-hero-main">
            <p className="adm-dash-hero-eyebrow">ADMISSIONS</p>
            <div className="adm-dash-hero-title-row">
              <span className="adm-dash-hero-mark" aria-hidden="true">
                <NavIcon name="academics" />
              </span>
              <div>
                <h2>Admissions Dashboard</h2>
                <p>
                  Applications, eligibility, merit, counseling, fees and enrollment — one workspace for the full admission
                  pipeline.
                </p>
              </div>
            </div>
          </div>
          <div className="adm-dash-hero-stats">
            <div className="adm-dash-hero-stat">
              <strong>{loading ? "—" : kpis.total_applications}</strong>
              <span>Total Applications</span>
            </div>
            <div className="adm-dash-hero-stat">
              <strong>{loading ? "—" : kpis.applications_today}</strong>
              <span>New Admissions</span>
            </div>
            <div className="adm-dash-hero-stat">
              <strong>{loading ? "—" : kpis.pending_applications}</strong>
              <span>Pending Admissions</span>
            </div>
          </div>
        </header>

        <div className="adm-dash-toolbar">
          <p className="adm-dash-toolbar-text">
            {error ? <span className="ui-error-text">{error}</span> : "Live admissions workload and conversion snapshot."}
          </p>
          <button type="button" className="btn-secondary" onClick={loadDashboard} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <section className="adm-dash-metrics">
          {metricCards.map((card) => (
            <article key={card.key} className={`adm-dash-metric adm-dash-metric-${card.tone}`}>
              <div>
                <span>{card.label}</span>
                <strong>{loading ? "—" : card.value}</strong>
              </div>
              <div className="adm-dash-metric-icon">
                <NavIcon name={card.icon} />
              </div>
            </article>
          ))}
        </section>

        <section className="adm-dash-split">
          <article className="adm-dash-panel">
            <header className="adm-dash-panel-header">
              <span className="adm-dash-panel-icon">
                <NavIcon name="admissions" />
              </span>
              <h3>Recent Admissions</h3>
            </header>
            {loading ? (
              <p className="adm-dash-empty">Loading recent applications...</p>
            ) : recentApplications.length ? (
              <ul className="adm-dash-list">
                {recentApplications.map((row) => {
                  const programId = row.program_preferences?.[0];
                  const programLabel = programLabels.get(String(programId)) || "Program preference pending";
                  return (
                    <li key={row.id}>
                      <button type="button" className="adm-dash-list-item" onClick={() => navigate(`/admissions/transactions/${row.id}`)}>
                        <span className="adm-dash-list-icon">
                          <NavIcon name="students" />
                        </span>
                        <span className="adm-dash-list-copy">
                          <strong>
                            {formatAppCode(row.id)} · {row.personal?.full_name || "Applicant"}
                          </strong>
                          <span>{programLabel}</span>
                        </span>
                        <StatusBadge
                          label={String(row.status || "applied").replaceAll("_", " ")}
                          tone={getStatusTone(row.status)}
                        />
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="adm-dash-empty">No recent applications found.</p>
            )}
          </article>

          <article className="adm-dash-panel">
            <header className="adm-dash-panel-header">
              <span className="adm-dash-panel-icon">
                <NavIcon name="apps" />
              </span>
              <h3>Quick Actions</h3>
            </header>
            <ul className="adm-dash-actions">
              {quickActions.map((action) => (
                <li key={action.path + action.label}>
                  <NavLink to={action.path} className="adm-dash-action-item">
                    <span className="adm-dash-list-icon">
                      <NavIcon name={action.icon} />
                    </span>
                    <span>{action.label}</span>
                    <span className="adm-dash-action-arrow" aria-hidden="true">
                      ↗
                    </span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </article>
        </section>

        <section className="adm-dash-split adm-dash-split-bottom">
          <article className="adm-dash-panel">
            <header className="adm-dash-panel-header">
              <span className="adm-dash-panel-icon">
                <NavIcon name="bell" />
              </span>
              <h3>Action Queue</h3>
            </header>
            {loading ? (
              <p className="adm-dash-empty">Loading queue...</p>
            ) : actionQueue.length ? (
              <ul className="adm-dash-list">
                {actionQueue.slice(0, 5).map((row) => (
                  <li key={`queue-${row.id}`}>
                    <button type="button" className="adm-dash-list-item" onClick={() => navigate(`/admissions/transactions/${row.id}`)}>
                      <span className="adm-dash-list-icon">
                        <NavIcon name="admissions" />
                      </span>
                      <span className="adm-dash-list-copy">
                        <strong>
                          {formatAppCode(row.id)} · {row.personal?.full_name || "Applicant"}
                        </strong>
                        <span>Needs attention · {String(row.status || "").replaceAll("_", " ")}</span>
                      </span>
                      <StatusBadge
                        label={String(row.status || "applied").replaceAll("_", " ")}
                        tone={getStatusTone(row.status)}
                      />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="adm-dash-empty">No urgent admission actions right now.</p>
            )}
          </article>

          <article className="adm-dash-panel">
            <header className="adm-dash-panel-header">
              <span className="adm-dash-panel-icon">
                <NavIcon name="dashboard" />
              </span>
              <h3>Summary</h3>
            </header>
            <ul className="adm-dash-summary">
              {summaryRows.map((row) => (
                <li key={row.label}>
                  <span>{row.label}</span>
                  <strong>{loading ? "—" : row.value}</strong>
                </li>
              ))}
            </ul>
          </article>
        </section>
      </section>
    </ModuleShell>
  );
}

export default AdmissionsDashboardPage;

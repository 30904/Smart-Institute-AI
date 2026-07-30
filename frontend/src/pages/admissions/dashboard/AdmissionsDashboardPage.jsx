import { useCallback, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

import { fetchAdmissionReports } from "@/api/core";
import { PageHeader } from "@/components/ui";
import ModuleShell from "@/layout/ModuleShell";

const EMPTY_KPIS = {
  applications_today: 0,
  pending_verification: 0,
  available_seats: 0,
  conversion_percent: 0
};

function AdmissionsDashboardPage() {
  const [kpis, setKpis] = useState(EMPTY_KPIS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetchAdmissionReports();
      setKpis({ ...EMPTY_KPIS, ...(response?.data?.kpis || {}) });
    } catch (apiError) {
      setError(apiError?.response?.data?.message || "Failed to load Admissions dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const widgets = [
    {
      key: "today",
      label: "Applications Today",
      value: kpis.applications_today,
      detail: "New applications registered today",
      icon: "AP",
      accent: "blue"
    },
    {
      key: "verification",
      label: "Pending Verification",
      value: kpis.pending_verification,
      detail: "Applications awaiting document checks",
      icon: "PV",
      accent: "amber"
    },
    {
      key: "seats",
      label: "Seats Left",
      value: kpis.available_seats,
      detail: "Available across configured intakes",
      icon: "SL",
      accent: "violet"
    },
    {
      key: "conversion",
      label: "Conversion",
      value: `${kpis.conversion_percent}%`,
      detail: "Applications converted to enrollment",
      icon: "CV",
      accent: "emerald"
    }
  ];

  return (
    <ModuleShell
      title="Admissions"
      subtitle="Manage applications, enrollment, and admission workflows."
      activeTab="Dashboard"
      basePath="/admissions"
    >
      <PageHeader
        title="Admissions Dashboard"
        subtitle="Monitor today's admissions workload and enrollment performance."
        actions={
          <button type="button" className="btn-secondary" onClick={loadDashboard} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        }
      />
      {error ? <p className="ui-error-text">{error}</p> : null}

      <section className="admission-dashboard-grid">
        {widgets.map((widget) => (
          <article key={widget.key} className={`admission-dashboard-widget admission-dashboard-widget-${widget.accent}`}>
            <div className="admission-dashboard-widget-icon">{widget.icon}</div>
            <div>
              <span>{widget.label}</span>
              <strong>{loading ? "—" : widget.value}</strong>
              <p>{widget.detail}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="admission-workflow-card">
        <h3>Quick Actions</h3>
        <div className="admission-quick-actions">
          <NavLink to="/admissions/transactions" className="btn-primary">View Applications</NavLink>
          <NavLink to="/admissions/transactions/counseling" className="btn-secondary">Merit & Counseling</NavLink>
          <NavLink to="/admissions/masters" className="btn-secondary">Admission Masters</NavLink>
          <NavLink to="/admissions/reports" className="btn-secondary">Open Reports</NavLink>
        </div>
      </section>
    </ModuleShell>
  );
}

export default AdmissionsDashboardPage;

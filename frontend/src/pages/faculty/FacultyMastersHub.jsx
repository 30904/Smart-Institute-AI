import { NavLink, useLocation } from "react-router-dom";

import ModuleShell from "@/layout/ModuleShell";
import { getActiveModuleTab } from "@/layout/ModuleSubNav";

/* ── Masters cards ─────────────────────────────────────────── */
const MASTER_CARDS = [
  {
    key: "departments",
    title: "Departments",
    description: "Academic departments used in faculty assignments. Managed in Shared Masters.",
    to: "/settings/departments",
    readOnly: true,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="6" height="13" rx="1" />
        <rect x="9" y="3" width="6" height="17" rx="1" />
        <rect x="16" y="10" width="6" height="10" rx="1" />
      </svg>
    )
  },
  {
    key: "designations",
    title: "Designations",
    description: "Define faculty designations: Lecturer, Assistant Professor, Professor, HOD, and more.",
    to: "/faculty/masters/designations",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
      </svg>
    )
  },
  {
    key: "faculty-types",
    title: "Faculty Types",
    description: "Classify faculty by employment type: Regular, Contract, Guest, and Visiting.",
    to: "/faculty/masters/faculty-types",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    )
  },
  {
    key: "qualifications",
    title: "Qualifications",
    description: "Maintain qualification records — degrees, diplomas, and certifications for faculty.",
    to: "/faculty/masters/qualifications",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    )
  },
  {
    key: "subjects",
    title: "Subject Masters",
    description: "Configure subjects taught across programs and departments for faculty assignment.",
    to: "/faculty/masters/subjects",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
        <line x1="9" y1="7" x2="15" y2="7" />
        <line x1="9" y1="11" x2="15" y2="11" />
      </svg>
    )
  },
  {
    key: "workload-rules",
    title: "Workload Rules",
    description: "Set weekly teaching load limits and workload calculation rules per faculty type.",
    to: "/faculty/masters/workload-rules",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
        <line x1="2" y1="20" x2="22" y2="20" />
      </svg>
    )
  }
];

/* ── Transaction cards ─────────────────────────────────────── */
const TRANSACTION_CARDS = [
  {
    key: "faculty-registration",
    title: "Faculty Registration",
    description: "Onboard new faculty members, capture personal details, and assign departments and roles.",
    to: "/faculty/transactions/registration",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="8.5" cy="7" r="4" />
        <line x1="20" y1="8" x2="20" y2="14" />
        <line x1="23" y1="11" x2="17" y2="11" />
      </svg>
    )
  },
  {
    key: "subject-allocation",
    title: "Subject Allocation",
    description: "Assign subjects to faculty members per program, semester, and academic year.",
    to: "/faculty/transactions/subject-allocation",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 11 12 14 22 4" />
        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
      </svg>
    )
  },
  {
    key: "timetable-assignment",
    title: "Timetable Assignment",
    description: "Schedule and assign faculty to class periods across departments and programs.",
    to: "/faculty/transactions/timetable",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <line x1="8" y1="14" x2="8.01" y2="14" />
        <line x1="12" y1="14" x2="12.01" y2="14" />
        <line x1="16" y1="14" x2="16.01" y2="14" />
      </svg>
    )
  },
  {
    key: "attendance",
    title: "Attendance",
    description: "Record and review faculty attendance, duty hours, and daily presence logs.",
    to: "/faculty/transactions/attendance",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="9" y1="15" x2="15" y2="15" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    )
  },
  {
    key: "leave-management",
    title: "Leave Management",
    description: "Process faculty leave applications, approvals, and track leave balance records.",
    to: "/faculty/transactions/leave",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <line x1="9" y1="16" x2="15" y2="16" />
        <line x1="12" y1="13" x2="12" y2="19" />
      </svg>
    )
  },
  {
    key: "performance-evaluation",
    title: "Performance Evaluation",
    description: "Conduct periodic faculty appraisals, score performance, and record feedback.",
    to: "/faculty/transactions/performance",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    )
  },
  {
    key: "research-publications",
    title: "Research & Publications",
    description: "Log faculty research projects, papers, patents, and conference contributions.",
    to: "/faculty/transactions/research",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
        <line x1="11" y1="8" x2="11" y2="14" />
        <line x1="8" y1="11" x2="14" y2="11" />
      </svg>
    )
  },
  {
    key: "training-records",
    title: "Training Records",
    description: "Track faculty training programs, workshops, certifications, and development activities.",
    to: "/faculty/transactions/training",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="6" />
        <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
      </svg>
    )
  }
];

/* ── Report cards ──────────────────────────────────────────── */
const REPORT_CARDS = [
  {
    key: "faculty-directory",
    title: "Faculty Directory",
    description: "Searchable directory of all faculty members with contact details and department mapping.",
    to: "/faculty/reports/directory",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    )
  },
  {
    key: "workload-report",
    title: "Workload Report",
    description: "Analyze faculty teaching hours, subject distribution, and workload compliance.",
    to: "/faculty/reports/workload",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21.21 15.89A10 10 0 118 2.83" />
        <path d="M22 12A10 10 0 0012 2v10z" />
      </svg>
    )
  },
  {
    key: "attendance-report",
    title: "Attendance Report",
    description: "Generate consolidated attendance reports for faculty presence and absences.",
    to: "/faculty/reports/attendance",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    )
  },
  {
    key: "leave-report",
    title: "Leave Report",
    description: "Track leave history, approved leaves, and available leave balances for all faculty.",
    to: "/faculty/reports/leave",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    )
  },
  {
    key: "performance-dashboard",
    title: "Performance Dashboard",
    description: "Visual analytics for faculty evaluations, feedback scores, and performance metrics.",
    to: "/faculty/reports/performance",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    )
  }
];

/* ── Card grid component ───────────────────────────────────── */
function CardGrid({ cards }) {
  return (
    <section className="fac-masters-grid">
      {cards.map((card) => (
        <NavLink key={card.key} to={card.to} className="fac-master-card">
          <div className="fac-master-card-icon">{card.icon}</div>
          <h4>{card.title}</h4>
          <p className="fac-master-card-desc">{card.description}</p>
          <span className={`fac-master-card-cta ${card.readOnly ? "fac-master-card-cta-muted" : ""}`}>
            {card.readOnly ? "View in Settings" : "Open module"}&nbsp;→
          </span>
        </NavLink>
      ))}
    </section>
  );
}

/* ── Empty placeholder for unimplemented tabs ─────────────── */
function EmptyTab({ label }) {
  return (
    <p className="ui-empty-state">{label} content coming soon.</p>
  );
}

/* ── Main hub ──────────────────────────────────────────────── */
function FacultyMastersHub() {
  const location = useLocation();
  const activeTab = getActiveModuleTab(location.pathname);

  return (
    <ModuleShell title="Faculty">
      {activeTab === "Masters" && <CardGrid cards={MASTER_CARDS} />}
      {activeTab === "Transactions" && <CardGrid cards={TRANSACTION_CARDS} />}
      {activeTab === "Dashboard" && <EmptyTab label="Dashboard" />}
      {activeTab === "Reports" && <CardGrid cards={REPORT_CARDS} />}
    </ModuleShell>
  );
}

export default FacultyMastersHub;

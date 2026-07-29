import { useState } from "react";
import { NavLink } from "react-router-dom";

import ModuleShell from "@/layout/ModuleShell";

/* ── Masters cards ─────────────────────────────────────────── */
const MASTER_CARDS = [
  {
    key: "exam-types",
    title: "Exam Types",
    description: "Define types of exams like Mid-terms, Finals, Practicals, and Unit Tests.",
    to: "/exams/masters/exam-types",
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
    key: "grading-scheme",
    title: "Grading Scheme",
    description: "Configure grade boundaries, GPA equivalents, and standard marking systems.",
    to: "/exams/masters/grading-scheme",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    )
  },
  {
    key: "passing-rules",
    title: "Passing Rules",
    description: "Set minimum pass marks, grace mark allowances, and conditional progression rules.",
    to: "/exams/masters/passing-rules",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    )
  },
  {
    key: "evaluation-rules",
    title: "Evaluation Rules",
    description: "Configure weightages for internal vs. external marks and evaluation procedures.",
    to: "/exams/masters/evaluation-rules",
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
    key: "result-templates",
    title: "Result Templates",
    description: "Design formats for report cards, transcripts, and official result declarations.",
    to: "/exams/masters/result-templates",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <rect x="8" y="14" width="2" height="2" />
        <rect x="14" y="14" width="2" height="2" />
      </svg>
    )
  }
];

/* ── Transaction cards ─────────────────────────────────────── */
const TRANSACTION_CARDS = [
  {
    key: "exam-scheduling",
    title: "Exam Scheduling",
    description: "Create exam timetables, allocate subjects to dates, and publish schedules.",
    to: "/exams/transactions/exam-scheduling",
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
    key: "hall-ticket-generation",
    title: "Hall Ticket Generation",
    description: "Generate and distribute exam admit cards for eligible students.",
    to: "/exams/transactions/hall-tickets",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
        <rect x="9" y="9" width="6" height="6" />
        <line x1="9" y1="1" x2="9" y2="4" />
        <line x1="15" y1="1" x2="15" y2="4" />
        <line x1="9" y1="20" x2="9" y2="23" />
        <line x1="15" y1="20" x2="15" y2="23" />
        <line x1="20" y1="9" x2="23" y2="9" />
        <line x1="20" y1="14" x2="23" y2="14" />
        <line x1="1" y1="9" x2="4" y2="9" />
        <line x1="1" y1="14" x2="4" y2="14" />
      </svg>
    )
  },
  {
    key: "seating-arrangement",
    title: "Seating Arrangement",
    description: "Allocate exam halls, arrange seating plans, and assign invigilators.",
    to: "/exams/transactions/seating-arrangement",
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
    key: "mark-entry",
    title: "Mark Entry",
    description: "Input scores for internal and external theory examinations.",
    to: "/exams/transactions/mark-entry",
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
    key: "practical-marks",
    title: "Practical Marks",
    description: "Record scores for lab practicals, viva-voce, and project presentations.",
    to: "/exams/transactions/practical-marks",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 2v7.31" />
        <path d="M14 9.3V1.99" />
        <path d="M8.5 2h7" />
        <path d="M14 9.3a6.5 6.5 0 11-4 0" />
        <path d="M5.52 16h12.96" />
      </svg>
    )
  },
  {
    key: "result-processing",
    title: "Result Processing",
    description: "Process raw marks, apply passing rules, and calculate final grades or GPAs.",
    to: "/exams/transactions/result-processing",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    )
  },
  {
    key: "revaluation",
    title: "Revaluation",
    description: "Handle student requests for paper revaluation and update revised marks.",
    to: "/exams/transactions/revaluation",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="1 4 1 10 7 10" />
        <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
      </svg>
    )
  },
  {
    key: "transcript-generation",
    title: "Transcript Generation",
    description: "Generate official academic transcripts spanning multiple semesters.",
    to: "/exams/transactions/transcript-generation",
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
    key: "certificate-generation",
    title: "Certificate Generation",
    description: "Issue provisional and final degree certificates for graduating students.",
    to: "/exams/transactions/certificate-generation",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="7" />
        <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
      </svg>
    )
  }
];

/* ── Report cards ──────────────────────────────────────────── */
const REPORT_CARDS = [
  {
    key: "result-analysis",
    title: "Result Analysis",
    description: "View comprehensive reports on exam outcomes, student performance, and class trends.",
    to: "/exams/reports/result-analysis",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    )
  },
  {
    key: "grade-distribution",
    title: "Grade Distribution",
    description: "Analyze the spread of grades across different subjects and programs visually.",
    to: "/exams/reports/grade-distribution",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21.21 15.89A10 10 0 118 2.83" />
        <path d="M22 12A10 10 0 0012 2v10z" />
      </svg>
    )
  },
  {
    key: "pass-percentage",
    title: "Pass Percentage",
    description: "Track pass/fail ratios and academic success metrics over multiple semesters.",
    to: "/exams/reports/pass-percentage",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    )
  },
  {
    key: "subject-analysis",
    title: "Subject Analysis",
    description: "Evaluate difficulty levels and average scores per subject across departments.",
    to: "/exams/reports/subject-analysis",
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
    key: "topper-report",
    title: "Topper Report",
    description: "Identify and list top-performing students and class rank holders.",
    to: "/exams/reports/topper-report",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="7" />
        <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
      </svg>
    )
  },
  {
    key: "backlog-report",
    title: "Backlog Report",
    description: "Monitor students with pending subjects, reappearance eligibility, and arrear status.",
    to: "/exams/reports/backlog-report",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
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
function ExamsHub() {
  const [activeTab, setActiveTab] = useState("Masters");

  return (
    <ModuleShell title="Exams" activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === "Masters" && <CardGrid cards={MASTER_CARDS} />}
      {activeTab === "Dashboard" && <EmptyTab label="Dashboard" />}
      {activeTab === "Transactions" && <CardGrid cards={TRANSACTION_CARDS} />}
      {activeTab === "Reports" && <CardGrid cards={REPORT_CARDS} />}
    </ModuleShell>
  );
}

export default ExamsHub;

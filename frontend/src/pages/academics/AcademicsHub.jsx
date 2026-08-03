import { NavLink, useLocation } from "react-router-dom";

import ModuleShell from "@/layout/ModuleShell";
import { getActiveModuleTab } from "@/layout/ModuleSubNav";

/* ── Masters cards ─────────────────────────────────────────── */
const MASTER_CARDS = [
  {
    key: "programs",
    title: "Programs",
    description: "Manage academic programs, degree types, and program-specific settings.",
    to: "/settings/programs",
    readOnly: true,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    )
  },
  {
    key: "semesters",
    title: "Semesters",
    description: "Define semester timelines, terms, and academic sessions.",
    to: "/academics/masters/semesters",
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
    key: "subjects",
    title: "Subjects",
    description: "Manage course subjects, syllabus structures, and subject categorizations.",
    to: "/academics/masters/subjects",
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
    key: "curriculum",
    title: "Curriculum",
    description: "Design curriculum outlines, course prerequisites, and graduation requirements.",
    to: "/academics/masters/curriculum",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
      </svg>
    )
  },
  {
    key: "credits",
    title: "Credits",
    description: "Configure credit hour systems, grading weights, and GPA calculation rules.",
    to: "/academics/masters/credits",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4" />
        <path d="M12 8h.01" />
      </svg>
    )
  },
  {
    key: "academic-calendar",
    title: "Academic Calendar",
    description: "Set institutional holidays, exam periods, and important academic events. Managed in Shared Masters.",
    to: "/settings/academic-years",
    readOnly: true,
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
  },
  {
    key: "classrooms",
    title: "Classrooms",
    description: "Manage physical classroom capacities, lab resources, and room availability.",
    to: "/academics/masters/classrooms",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21h18" />
        <path d="M5 21V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v14" />
        <path d="M9 14h6" />
        <path d="M9 10h6" />
      </svg>
    )
  },
  {
    key: "time-slots",
    title: "Time Slots",
    description: "Configure daily period schedules, break times, and standardized shift slots.",
    to: "/academics/masters/time-slots",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    )
  }
];

/* ── Transaction cards ─────────────────────────────────────── */
const TRANSACTION_CARDS = [
  {
    key: "semester-registration",
    title: "Semester Registration",
    description: "Process student registrations for upcoming semesters and track enrollment status.",
    to: "/academics/transactions/semester-registration",
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
    key: "subject-registration",
    title: "Subject Registration",
    description: "Manage elective choices and core subject enrollments for students.",
    to: "/academics/transactions/subject-registration",
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
    key: "batch-allocation",
    title: "Batch Allocation",
    description: "Group students into batches or sections for lectures and practical labs.",
    to: "/academics/transactions/batch-allocation",
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
    key: "timetable-generation",
    title: "Timetable Generation",
    description: "Create and publish class schedules, allocating faculty and rooms.",
    to: "/academics/transactions/timetable-generation",
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
    description: "Mark daily or period-wise student attendance and monitor minimum criteria.",
    to: "/academics/transactions/attendance",
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
    key: "assignment-creation",
    title: "Assignment Creation",
    description: "Create coursework assignments, define rubrics, and set submission deadlines.",
    to: "/academics/transactions/assignment-creation",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    )
  },
  {
    key: "internal-assessments",
    title: "Internal Assessments",
    description: "Schedule internal tests, record marks, and compute continuous evaluation scores.",
    to: "/academics/transactions/internal-assessments",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    )
  }
];

/* ── Report cards ──────────────────────────────────────────── */
const REPORT_CARDS = [
  {
    key: "timetable-reports",
    title: "Timetable Reports",
    description: "Generate and print weekly class timetables for programs, faculties, or classrooms.",
    to: "/academics/reports/timetable",
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
    key: "attendance-reports",
    title: "Attendance Reports",
    description: "Analyze student attendance patterns, track defaulters, and view overall metrics.",
    to: "/academics/reports/attendance",
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
    key: "academic-progress",
    title: "Academic Progress",
    description: "Monitor internal assessment scores and continuous academic performance.",
    to: "/academics/reports/academic-progress",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    )
  },
  {
    key: "course-completion",
    title: "Course Completion",
    description: "Track syllabus coverage and faculty progress against planned course curriculums.",
    to: "/academics/reports/course-completion",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    )
  },
  {
    key: "class-utilization",
    title: "Class Utilization",
    description: "View reports on classroom and lab occupancy rates and optimize resource usage.",
    to: "/academics/reports/class-utilization",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21.21 15.89A10 10 0 118 2.83" />
        <path d="M22 12A10 10 0 0012 2v10z" />
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
function AcademicsHub() {
  const location = useLocation();
  const activeTab = getActiveModuleTab(location.pathname);

  return (
    <ModuleShell title="Academics">
      {activeTab === "Masters" && <CardGrid cards={MASTER_CARDS} />}
      {activeTab === "Dashboard" && <EmptyTab label="Dashboard" />}
      {activeTab === "Transactions" && <CardGrid cards={TRANSACTION_CARDS} />}
      {activeTab === "Reports" && <CardGrid cards={REPORT_CARDS} />}
    </ModuleShell>
  );
}

export default AcademicsHub;

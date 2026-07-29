import { useState } from "react";
import { NavLink } from "react-router-dom";

import ModuleShell from "@/layout/ModuleShell";

/* ── Masters cards ─────────────────────────────────────────── */
const MASTER_CARDS = [
  {
    key: "course-categories",
    title: "Course Categories",
    description: "Define categories and tags to organize digital courses and learning materials.",
    to: "/lms/masters/course-categories",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      </svg>
    )
  },
  {
    key: "learning-paths",
    title: "Learning Paths",
    description: "Structure courses into sequential learning paths and track learner progression.",
    to: "/lms/masters/learning-paths",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    )
  },
  {
    key: "assignment-templates",
    title: "Assignment Templates",
    description: "Create standard templates for assignments, homework, and project submissions.",
    to: "/lms/masters/assignment-templates",
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
    key: "quiz-templates",
    title: "Quiz Templates",
    description: "Design reusable quiz formats, question banks, and automated grading rules.",
    to: "/lms/masters/quiz-templates",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    )
  },
  {
    key: "assessment-types",
    title: "Assessment Types",
    description: "Configure types of assessments such as peer reviews, practicals, and vivas.",
    to: "/lms/masters/assessment-types",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    )
  }
];

/* ── Transaction cards ─────────────────────────────────────── */
const TRANSACTION_CARDS = [
  {
    key: "course-creation",
    title: "Course Creation",
    description: "Design new courses, set syllabi, define modules, and establish enrollment rules.",
    to: "/lms/transactions/course-creation",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="12" y1="18" x2="12" y2="12" />
        <line x1="9" y1="15" x2="15" y2="15" />
      </svg>
    )
  },
  {
    key: "content-upload",
    title: "Content Upload",
    description: "Upload and manage course materials including PDFs, videos, and SCORM packages.",
    to: "/lms/transactions/content-upload",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
    )
  },
  {
    key: "assignment-creation",
    title: "Assignment Creation",
    description: "Deploy new assignments, set deadlines, and configure plagiarism checks.",
    to: "/lms/transactions/assignment-creation",
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
    key: "quiz-creation",
    title: "Quiz Creation",
    description: "Build interactive quizzes, schedule tests, and configure automated grading.",
    to: "/lms/transactions/quiz-creation",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    )
  },
  {
    key: "student-submission",
    title: "Student Submission",
    description: "Review, grade, and provide feedback on student assignments and coursework.",
    to: "/lms/transactions/student-submission",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    )
  },
  {
    key: "discussion-forums",
    title: "Discussion Forums",
    description: "Moderate course discussions, handle student queries, and promote engagement.",
    to: "/lms/transactions/discussion-forums",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" />
      </svg>
    )
  },
  {
    key: "live-classes",
    title: "Live Classes",
    description: "Schedule and manage virtual classrooms, webinars, and live interactive sessions.",
    to: "/lms/transactions/live-classes",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="23 7 16 12 23 17 23 7" />
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
      </svg>
    )
  },
  {
    key: "course-completion",
    title: "Course Completion",
    description: "Process end-of-course evaluations, issue certificates, and close course modules.",
    to: "/lms/transactions/course-completion",
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
    key: "learning-progress",
    title: "Learning Progress",
    description: "Track individual student progress through modules, paths, and course materials.",
    to: "/lms/reports/learning-progress",
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
    description: "View aggregate data on course completion rates, drop-offs, and final certifications.",
    to: "/lms/reports/course-completion",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    )
  },
  {
    key: "assignment-status",
    title: "Assignment Status",
    description: "Monitor assignment submission rates, pending grading, and overall class performance.",
    to: "/lms/reports/assignment-status",
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
    key: "quiz-analytics",
    title: "Quiz Analytics",
    description: "Analyze quiz results, question difficulty indexing, and student score distributions.",
    to: "/lms/reports/quiz-analytics",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21.21 15.89A10 10 0 118 2.83" />
        <path d="M22 12A10 10 0 0012 2v10z" />
      </svg>
    )
  },
  {
    key: "student-engagement",
    title: "Student Engagement",
    description: "Measure forum participation, active hours, and content interaction frequency.",
    to: "/lms/reports/student-engagement",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
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
function LmsHub() {
  const [activeTab, setActiveTab] = useState("Masters");

  return (
    <ModuleShell title="LMS" activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === "Masters" && <CardGrid cards={MASTER_CARDS} />}
      {activeTab === "Dashboard" && <EmptyTab label="Dashboard" />}
      {activeTab === "Transactions" && <CardGrid cards={TRANSACTION_CARDS} />}
      {activeTab === "Reports" && <CardGrid cards={REPORT_CARDS} />}
    </ModuleShell>
  );
}

export default LmsHub;

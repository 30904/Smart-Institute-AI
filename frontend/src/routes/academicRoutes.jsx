import { lazy } from "react";

const FacultyPage = lazy(() => import("@/pages/faculty/FacultyPage"));
const TimetableAssignment = lazy(() => import("@/pages/faculty/transactions/timetable/TimetableAssignment"));
const AcademicsPage = lazy(() => import("@/pages/academics/AcademicsPage"));
const TimetableGeneration = lazy(() => import("@/pages/academics/transactions/timetable/TimetableGeneration"));
const LmsPage = lazy(() => import("@/pages/lms/LmsPage"));
const ExamsPage = lazy(() => import("@/pages/exams/ExamsPage"));

const FacultyTypeMaster = lazy(() => import("@/pages/faculty/masters/FacultyTypeMaster"));
const DesignationMaster = lazy(() => import("@/pages/faculty/masters/DesignationMaster"));
const QualificationMaster = lazy(() => import("@/pages/faculty/masters/QualificationMaster"));
const SubjectMaster = lazy(() => import("@/pages/faculty/masters/SubjectMaster"));

const FacultyPunchPage = lazy(() => import("@/pages/faculty/attendance/FacultyPunchPage"));
const FacultyAttendanceReport = lazy(() => import("@/pages/faculty/attendance/FacultyAttendanceReport"));
const FacultyLeavePage = lazy(() => import("@/pages/faculty/transactions/leave/FacultyLeavePage"));
const FacultyPerformancePage = lazy(() => import("@/pages/faculty/transactions/performance/FacultyPerformancePage"));
const FacultyRegistrationPage = lazy(() => import("@/pages/faculty/transactions/registration/FacultyRegistrationPage"));
const FacultyDirectoryPage = lazy(() => import("@/pages/faculty/reports/directory/FacultyDirectoryPage"));
const WorkloadRulesPage = lazy(() => import("@/pages/faculty/masters/WorkloadRulesPage"));
const SubjectAllocationPage = lazy(() => import("@/pages/faculty/transactions/subject-allocation/SubjectAllocationPage"));
const FacultyResearchPage = lazy(() => import("@/pages/faculty/transactions/research/FacultyResearchPage"));
const FacultyProfilePage = lazy(() => import("@/pages/faculty/reports/FacultyProfilePage"));

const academicRoutes = [
  { path: "/faculty", element: FacultyPage, moduleName: "faculty", action: "view" },
  { path: "/faculty/dashboard", element: FacultyPage, moduleName: "faculty", action: "view" },
  { path: "/faculty/masters", element: FacultyPage, moduleName: "faculty", action: "view" },
  { path: "/faculty/transactions", element: FacultyPage, moduleName: "faculty", action: "view" },
  { path: "/faculty/reports", element: FacultyPage, moduleName: "faculty", action: "view" },
  { path: "/faculty/masters/faculty-types", element: FacultyTypeMaster, moduleName: "faculty", action: "view" },
  { path: "/faculty/masters/designations", element: DesignationMaster, moduleName: "faculty", action: "view" },
  { path: "/faculty/masters/qualifications", element: QualificationMaster, moduleName: "faculty", action: "view" },
  { path: "/faculty/masters/subjects", element: SubjectMaster, moduleName: "faculty", action: "view" },
  { path: "/faculty/attendance/punch", element: FacultyPunchPage, moduleName: "faculty", action: "view" },
  { path: "/faculty/attendance/report", element: FacultyAttendanceReport, moduleName: "faculty", action: "view" },
  { path: "/faculty/transactions/leave", element: FacultyLeavePage, moduleName: "faculty", action: "view" },
  { path: "/faculty/transactions/performance", element: FacultyPerformancePage, moduleName: "faculty", action: "view" },
  { path: "/faculty/transactions/registration", element: FacultyRegistrationPage, moduleName: "faculty", action: "view" },
  { path: "/faculty/transactions/subject-allocation", element: SubjectAllocationPage, moduleName: "faculty", action: "view" },
  { path: "/faculty/transactions/research", element: FacultyResearchPage, moduleName: "faculty", action: "view" },
  { path: "/faculty/transactions/timetable", element: TimetableAssignment, moduleName: "faculty", action: "view" },
  { path: "/faculty/masters/workload-rules", element: WorkloadRulesPage, moduleName: "faculty", action: "view" },
  { path: "/faculty/reports/directory", element: FacultyDirectoryPage, moduleName: "faculty", action: "view" },
  { path: "/faculty/profile/:id", element: FacultyProfilePage, moduleName: "faculty", action: "view" },
  { path: "/academics", element: AcademicsPage, moduleName: "academics", action: "view" },
  { path: "/academics/dashboard", element: AcademicsPage, moduleName: "academics", action: "view" },
  { path: "/academics/masters", element: AcademicsPage, moduleName: "academics", action: "view" },
  { path: "/academics/transactions", element: AcademicsPage, moduleName: "academics", action: "view" },
  { path: "/academics/reports", element: AcademicsPage, moduleName: "academics", action: "view" },
  { path: "/academics/transactions/timetable-generation", element: TimetableGeneration, moduleName: "academics", action: "view" },
  { path: "/lms", element: LmsPage, moduleName: "lms", action: "view" },
  { path: "/lms/dashboard", element: LmsPage, moduleName: "lms", action: "view" },
  { path: "/lms/masters", element: LmsPage, moduleName: "lms", action: "view" },
  { path: "/lms/transactions", element: LmsPage, moduleName: "lms", action: "view" },
  { path: "/lms/reports", element: LmsPage, moduleName: "lms", action: "view" },
  { path: "/exams", element: ExamsPage, moduleName: "exams", action: "view" },
  { path: "/exams/dashboard", element: ExamsPage, moduleName: "exams", action: "view" },
  { path: "/exams/masters", element: ExamsPage, moduleName: "exams", action: "view" },
  { path: "/exams/transactions", element: ExamsPage, moduleName: "exams", action: "view" },
  { path: "/exams/reports", element: ExamsPage, moduleName: "exams", action: "view" }
];

export default academicRoutes;

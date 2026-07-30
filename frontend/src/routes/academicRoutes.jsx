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

const academicRoutes = [
  { path: "/faculty", element: FacultyPage, moduleName: "faculty", action: "view" },
  { path: "/faculty/masters/faculty-types", element: FacultyTypeMaster, moduleName: "faculty", action: "view" },
  { path: "/faculty/masters/designations", element: DesignationMaster, moduleName: "faculty", action: "view" },
  { path: "/faculty/masters/qualifications", element: QualificationMaster, moduleName: "faculty", action: "view" },
  { path: "/faculty/masters/subjects", element: SubjectMaster, moduleName: "faculty", action: "view" },
  { path: "/faculty/attendance/punch", element: FacultyPunchPage, moduleName: "faculty", action: "view" },
  { path: "/faculty/attendance/report", element: FacultyAttendanceReport, moduleName: "faculty", action: "view" },
  { path: "/faculty/transactions/timetable", element: TimetableAssignment, moduleName: "faculty", action: "view" },
  { path: "/academics", element: AcademicsPage, moduleName: "academics", action: "view" },
  { path: "/academics/transactions/timetable-generation", element: TimetableGeneration, moduleName: "academics", action: "view" },
  { path: "/lms", element: LmsPage, moduleName: "lms", action: "view" },
  { path: "/exams", element: ExamsPage, moduleName: "exams", action: "view" }
];

export default academicRoutes;

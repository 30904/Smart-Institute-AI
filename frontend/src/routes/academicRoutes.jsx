import { lazy } from "react";

const FacultyPage = lazy(() => import("@/pages/faculty/FacultyPage"));
const TimetableAssignment = lazy(() => import("@/pages/faculty/transactions/timetable/TimetableAssignment"));
const AcademicsPage = lazy(() => import("@/pages/academics/AcademicsPage"));
const TimetableGeneration = lazy(() => import("@/pages/academics/transactions/timetable/TimetableGeneration"));
const LmsPage = lazy(() => import("@/pages/lms/LmsPage"));
const ExamsPage = lazy(() => import("@/pages/exams/ExamsPage"));

const academicRoutes = [
  { path: "/faculty", element: FacultyPage, moduleName: "faculty", action: "view" },
  { path: "/faculty/transactions/timetable", element: TimetableAssignment, moduleName: "faculty", action: "view" },
  { path: "/academics", element: AcademicsPage, moduleName: "academics", action: "view" },
  { path: "/academics/transactions/timetable-generation", element: TimetableGeneration, moduleName: "academics", action: "view" },
  { path: "/lms", element: LmsPage, moduleName: "lms", action: "view" },
  { path: "/exams", element: ExamsPage, moduleName: "exams", action: "view" }
];

export default academicRoutes;

import { lazy } from "react";

const FacultyPage = lazy(() => import("@/pages/faculty/FacultyPage"));
const AcademicsPage = lazy(() => import("@/pages/academics/AcademicsPage"));
const LmsPage = lazy(() => import("@/pages/lms/LmsPage"));
const ExamsPage = lazy(() => import("@/pages/exams/ExamsPage"));

const academicRoutes = [
  { path: "/faculty", element: FacultyPage },
  { path: "/academics", element: AcademicsPage },
  { path: "/lms", element: LmsPage },
  { path: "/exams", element: ExamsPage }
];

export default academicRoutes;

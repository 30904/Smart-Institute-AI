import { lazy } from "react";

const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));
const DashboardPage = lazy(() => import("@/pages/dashboard/DashboardPage"));
const AdmissionsPage = lazy(() => import("@/pages/admissions/AdmissionsPage"));
const StudentsPage = lazy(() => import("@/pages/students/StudentsPage"));
const FeesPage = lazy(() => import("@/pages/fees/FeesPage"));
const UsersPage = lazy(() => import("@/pages/users/UsersPage"));
const SharedMastersPage = lazy(() => import("@/pages/settings/SharedMastersPage"));

const coreRoutes = [
  { path: "/login", element: LoginPage },
  { path: "/", element: DashboardPage },
  { path: "/dashboard", element: DashboardPage },
  { path: "/admissions", element: AdmissionsPage },
  { path: "/students", element: StudentsPage },
  { path: "/fees", element: FeesPage },
  { path: "/users", element: UsersPage },
  { path: "/settings/shared-masters", element: SharedMastersPage }
];

export default coreRoutes;

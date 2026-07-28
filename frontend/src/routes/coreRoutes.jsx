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
  { path: "/", element: DashboardPage, moduleName: "dashboard", action: "view" },
  { path: "/dashboard", element: DashboardPage, moduleName: "dashboard", action: "view" },
  { path: "/admissions", element: AdmissionsPage, moduleName: "admissions", action: "view" },
  { path: "/students", element: StudentsPage, moduleName: "students", action: "view" },
  { path: "/fees", element: FeesPage, moduleName: "fees", action: "view" },
  { path: "/users", element: UsersPage, moduleName: "users", action: "view" },
  { path: "/settings/shared-masters", element: SharedMastersPage, moduleName: "settings", action: "view" }
];

export default coreRoutes;

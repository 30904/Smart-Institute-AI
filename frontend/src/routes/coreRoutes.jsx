import { lazy } from "react";

const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));
const DashboardPage = lazy(() => import("@/pages/dashboard/DashboardPage"));
const AdmissionsPage = lazy(() => import("@/pages/admissions/AdmissionsPage"));
const AdmissionsMastersPage = lazy(() => import("@/pages/admissions/AdmissionsMastersPage"));
const StudentsPage = lazy(() => import("@/pages/students/StudentsPage"));
const FeesPage = lazy(() => import("@/pages/fees/FeesPage"));
const UsersPage = lazy(() => import("@/pages/users/UsersPage"));
const SharedMastersPage = lazy(() => import("@/pages/settings/SharedMastersPage"));
const AcademicYearPage = lazy(() => import("@/pages/settings/AcademicYearPage"));
const DepartmentPage = lazy(() => import("@/pages/settings/DepartmentPage"));
const ProgramPage = lazy(() => import("@/pages/settings/ProgramPage"));
const InstitutionSettingsPage = lazy(() => import("@/pages/settings/InstitutionSettingsPage"));

const coreRoutes = [
  { path: "/login", element: LoginPage },
  { path: "/", element: DashboardPage, moduleName: "dashboard", action: "view" },
  { path: "/dashboard", element: DashboardPage, moduleName: "dashboard", action: "view" },
  { path: "/admissions", element: AdmissionsPage, moduleName: "admissions", action: "view" },
  { path: "/admissions/dashboard", element: AdmissionsPage, moduleName: "admissions", action: "view" },
  { path: "/admissions/masters", element: AdmissionsMastersPage, moduleName: "admissions", action: "view" },
  { path: "/admissions/transactions", element: AdmissionsPage, moduleName: "admissions", action: "view" },
  { path: "/admissions/reports", element: AdmissionsPage, moduleName: "admissions", action: "view" },
  { path: "/students", element: StudentsPage, moduleName: "students", action: "view" },
  { path: "/fees", element: FeesPage, moduleName: "fees", action: "view" },
  { path: "/users", element: UsersPage, moduleName: "users", action: "view" },
  { path: "/settings/shared-masters", element: SharedMastersPage, moduleName: "settings", action: "view" },
  { path: "/settings/institution", element: InstitutionSettingsPage, moduleName: "settings", action: "view" },
  { path: "/settings/academic-years", element: AcademicYearPage, moduleName: "settings", action: "view" },
  { path: "/settings/departments", element: DepartmentPage, moduleName: "settings", action: "view" },
  { path: "/settings/programs", element: ProgramPage, moduleName: "settings", action: "view" }
];

export default coreRoutes;

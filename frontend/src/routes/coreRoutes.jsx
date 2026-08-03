import { lazy } from "react";

const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));
const DashboardPage = lazy(() => import("@/pages/dashboard/DashboardPage"));
const AdmissionsDashboardPage = lazy(() => import("@/pages/admissions/dashboard/AdmissionsDashboardPage"));
const AdmissionsMastersPage = lazy(() => import("@/pages/admissions/AdmissionsMastersPage"));
const AdmissionMasterPage = lazy(() => import("@/pages/admissions/masters/AdmissionMasterPage"));
const AdmissionTransactionsPage = lazy(() => import("@/pages/admissions/transactions/AdmissionTransactionsPage"));
const ApplicationDetailPage = lazy(() => import("@/pages/admissions/transactions/ApplicationDetailPage"));
const CounselingPage = lazy(() => import("@/pages/admissions/transactions/CounselingPage"));
const AdmissionReportsPage = lazy(() => import("@/pages/admissions/reports/AdmissionReportsPage"));
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
  { path: "/admissions", element: AdmissionsDashboardPage, moduleName: "admissions", action: "view" },
  { path: "/admissions/dashboard", element: AdmissionsDashboardPage, moduleName: "admissions", action: "view" },
  { path: "/admissions/masters", element: AdmissionsMastersPage, moduleName: "admissions", action: "view" },
  { path: "/admissions/masters/:resource", element: AdmissionMasterPage, moduleName: "admissions", action: "view" },
  { path: "/admissions/transactions", element: AdmissionTransactionsPage, moduleName: "admissions", action: "view" },
  { path: "/admissions/transactions/counseling", element: CounselingPage, moduleName: "admissions", action: "view" },
  { path: "/admissions/transactions/:applicationId", element: ApplicationDetailPage, moduleName: "admissions", action: "view" },
  { path: "/admissions/reports", element: AdmissionReportsPage, moduleName: "admissions", action: "view" },
  { path: "/students", element: StudentsPage, moduleName: "students", action: "view" },
  { path: "/students/dashboard", element: StudentsPage, moduleName: "students", action: "view" },
  { path: "/students/masters", element: StudentsPage, moduleName: "students", action: "view" },
  { path: "/students/transactions", element: StudentsPage, moduleName: "students", action: "view" },
  { path: "/students/reports", element: StudentsPage, moduleName: "students", action: "view" },
  { path: "/fees", element: FeesPage, moduleName: "fees", action: "view" },
  { path: "/fees/dashboard", element: FeesPage, moduleName: "fees", action: "view" },
  { path: "/fees/masters", element: FeesPage, moduleName: "fees", action: "view" },
  { path: "/fees/transactions", element: FeesPage, moduleName: "fees", action: "view" },
  { path: "/fees/reports", element: FeesPage, moduleName: "fees", action: "view" },
  { path: "/users", element: UsersPage, moduleName: "users", action: "view" },
  { path: "/settings/shared-masters", element: SharedMastersPage, moduleName: "settings", action: "view" },
  { path: "/settings/institution", element: InstitutionSettingsPage, moduleName: "settings", action: "view" },
  { path: "/settings/academic-years", element: AcademicYearPage, moduleName: "settings", action: "view" },
  { path: "/settings/departments", element: DepartmentPage, moduleName: "settings", action: "view" },
  { path: "/settings/programs", element: ProgramPage, moduleName: "settings", action: "view" }
];

export default coreRoutes;

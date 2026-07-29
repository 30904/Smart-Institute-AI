import ModuleShell from "@/layout/ModuleShell";
import { useLocation } from "react-router-dom";

const admissionTabs = {
  dashboard: {
    label: "Dashboard",
    description: "Admissions dashboard widgets will be available here."
  },
  masters: {
    label: "Masters",
    description: "Configure admission cycles, intake, categories, eligibility, documents, fees, scholarships, and statuses."
  },
  transactions: {
    label: "Transactions",
    description: "Process applications, verification, merit, counseling, approval, and enrollment."
  },
  reports: {
    label: "Reports",
    description: "Review admission summaries, application status, seat availability, merit lists, and conversion."
  }
};

function getActiveTab(pathname) {
  const routeSegment = pathname.split("/").filter(Boolean)[1] || "dashboard";
  return admissionTabs[routeSegment] || admissionTabs.dashboard;
}

function AdmissionsPage() {
  const location = useLocation();
  const activeTab = getActiveTab(location.pathname);

  return (
    <ModuleShell
      title="Admissions"
      subtitle="Manage applications, enrollment, and admission workflows."
      activeTab={activeTab.label}
      basePath="/admissions"
    >
      <h3>{activeTab.label}</h3>
      <p>{activeTab.description}</p>
    </ModuleShell>
  );
}

export default AdmissionsPage;

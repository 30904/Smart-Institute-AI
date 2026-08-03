import ModuleShell from "@/layout/ModuleShell";
import { useLocation } from "react-router-dom";
import { getActiveModuleTab } from "@/layout/ModuleSubNav";

const admissionTabs = {
  Dashboard: "Admissions dashboard widgets will be available here.",
  Masters: "Configure admission cycles, intake, categories, eligibility, documents, fees, scholarships, and statuses.",
  Transactions: "Process applications, verification, merit, counseling, approval, and enrollment.",
  Reports: "Review admission summaries, application status, seat availability, merit lists, and conversion."
};

function AdmissionsPage() {
  const location = useLocation();
  const activeTab = getActiveModuleTab(location.pathname);

  return (
    <ModuleShell
      title="Admissions"
      subtitle="Manage applications, enrollment, and admission workflows."
    >
      <h3>{activeTab}</h3>
      <p>{admissionTabs[activeTab] || admissionTabs.Dashboard}</p>
    </ModuleShell>
  );
}

export default AdmissionsPage;

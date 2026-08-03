import { useLocation } from "react-router-dom";

import ModuleShell from "@/layout/ModuleShell";
import { getActiveModuleTab } from "@/layout/ModuleSubNav";

const TAB_COPY = {
  Dashboard: "Manage student lifecycle, records, and services.",
  Masters: "Student master setup will be available here.",
  Transactions: "Student transactions will be available here.",
  Reports: "Student reports will be available here."
};

function StudentsPage() {
  const location = useLocation();
  const activeTab = getActiveModuleTab(location.pathname);

  return (
    <ModuleShell title="Students" subtitle={TAB_COPY[activeTab] || TAB_COPY.Dashboard}>
      <p>{activeTab} content coming soon.</p>
    </ModuleShell>
  );
}

export default StudentsPage;

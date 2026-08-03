import { useLocation } from "react-router-dom";

import ModuleShell from "@/layout/ModuleShell";
import { getActiveModuleTab } from "@/layout/ModuleSubNav";

const TAB_COPY = {
  Dashboard: "Manage fee structures, collections, and receipts.",
  Masters: "Fee master setup will be available here.",
  Transactions: "Fee transactions will be available here.",
  Reports: "Fee reports will be available here."
};

function FeesPage() {
  const location = useLocation();
  const activeTab = getActiveModuleTab(location.pathname);

  return (
    <ModuleShell title="Fees" subtitle={TAB_COPY[activeTab] || TAB_COPY.Dashboard}>
      <p>{activeTab} content coming soon.</p>
    </ModuleShell>
  );
}

export default FeesPage;

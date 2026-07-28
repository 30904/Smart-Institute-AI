import { useEffect, useState } from "react";

import { fetchInstitutionContext } from "@/api/core";

const DEFAULT_CONTEXT = {
  workspaceLabel: "Celeris Technologies Pvt Ltd",
  financialYear: "FY 2025-26",
  location: "Head Office"
};

function TopBar() {
  const [context, setContext] = useState(DEFAULT_CONTEXT);

  useEffect(() => {
    let mounted = true;

    async function loadContext() {
      try {
        const response = await fetchInstitutionContext();
        if (mounted && response?.data) {
          setContext({
            workspaceLabel: response.data.workspaceLabel || DEFAULT_CONTEXT.workspaceLabel,
            financialYear: response.data.financialYear || DEFAULT_CONTEXT.financialYear,
            location: response.data.location || DEFAULT_CONTEXT.location
          });
        }
      } catch {
        // Keep default values if backend context is unavailable.
      }
    }

    loadContext();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <strong>Workspace:</strong>
        <span>{context.workspaceLabel}</span>
      </div>
      <div className="topbar-search">
        <input type="text" placeholder="Search commands, pages, data..." />
      </div>
      <div className="topbar-right">
        <span>{context.financialYear}</span>
        <span>{context.location}</span>
      </div>
    </header>
  );
}

export default TopBar;

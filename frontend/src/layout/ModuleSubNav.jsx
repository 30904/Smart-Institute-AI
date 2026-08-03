import { useMemo } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

import NavIcon from "@/components/NavIcon";

export const MODULE_TABS = ["Dashboard", "Masters", "Transactions", "Reports"];

const MODULE_BASES = ["admissions", "students", "faculty", "academics", "lms", "exams", "fees"];

const MODULE_LABELS = {
  admissions: "Admissions",
  students: "Students",
  faculty: "Faculty",
  academics: "Academics",
  lms: "LMS",
  exams: "Exams",
  fees: "Fees"
};

export function getModuleBaseFromPath(pathname = "") {
  const segment = pathname.split("/").filter(Boolean)[0] || "";
  return MODULE_BASES.includes(segment) ? segment : null;
}

export function getActiveModuleTab(pathname = "") {
  const parts = pathname.split("/").filter(Boolean);
  const section = parts[1] || "dashboard";

  if (section === "dashboard" || parts.length === 1) {
    if (parts[0] === "faculty" || parts[0] === "academics" || parts[0] === "lms" || parts[0] === "exams") {
      // Hub roots historically opened on Masters.
      if (parts.length === 1) return "Masters";
    }
    return "Dashboard";
  }
  if (section === "masters" || section === "settings") return "Masters";
  if (section === "transactions" || section === "attendance") return "Transactions";
  if (section === "reports" || section === "profile") return "Reports";
  return "Dashboard";
}

function getTabPath(moduleBase, tab) {
  return `/${moduleBase}/${tab.toLowerCase()}`;
}

function ModuleSubNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const moduleBase = getModuleBaseFromPath(location.pathname);

  const activeTab = useMemo(() => getActiveModuleTab(location.pathname), [location.pathname]);
  const moduleLabel = moduleBase ? MODULE_LABELS[moduleBase] : "Workspace";

  if (!moduleBase) {
    return null;
  }

  return (
    <div className="module-subnav">
      <div className="module-subnav-left">
        <button
          type="button"
          className="module-subnav-icon-btn is-home"
          aria-label="Go to home dashboard"
          title="Home"
          onClick={() => navigate("/dashboard")}
        >
          <NavIcon name="home" />
        </button>
        <button
          type="button"
          className="module-subnav-icon-btn is-back"
          aria-label="Go back"
          title="Back"
          onClick={() => navigate(-1)}
        >
          <NavIcon name="back" />
        </button>
        <span className="module-subnav-divider" aria-hidden="true" />
        <nav className="module-subnav-tabs" aria-label={`${moduleLabel} sections`}>
          {MODULE_TABS.map((tab) => (
            <NavLink
              key={tab}
              to={getTabPath(moduleBase, tab)}
              className={() => `module-subnav-tab${activeTab === tab ? " active" : ""}`}
            >
              {tab}
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="module-subnav-right">
        <span className="module-subnav-crumb">
          {moduleLabel} — {activeTab}
        </span>
      </div>
    </div>
  );
}

export default ModuleSubNav;

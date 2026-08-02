import { useMemo, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

const moduleMeta = [
  { prefix: "/admissions", title: "Admissions", subtitle: "Process and track student admissions and enquiries." },
  { prefix: "/students", title: "Students", subtitle: "Manage student records, profiles, and academic progress." },
  { prefix: "/faculty", title: "Faculty", subtitle: "Manage faculty profiles, assignments, and academic workload." },
  { prefix: "/academics", title: "Academics", subtitle: "Configure academic programs, schedules, and curriculum." },
  { prefix: "/lms", title: "LMS", subtitle: "Learning management and course content delivery." },
  { prefix: "/exams", title: "Exams", subtitle: "Manage examination schedules, results, and reports." },
  { prefix: "/fees", title: "Fees", subtitle: "Track fee collections, dues, and financial transactions." },
  { prefix: "/settings", title: "Settings", subtitle: "Platform configuration and shared master records." },
  { prefix: "/users", title: "Users", subtitle: "Manage system users, roles, and access permissions." },
  { prefix: "/dashboard", title: "Dashboard", subtitle: "Smart Institute AI module workspace." }
];

function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const currentModule = useMemo(() => {
    const match = moduleMeta.find((item) => location.pathname.startsWith(item.prefix));
    return match || { title: "Dashboard", subtitle: "Smart Institute AI module workspace." };
  }, [location.pathname]);

  return (
    <div className={`erp-layout${collapsed ? " is-collapsed" : ""}`}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((prev) => !prev)} />
      <div className="erp-main">
        <TopBar />
        <section className="module-banner">
          <div>
            <p className="module-label">REFERENCE DATA</p>
            <h1>{currentModule.title}</h1>
            <p>{currentModule.subtitle}</p>
          </div>
          <div className="module-count">
            <strong>7</strong>
            <span>MODULES</span>
          </div>
        </section>
        <section className="module-content">
          <Outlet />
        </section>
      </div>
    </div>
  );
}

export default AppLayout;

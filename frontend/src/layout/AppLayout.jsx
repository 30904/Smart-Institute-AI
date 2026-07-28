import { useMemo, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

const moduleMeta = [
  { prefix: "/admissions", title: "Admissions" },
  { prefix: "/students", title: "Students" },
  { prefix: "/faculty", title: "Faculty" },
  { prefix: "/academics", title: "Academics" },
  { prefix: "/lms", title: "LMS" },
  { prefix: "/exams", title: "Exams" },
  { prefix: "/fees", title: "Fees" },
  { prefix: "/dashboard", title: "Dashboard" }
];

function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const moduleTitle = useMemo(() => {
    const match = moduleMeta.find((item) => location.pathname.startsWith(item.prefix));
    return match ? match.title : "Dashboard";
  }, [location.pathname]);

  return (
    <div className="erp-layout">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((prev) => !prev)} />
      <div className="erp-main">
        <TopBar />
        <section className="module-banner">
          <div>
            <p className="module-label">REFERENCE DATA</p>
            <h1>{moduleTitle}</h1>
            <p>Smart Institute AI module workspace</p>
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

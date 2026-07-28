import { NavLink } from "react-router-dom";
import PropTypes from "prop-types";

import navConfig from "@/config/navConfig";
import usePermission from "@/hooks/usePermission";

function Sidebar({ collapsed, onToggle }) {
  const { hasPermission } = usePermission();
  const moduleNavItems = navConfig.filter((item) => hasPermission(item.module, "view")).sort((a, b) => a.order - b.order);

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        <div>
          <h2>Smart Institute AI</h2>
          {!collapsed ? <p>ERP Platform</p> : null}
        </div>
        <button type="button" onClick={onToggle} className="sidebar-toggle">
          {collapsed ? ">" : "<"}
        </button>
      </div>

      <nav className="sidebar-nav">
        {moduleNavItems.map((item) => (
          <NavLink key={item.path} to={item.path} className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            <span className="nav-dot">{collapsed ? item.icon : ""}</span>
            {!collapsed ? item.label : null}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

Sidebar.propTypes = {
  collapsed: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired
};

export default Sidebar;

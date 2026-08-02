import PropTypes from "prop-types";
import { NavLink } from "react-router-dom";

import NavIcon from "@/components/NavIcon";
import navConfig, { platformNavConfig } from "@/config/navConfig";
import usePermission from "@/hooks/usePermission";

function Sidebar({ collapsed, onToggle }) {
  const { hasPermission } = usePermission();

  const moduleNavItems = navConfig
    .filter((item) => hasPermission(item.module, "view"))
    .sort((a, b) => a.order - b.order);

  const platformItems = platformNavConfig
    .filter((item) => hasPermission(item.module, "view"))
    .sort((a, b) => a.order - b.order);

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-brand-row">
        <div className="sidebar-brand">
          <span className="sidebar-brand-mark">
            <NavIcon name="brand" />
          </span>
          {!collapsed ? (
            <div className="sidebar-brand-text">
              <strong>Celeris</strong>
              <span>ERP PLATFORM</span>
            </div>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="sidebar-toggle"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? ">" : "<"}
        </button>
      </div>

      <nav className="sidebar-nav" aria-label="Primary modules">
        {moduleNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
            title={item.label}
          >
            <span className="nav-link-icon">
              <NavIcon name={item.icon} />
            </span>
            {!collapsed ? <span className="nav-link-label">{item.label}</span> : null}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        {!collapsed ? <p className="sidebar-section-label">PLATFORM</p> : null}
        <div className="sidebar-platform-links">
          {platformItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `sidebar-platform-link${isActive ? " active" : ""}`}
              title={item.label}
              aria-label={item.label}
            >
              <NavIcon name={item.icon} />
            </NavLink>
          ))}
        </div>
      </div>
    </aside>
  );
}

Sidebar.propTypes = {
  collapsed: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired
};

export default Sidebar;

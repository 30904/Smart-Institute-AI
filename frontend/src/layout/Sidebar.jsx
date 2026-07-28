import { NavLink } from "react-router-dom";
import PropTypes from "prop-types";

const moduleNavItems = [
  { label: "Admissions", path: "/admissions" },
  { label: "Students", path: "/students" },
  { label: "Faculty", path: "/faculty" },
  { label: "Academics", path: "/academics" },
  { label: "LMS", path: "/lms" },
  { label: "Exams", path: "/exams" },
  { label: "Fees", path: "/fees" }
];

function Sidebar({ collapsed, onToggle }) {
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
            <span className="nav-dot" />
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

import PropTypes from "prop-types";
import { NavLink } from "react-router-dom";

const tabs = ["Dashboard", "Masters", "Transactions", "Reports"];


function getTabPath(basePath, tab) {
  return `${basePath}/${tab.toLowerCase()}`;
}

function ModuleShell({ title, subtitle, activeTab = "Dashboard", basePath, children }) {

function ModuleShell({ title, activeTab = "Dashboard", onTabChange, children }) {
  return (
    <main className="app-shell">
      <nav className="module-tabs" aria-label={`${title} tabs`}>

        {tabs.map((tab) =>
          basePath ? (
            <NavLink
              key={tab}
              to={getTabPath(basePath, tab)}
              className={`module-tab ${tab === activeTab ? "active" : ""}`}
            >
              {tab}
            </NavLink>
          ) : (
            <button key={tab} type="button" className={`module-tab ${tab === activeTab ? "active" : ""}`}>
              {tab}
            </button>
          )
        )}

        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            className={`module-tab ${tab === activeTab ? "active" : ""}`}
            onClick={() => onTabChange?.(tab)}
          >
            {tab}
          </button>
        ))}

      </nav>

      <section className="module-panel">{children}</section>
    </main>
  );
}

ModuleShell.propTypes = {
  title: PropTypes.string.isRequired,
  activeTab: PropTypes.oneOf(tabs),

  basePath: PropTypes.string,

  onTabChange: PropTypes.func,

  children: PropTypes.node.isRequired
};

export default ModuleShell;

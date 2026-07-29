import PropTypes from "prop-types";
import { NavLink } from "react-router-dom";

const tabs = ["Dashboard", "Masters", "Transactions", "Reports"];

function getTabPath(basePath, tab) {
  return `${basePath}/${tab.toLowerCase()}`;
}

function ModuleShell({ title, subtitle, activeTab = "Dashboard", basePath, children }) {
  return (
    <main className="app-shell">
      <header className="module-shell-header">
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </header>

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
      </nav>

      <section className="module-panel">{children}</section>
    </main>
  );
}

ModuleShell.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  activeTab: PropTypes.oneOf(tabs),
  basePath: PropTypes.string,
  children: PropTypes.node.isRequired
};

export default ModuleShell;

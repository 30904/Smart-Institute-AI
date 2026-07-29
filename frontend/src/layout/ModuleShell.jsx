import PropTypes from "prop-types";

const tabs = ["Dashboard", "Masters", "Transactions", "Reports"];

function ModuleShell({ title, activeTab = "Dashboard", onTabChange, children }) {
  return (
    <main className="app-shell">
      <nav className="module-tabs" aria-label={`${title} tabs`}>
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
  onTabChange: PropTypes.func,
  children: PropTypes.node.isRequired
};

export default ModuleShell;

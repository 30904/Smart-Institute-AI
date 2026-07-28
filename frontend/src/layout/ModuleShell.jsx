import PropTypes from "prop-types";

const tabs = ["Dashboard", "Masters", "Transactions", "Reports"];

function ModuleShell({ title, subtitle, activeTab = "Dashboard", children }) {
  return (
    <main className="app-shell">
      <header className="module-shell-header">
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </header>

      <nav className="module-tabs" aria-label={`${title} tabs`}>
        {tabs.map((tab) => (
          <button key={tab} type="button" className={`module-tab ${tab === activeTab ? "active" : ""}`}>
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
  subtitle: PropTypes.string.isRequired,
  activeTab: PropTypes.oneOf(tabs),
  children: PropTypes.node.isRequired
};

export default ModuleShell;

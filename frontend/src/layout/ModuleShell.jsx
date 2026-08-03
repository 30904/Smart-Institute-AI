import PropTypes from "prop-types";

function ModuleShell({ title, subtitle = "", children }) {
  return (
    <main className="app-shell">
      {(title || subtitle) && (
        <header className="module-shell-header">
          {title ? <h2>{title}</h2> : null}
          {subtitle ? <p>{subtitle}</p> : null}
        </header>
      )}
      <section className="module-panel">{children}</section>
    </main>
  );
}

ModuleShell.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  children: PropTypes.node.isRequired
};

export default ModuleShell;

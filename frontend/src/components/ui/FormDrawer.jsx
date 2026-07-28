import PropTypes from "prop-types";

function FormDrawer({ title, open, onClose, children }) {
  if (!open) {
    return null;
  }

  return (
    <div className="ui-drawer-overlay" role="presentation" onClick={onClose}>
      <aside
        className="ui-drawer"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="ui-drawer-header">
          <h3>{title}</h3>
          <button type="button" onClick={onClose}>
            Close
          </button>
        </header>
        <div className="ui-drawer-body">{children}</div>
      </aside>
    </div>
  );
}

FormDrawer.propTypes = {
  title: PropTypes.string.isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired
};

export default FormDrawer;

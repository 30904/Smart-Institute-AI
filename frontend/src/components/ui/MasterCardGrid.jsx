import PropTypes from "prop-types";

function MasterCardGrid({ items }) {
  return (
    <section className="ui-master-grid">
      {items.map((item) => (
        <article key={item.key} className="ui-master-card">
          <div className="ui-master-card-icon">{item.icon || "[]"} </div>
          <h4>{item.title}</h4>
          <p>{item.description}</p>
          {item.action ? <div className="ui-master-card-action">{item.action}</div> : null}
        </article>
      ))}
    </section>
  );
}

MasterCardGrid.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      icon: PropTypes.node,
      action: PropTypes.node
    })
  ).isRequired
};

export default MasterCardGrid;

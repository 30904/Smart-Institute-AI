import PropTypes from "prop-types";
import { NavLink } from "react-router-dom";

function MasterCardContent({ item }) {
  return (
    <>
      <div className="ui-master-card-icon">{item.icon || "[]"}</div>
      <h4>{item.title}</h4>
      <p>{item.description}</p>
      {item.action ? <div className="ui-master-card-action">{item.action}</div> : null}
    </>
  );
}

MasterCardContent.propTypes = {
  item: PropTypes.shape({
    icon: PropTypes.node,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    action: PropTypes.node
  }).isRequired
};

function MasterCardGrid({ items }) {
  return (
    <section className="ui-master-grid">
      {items.map((item) => {
        const cardClassName = ["ui-master-card", item.accentClass].filter(Boolean).join(" ");

        if (item.to) {
          return (
            <NavLink key={item.key} to={item.to} className={`ui-master-card-link ${cardClassName}`}>
              <MasterCardContent item={item} />
            </NavLink>
          );
        }

        return (
          <article key={item.key} className={cardClassName}>
            <MasterCardContent item={item} />
          </article>
        );
      })}
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
      action: PropTypes.node,
      to: PropTypes.string,
      accentClass: PropTypes.string
    })
  ).isRequired
};

export default MasterCardGrid;

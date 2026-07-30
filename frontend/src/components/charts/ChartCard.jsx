import PropTypes from "prop-types";

function ChartCard({ title, subtitle, children, height = 320 }) {
  return (
    <section
      style={{
        background: "#fff",
        border: "1px solid #e2e8f0",
        padding: "1rem"
      }}
    >
      <header style={{ marginBottom: "0.75rem" }}>
        <h3 style={{ margin: 0, fontSize: "1rem", color: "#0f172a" }}>{title}</h3>
        {subtitle ? (
          <p style={{ margin: "0.25rem 0 0", fontSize: "0.875rem", color: "#64748b" }}>{subtitle}</p>
        ) : null}
      </header>
      <div style={{ width: "100%", height }}>{children}</div>
    </section>
  );
}

ChartCard.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  children: PropTypes.node.isRequired,
  height: PropTypes.number
};

export default ChartCard;

import PropTypes from "prop-types";

const toneMap = {
  success: "ui-badge-success",
  warning: "ui-badge-warning",
  danger: "ui-badge-danger",
  info: "ui-badge-info",
  neutral: "ui-badge-neutral"
};

function StatusBadge({ label, tone = "neutral" }) {
  const className = toneMap[tone] || toneMap.neutral;
  return <span className={`ui-status-badge ${className}`}>{label}</span>;
}

StatusBadge.propTypes = {
  label: PropTypes.string.isRequired,
  tone: PropTypes.oneOf(["success", "warning", "danger", "info", "neutral"])
};

export default StatusBadge;

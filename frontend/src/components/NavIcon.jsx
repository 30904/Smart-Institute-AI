import PropTypes from "prop-types";

const strokeProps = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round",
  strokeLinejoin: "round"
};

function IconShell({ children }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
      {children}
    </svg>
  );
}

IconShell.propTypes = {
  children: PropTypes.node.isRequired
};

const icons = {
  admissions: (
    <IconShell>
      <path {...strokeProps} d="M8 7h8M8 12h8M8 17h5" />
      <rect {...strokeProps} x="4" y="3" width="16" height="18" rx="0" />
    </IconShell>
  ),
  students: (
    <IconShell>
      <circle {...strokeProps} cx="12" cy="8" r="3.25" />
      <path {...strokeProps} d="M5.5 19.5c1.4-3 3.8-4.5 6.5-4.5s5.1 1.5 6.5 4.5" />
    </IconShell>
  ),
  faculty: (
    <IconShell>
      <circle {...strokeProps} cx="9" cy="8" r="2.75" />
      <circle {...strokeProps} cx="16.5" cy="9" r="2.25" />
      <path {...strokeProps} d="M3.8 18.5c1.2-2.6 3.2-3.9 5.2-3.9 1.3 0 2.5.5 3.5 1.4" />
      <path {...strokeProps} d="M13.2 18.5c.7-1.4 1.9-2.2 3.3-2.2 1.3 0 2.4.6 3.2 1.7" />
    </IconShell>
  ),
  academics: (
    <IconShell>
      <path {...strokeProps} d="M3 9.5 12 5l9 4.5-9 4.5L3 9.5Z" />
      <path {...strokeProps} d="M7 12.2v4.1c0 .8 2.2 2.2 5 2.2s5-1.4 5-2.2v-4.1" />
      <path {...strokeProps} d="M21 10.2v5.3" />
    </IconShell>
  ),
  lms: (
    <IconShell>
      <rect {...strokeProps} x="3.5" y="5" width="17" height="12" />
      <path {...strokeProps} d="M8 20h8M12 17v3" />
    </IconShell>
  ),
  exams: (
    <IconShell>
      <path {...strokeProps} d="M8 4h8v3H8z" />
      <rect {...strokeProps} x="5" y="7" width="14" height="13" />
      <path {...strokeProps} d="M9 12h6M9 15.5h4" />
    </IconShell>
  ),
  fees: (
    <IconShell>
      <circle {...strokeProps} cx="12" cy="12" r="8" />
      <path {...strokeProps} d="M12 8v8M9.5 10.2c.6-.8 1.5-1.2 2.5-1.2 1.6 0 2.7.8 2.7 2 0 1.1-.8 1.7-2.5 2.1-1.7.4-2.5 1-2.5 2.1 0 1.2 1.1 2 2.8 2 1.1 0 2-.4 2.6-1.2" />
    </IconShell>
  ),
  settings: (
    <IconShell>
      <circle {...strokeProps} cx="12" cy="12" r="3" />
      <path
        {...strokeProps}
        d="M12 3.5v2.2M12 18.3v2.2M4.9 6.5l1.6 1.6M17.5 15.9l1.6 1.6M3.5 12h2.2M18.3 12h2.2M4.9 17.5l1.6-1.6M17.5 8.1l1.6-1.6"
      />
    </IconShell>
  ),
  users: (
    <IconShell>
      <circle {...strokeProps} cx="9" cy="9" r="2.75" />
      <circle {...strokeProps} cx="16" cy="10" r="2.25" />
      <path {...strokeProps} d="M4 18.5c1.1-2.5 2.9-3.8 5-3.8 1.3 0 2.5.5 3.5 1.4" />
      <path {...strokeProps} d="M13.2 18.5c.6-1.2 1.7-1.9 3-1.9 1.2 0 2.2.5 2.9 1.4" />
    </IconShell>
  ),
  dashboard: (
    <IconShell>
      <rect {...strokeProps} x="3.5" y="3.5" width="7" height="7" />
      <rect {...strokeProps} x="13.5" y="3.5" width="7" height="7" />
      <rect {...strokeProps} x="3.5" y="13.5" width="7" height="7" />
      <rect {...strokeProps} x="13.5" y="13.5" width="7" height="7" />
    </IconShell>
  ),
  monitor: (
    <IconShell>
      <rect {...strokeProps} x="3.5" y="4.5" width="17" height="11" />
      <path {...strokeProps} d="M8 19h8M12 15.5V19" />
    </IconShell>
  ),
  shield: (
    <IconShell>
      <path {...strokeProps} d="M12 3.5 19 6.2v5.1c0 4.1-2.8 7.5-7 8.7-4.2-1.2-7-4.6-7-8.7V6.2L12 3.5Z" />
      <path {...strokeProps} d="M9.5 12.2 11.2 14l3.5-3.8" />
    </IconShell>
  ),
  brand: (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
      <rect x="4" y="13" width="3.5" height="6" fill="currentColor" />
      <rect x="10.25" y="9" width="3.5" height="10" fill="currentColor" />
      <rect x="16.5" y="5" width="3.5" height="14" fill="currentColor" />
    </svg>
  ),
  panelToggle: (
    <IconShell>
      <path {...strokeProps} d="M14.5 6.5 9 12l5.5 5.5" />
    </IconShell>
  )
};

function NavIcon({ name }) {
  return icons[name] || icons.dashboard;
}

NavIcon.propTypes = {
  name: PropTypes.string.isRequired
};

export default NavIcon;

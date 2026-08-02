import { useEffect, useMemo, useRef, useState } from "react";

import { fetchInstitutionContext } from "@/api/core";
import NavIcon from "@/components/NavIcon";
import usePermission from "@/hooks/usePermission";

const DEFAULT_CONTEXT = {
  workspaceLabel: "Celeris Technologies Pvt Ltd",
  financialYear: "FY 2025-26",
  location: "Head Office"
};

function getInitials(name = "") {
  const parts = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return "SA";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function formatRoleLabel(role = "") {
  const normalized = String(role).trim().toLowerCase();
  if (!normalized) return "User";
  if (normalized === "super_admin") return "Administrator";
  if (normalized === "institution_admin") return "Institution Admin";
  return normalized
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function TopBar() {
  const { user } = usePermission();
  const searchRef = useRef(null);
  const [context, setContext] = useState(DEFAULT_CONTEXT);

  const displayName = user?.name || "System Admin";
  const roleLabel = formatRoleLabel(user?.role);
  const initials = useMemo(() => getInitials(displayName), [displayName]);

  useEffect(() => {
    let mounted = true;

    async function loadContext() {
      try {
        const response = await fetchInstitutionContext();
        if (mounted && response?.data) {
          setContext({
            workspaceLabel: response.data.workspaceLabel || DEFAULT_CONTEXT.workspaceLabel,
            financialYear: response.data.financialYear || DEFAULT_CONTEXT.financialYear,
            location: response.data.location || DEFAULT_CONTEXT.location
          });
        }
      } catch {
        // Keep default values if backend context is unavailable.
      }
    }

    loadContext();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    function handleShortcut(event) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }
    }

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <span className="topbar-workspace-label">WORKSPACE</span>
        <strong className="topbar-workspace-name">{context.workspaceLabel}</strong>
      </div>

      <div className="topbar-search">
        <span className="topbar-search-icon" aria-hidden="true">
          <NavIcon name="search" />
        </span>
        <input
          ref={searchRef}
          type="search"
          placeholder="Search commands, pages, data..."
          aria-label="Search commands, pages, data"
        />
        <kbd className="topbar-search-shortcut">Ctrl+K</kbd>
      </div>

      <div className="topbar-right">
        <button type="button" className="topbar-chip" title="Financial year">
          <span>{context.financialYear}</span>
          <NavIcon name="chevronDown" />
        </button>
        <button type="button" className="topbar-chip" title="Location">
          <span>{context.location}</span>
          <NavIcon name="chevronDown" />
        </button>

        <div className="topbar-icon-group">
          <button type="button" className="topbar-icon-btn" aria-label="Toggle theme" title="Theme">
            <NavIcon name="moon" />
          </button>
          <button type="button" className="topbar-icon-btn" aria-label="Apps" title="Apps">
            <NavIcon name="apps" />
          </button>
          <button type="button" className="topbar-icon-btn has-badge" aria-label="Notifications" title="Notifications">
            <NavIcon name="bell" />
            <span className="topbar-badge">3</span>
          </button>
        </div>

        <div className="topbar-profile">
          <span className="topbar-avatar" aria-hidden="true">
            {initials}
          </span>
          <div className="topbar-profile-text">
            <strong>{displayName}</strong>
            <span>{roleLabel}</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default TopBar;

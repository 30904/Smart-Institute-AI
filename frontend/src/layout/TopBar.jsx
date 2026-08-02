import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

import {
  fetchAcademicYears,
  fetchAdmissionApplications,
  fetchInstitutionContext,
  updateInstitutionProfile
} from "@/api/core";
import NavIcon from "@/components/NavIcon";
import navConfig, { platformNavConfig } from "@/config/navConfig";
import usePermission from "@/hooks/usePermission";

const DEFAULT_CONTEXT = {
  workspaceLabel: "Celeris Technologies Pvt Ltd",
  financialYear: "FY 2025-26",
  location: "Head Office",
  default_academic_year_id: null
};

const LOCATION_OPTIONS = ["Head Office", "Main Campus", "North Campus", "South Campus", "Regional Office"];
const THEME_STORAGE_KEY = "smart-institute-theme";

function getInitials(name = "") {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
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

function getStoredTheme() {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  return stored === "dark" ? "dark" : "light";
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem(THEME_STORAGE_KEY, theme);
}

function buildSearchCatalog(hasPermission) {
  const moduleItems = navConfig
    .filter((item) => hasPermission(item.module, "view"))
    .map((item) => ({
      id: `module-${item.module}`,
      label: item.label,
      path: item.path,
      group: "Modules",
      icon: item.icon
    }));

  const platformItems = platformNavConfig
    .filter((item) => hasPermission(item.module, "view"))
    .map((item) => ({
      id: `platform-${item.module}`,
      label: item.label,
      path: item.path,
      group: "Platform",
      icon: item.icon
    }));

  const admissionItems = hasPermission("admissions", "view")
    ? [
        { id: "adm-dashboard", label: "Admissions Dashboard", path: "/admissions/dashboard", group: "Admissions", icon: "admissions" },
        { id: "adm-masters", label: "Admissions Masters", path: "/admissions/masters", group: "Admissions", icon: "admissions" },
        { id: "adm-transactions", label: "Admission Applications", path: "/admissions/transactions", group: "Admissions", icon: "admissions" },
        { id: "adm-reports", label: "Admissions Reports", path: "/admissions/reports", group: "Admissions", icon: "admissions" },
        { id: "adm-counseling", label: "Counseling Allocation", path: "/admissions/transactions/counseling", group: "Admissions", icon: "admissions" }
      ]
    : [];

  const settingsItems = hasPermission("settings", "view")
    ? [
        { id: "set-shared", label: "Shared Masters", path: "/settings/shared-masters", group: "Settings", icon: "settings" },
        { id: "set-institution", label: "Institution Settings", path: "/settings/institution", group: "Settings", icon: "settings" },
        { id: "set-ay", label: "Academic Years", path: "/settings/academic-years", group: "Settings", icon: "settings" },
        { id: "set-dept", label: "Departments", path: "/settings/departments", group: "Settings", icon: "settings" },
        { id: "set-programs", label: "Programs / Courses", path: "/settings/programs", group: "Settings", icon: "settings" }
      ]
    : [];

  return [...moduleItems, ...admissionItems, ...settingsItems, ...platformItems];
}

function TopBarMenu({ open, align = "right", children }) {
  if (!open) return null;
  return <div className={`topbar-menu topbar-menu-${align}`}>{children}</div>;
}

TopBarMenu.propTypes = {
  open: PropTypes.bool,
  align: PropTypes.oneOf(["left", "right"]),
  children: PropTypes.node
};

function TopBar() {
  const navigate = useNavigate();
  const { user, hasPermission, refreshSession } = usePermission();
  const searchRef = useRef(null);
  const barRef = useRef(null);

  const [context, setContext] = useState(DEFAULT_CONTEXT);
  const [academicYears, setAcademicYears] = useState([]);
  const [theme, setTheme] = useState(getStoredTheme);
  const [openMenu, setOpenMenu] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeSearchIndex, setActiveSearchIndex] = useState(0);
  const [savingContext, setSavingContext] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [contextError, setContextError] = useState("");

  const displayName = user?.name || "System Admin";
  const roleLabel = formatRoleLabel(user?.role);
  const initials = useMemo(() => getInitials(displayName), [displayName]);
  const canEditSettings = hasPermission("settings", "edit");
  const canViewAdmissions = hasPermission("admissions", "view");

  const searchCatalog = useMemo(() => buildSearchCatalog(hasPermission), [hasPermission]);
  const filteredSearch = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return searchCatalog.slice(0, 8);
    return searchCatalog
      .filter((item) => `${item.label} ${item.group} ${item.path}`.toLowerCase().includes(query))
      .slice(0, 10);
  }, [searchCatalog, searchQuery]);

  const locationOptions = useMemo(() => {
    const values = new Set(LOCATION_OPTIONS);
    if (context.location) values.add(context.location);
    return [...values];
  }, [context.location]);

  const appItems = useMemo(
    () =>
      [...navConfig, ...platformNavConfig]
        .filter((item) => hasPermission(item.module, "view"))
        .sort((a, b) => a.order - b.order),
    [hasPermission]
  );

  const loadContext = useCallback(async () => {
    try {
      const [contextRes, yearsRes] = await Promise.all([
        fetchInstitutionContext(),
        fetchAcademicYears().catch(() => ({ data: [] }))
      ]);
      const years = Array.isArray(yearsRes?.data) ? yearsRes.data : [];
      setAcademicYears(years);
      if (contextRes?.data) {
        setContext({
          workspaceLabel: contextRes.data.workspaceLabel || DEFAULT_CONTEXT.workspaceLabel,
          financialYear: contextRes.data.financialYear || DEFAULT_CONTEXT.financialYear,
          location: contextRes.data.location || DEFAULT_CONTEXT.location,
          default_academic_year_id: contextRes.data.default_academic_year_id || null
        });
      }
      setContextError("");
    } catch {
      setContextError("Unable to load workspace context.");
    }
  }, []);

  const loadNotifications = useCallback(async () => {
    if (!canViewAdmissions) {
      setNotifications([
        {
          id: "welcome",
          title: "Welcome to Smart Institute AI",
          detail: "Use Ctrl+K to search modules and pages.",
          path: "/dashboard"
        }
      ]);
      return;
    }

    try {
      const [docsPending, feePending, applied] = await Promise.all([
        fetchAdmissionApplications({ status: "docs_pending" }),
        fetchAdmissionApplications({ status: "fee_pending" }),
        fetchAdmissionApplications({ status: "applied" })
      ]);
      const docsCount = Array.isArray(docsPending?.data) ? docsPending.data.length : 0;
      const feeCount = Array.isArray(feePending?.data) ? feePending.data.length : 0;
      const appliedCount = Array.isArray(applied?.data) ? applied.data.length : 0;
      const items = [];

      if (docsCount) {
        items.push({
          id: "docs-pending",
          title: `${docsCount} application${docsCount === 1 ? "" : "s"} awaiting document verification`,
          detail: "Review pending documents in Admissions Transactions.",
          path: "/admissions/transactions"
        });
      }
      if (feeCount) {
        items.push({
          id: "fee-pending",
          title: `${feeCount} application${feeCount === 1 ? "" : "s"} with fee pending`,
          detail: "Confirm admission fees to continue enrollment.",
          path: "/admissions/transactions"
        });
      }
      if (appliedCount) {
        items.push({
          id: "applied",
          title: `${appliedCount} newly applied application${appliedCount === 1 ? "" : "s"}`,
          detail: "Open applications to continue the admission workflow.",
          path: "/admissions/transactions"
        });
      }
      if (!items.length) {
        items.push({
          id: "all-clear",
          title: "No pending admission alerts",
          detail: "Admissions queue looks clear right now.",
          path: "/admissions/dashboard"
        });
      }
      setNotifications(items);
    } catch {
      setNotifications([
        {
          id: "fallback",
          title: "Unable to refresh alerts",
          detail: "Open Admissions Dashboard to review current status.",
          path: "/admissions/dashboard"
        }
      ]);
    }
  }, [canViewAdmissions]);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    loadContext();
    loadNotifications();
  }, [loadContext, loadNotifications]);

  useEffect(() => {
    function handlePointerDown(event) {
      if (!barRef.current?.contains(event.target)) {
        setOpenMenu(null);
        setSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  useEffect(() => {
    function handleShortcut(event) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpenMenu(null);
        setSearchOpen(true);
        searchRef.current?.focus();
        searchRef.current?.select();
      }
      if (event.key === "Escape") {
        setOpenMenu(null);
        setSearchOpen(false);
      }
    }
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  useEffect(() => {
    setActiveSearchIndex(0);
  }, [searchQuery, searchOpen]);

  function toggleMenu(menuName) {
    setSearchOpen(false);
    setOpenMenu((current) => (current === menuName ? null : menuName));
  }

  function goTo(path) {
    setOpenMenu(null);
    setSearchOpen(false);
    setSearchQuery("");
    navigate(path);
  }

  async function handleSelectAcademicYear(year) {
    if (!canEditSettings || savingContext) return;
    try {
      setSavingContext(true);
      setContextError("");
      const response = await updateInstitutionProfile({
        default_academic_year_id: year.id
      });
      setContext((prev) => ({
        ...prev,
        default_academic_year_id: response?.data?.default_academic_year_id || year.id,
        financialYear: response?.data?.financialYear || year.name || prev.financialYear
      }));
      setOpenMenu(null);
    } catch (apiError) {
      setContextError(apiError?.response?.data?.message || "Failed to update financial year.");
    } finally {
      setSavingContext(false);
    }
  }

  async function handleSelectLocation(location) {
    if (!canEditSettings || savingContext || location === context.location) {
      setOpenMenu(null);
      return;
    }
    try {
      setSavingContext(true);
      setContextError("");
      const response = await updateInstitutionProfile({ location });
      setContext((prev) => ({
        ...prev,
        location: response?.data?.location || location
      }));
      setOpenMenu(null);
    } catch (apiError) {
      setContextError(apiError?.response?.data?.message || "Failed to update location.");
    } finally {
      setSavingContext(false);
    }
  }

  function handleToggleTheme() {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  }

  async function handleLogout() {
    localStorage.removeItem("authToken");
    await refreshSession();
    navigate("/login", { replace: true });
  }

  function handleSearchKeyDown(event) {
    if (!filteredSearch.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSearchOpen(true);
      setActiveSearchIndex((index) => (index + 1) % filteredSearch.length);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setSearchOpen(true);
      setActiveSearchIndex((index) => (index - 1 + filteredSearch.length) % filteredSearch.length);
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const selected = filteredSearch[activeSearchIndex] || filteredSearch[0];
      if (selected) goTo(selected.path);
    }
  }

  return (
    <header className="topbar" ref={barRef}>
      <div className="topbar-left">
        <span className="topbar-workspace-label">WORKSPACE</span>
        <strong className="topbar-workspace-name">{context.workspaceLabel}</strong>
        {contextError ? <span className="topbar-context-error">{contextError}</span> : null}
      </div>

      <div className={`topbar-search${searchOpen ? " is-open" : ""}`}>
        <span className="topbar-search-icon" aria-hidden="true">
          <NavIcon name="search" />
        </span>
        <input
          ref={searchRef}
          type="search"
          value={searchQuery}
          placeholder="Search commands, pages, data..."
          aria-label="Search commands, pages, data"
          aria-expanded={searchOpen}
          aria-controls="topbar-search-results"
          onFocus={() => setSearchOpen(true)}
          onChange={(event) => {
            setSearchQuery(event.target.value);
            setSearchOpen(true);
            setOpenMenu(null);
          }}
          onKeyDown={handleSearchKeyDown}
        />
        <kbd className="topbar-search-shortcut">Ctrl+K</kbd>
        {searchOpen ? (
          <div id="topbar-search-results" className="topbar-menu topbar-search-results" role="listbox">
            {filteredSearch.length ? (
              filteredSearch.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  role="option"
                  aria-selected={index === activeSearchIndex}
                  className={`topbar-menu-item${index === activeSearchIndex ? " is-active" : ""}`}
                  onMouseEnter={() => setActiveSearchIndex(index)}
                  onClick={() => goTo(item.path)}
                >
                  <span className="topbar-menu-item-icon">
                    <NavIcon name={item.icon} />
                  </span>
                  <span className="topbar-menu-item-text">
                    <strong>{item.label}</strong>
                    <span>{item.group}</span>
                  </span>
                </button>
              ))
            ) : (
              <p className="topbar-menu-empty">No matching pages found.</p>
            )}
          </div>
        ) : null}
      </div>

      <div className="topbar-right">
        <div className="topbar-control">
          <button
            type="button"
            className={`topbar-chip${openMenu === "fy" ? " is-open" : ""}`}
            title="Financial year"
            aria-haspopup="menu"
            aria-expanded={openMenu === "fy"}
            onClick={() => toggleMenu("fy")}
            disabled={savingContext}
          >
            <span>{context.financialYear}</span>
            <NavIcon name="chevronDown" />
          </button>
          <TopBarMenu open={openMenu === "fy"}>
            {academicYears.length ? (
              academicYears.map((year) => (
                <button
                  key={year.id}
                  type="button"
                  className={`topbar-menu-item${
                    year.id === context.default_academic_year_id || year.name === context.financialYear ? " is-selected" : ""
                  }`}
                  disabled={!canEditSettings || savingContext}
                  onClick={() => handleSelectAcademicYear(year)}
                >
                  <span className="topbar-menu-item-text">
                    <strong>{year.name}</strong>
                    <span>{year.code}{year.is_current ? " · Current" : ""}</span>
                  </span>
                </button>
              ))
            ) : (
              <p className="topbar-menu-empty">No academic years available.</p>
            )}
            {!canEditSettings ? <p className="topbar-menu-hint">You need settings edit permission to change FY.</p> : null}
          </TopBarMenu>
        </div>

        <div className="topbar-control">
          <button
            type="button"
            className={`topbar-chip${openMenu === "location" ? " is-open" : ""}`}
            title="Location"
            aria-haspopup="menu"
            aria-expanded={openMenu === "location"}
            onClick={() => toggleMenu("location")}
            disabled={savingContext}
          >
            <span>{context.location}</span>
            <NavIcon name="chevronDown" />
          </button>
          <TopBarMenu open={openMenu === "location"}>
            {locationOptions.map((location) => (
              <button
                key={location}
                type="button"
                className={`topbar-menu-item${location === context.location ? " is-selected" : ""}`}
                disabled={!canEditSettings || savingContext}
                onClick={() => handleSelectLocation(location)}
              >
                {location}
              </button>
            ))}
            {!canEditSettings ? <p className="topbar-menu-hint">You need settings edit permission to change location.</p> : null}
          </TopBarMenu>
        </div>

        <div className="topbar-icon-group">
          <button
            type="button"
            className="topbar-icon-btn"
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            title={theme === "dark" ? "Light mode" : "Dark mode"}
            onClick={handleToggleTheme}
          >
            <NavIcon name="moon" />
          </button>

          <div className="topbar-control">
            <button
              type="button"
              className={`topbar-icon-btn${openMenu === "apps" ? " is-open" : ""}`}
              aria-label="Apps"
              title="Apps"
              aria-haspopup="menu"
              aria-expanded={openMenu === "apps"}
              onClick={() => toggleMenu("apps")}
            >
              <NavIcon name="apps" />
            </button>
            <TopBarMenu open={openMenu === "apps"} align="right">
              <div className="topbar-apps-grid">
                {appItems.map((item) => (
                  <button key={item.path} type="button" className="topbar-app-tile" onClick={() => goTo(item.path)}>
                    <span className="topbar-app-tile-icon">
                      <NavIcon name={item.icon} />
                    </span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </TopBarMenu>
          </div>

          <div className="topbar-control">
            <button
              type="button"
              className={`topbar-icon-btn has-badge${openMenu === "notifications" ? " is-open" : ""}`}
              aria-label="Notifications"
              title="Notifications"
              aria-haspopup="menu"
              aria-expanded={openMenu === "notifications"}
              onClick={() => {
                toggleMenu("notifications");
                loadNotifications();
              }}
            >
              <NavIcon name="bell" />
              <span className="topbar-badge">{Math.min(notifications.length, 9)}</span>
            </button>
            <TopBarMenu open={openMenu === "notifications"} align="right">
              <div className="topbar-menu-heading">Notifications</div>
              {notifications.map((item) => (
                <button key={item.id} type="button" className="topbar-menu-item" onClick={() => goTo(item.path)}>
                  <span className="topbar-menu-item-text">
                    <strong>{item.title}</strong>
                    <span>{item.detail}</span>
                  </span>
                </button>
              ))}
            </TopBarMenu>
          </div>
        </div>

        <div className="topbar-control">
          <button
            type="button"
            className={`topbar-profile${openMenu === "profile" ? " is-open" : ""}`}
            aria-haspopup="menu"
            aria-expanded={openMenu === "profile"}
            onClick={() => toggleMenu("profile")}
          >
            <span className="topbar-avatar" aria-hidden="true">
              {initials}
            </span>
            <div className="topbar-profile-text">
              <strong>{displayName}</strong>
              <span>{roleLabel}</span>
            </div>
            <span className="topbar-profile-caret">
              <NavIcon name="chevronDown" />
            </span>
          </button>
          <TopBarMenu open={openMenu === "profile"} align="right">
            {hasPermission("settings", "view") ? (
              <button type="button" className="topbar-menu-item" onClick={() => goTo("/settings/institution")}>
                Institution Settings
              </button>
            ) : null}
            {hasPermission("users", "view") ? (
              <button type="button" className="topbar-menu-item" onClick={() => goTo("/users")}>
                Manage Users
              </button>
            ) : null}
            <button type="button" className="topbar-menu-item" onClick={() => goTo("/dashboard")}>
              Dashboard
            </button>
            <button type="button" className="topbar-menu-item is-danger" onClick={handleLogout}>
              Logout
            </button>
          </TopBarMenu>
        </div>
      </div>
    </header>
  );
}

export default TopBar;

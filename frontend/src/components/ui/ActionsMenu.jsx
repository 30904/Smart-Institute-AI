import PropTypes from "prop-types";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

function ActionsMenu({ items = [], ariaLabel = "Row actions" }) {
  const menuId = useId();
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const visibleItems = items.filter((item) => item && !item.hidden);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;

    function updatePosition() {
      const rect = triggerRef.current.getBoundingClientRect();
      const menuWidth = menuRef.current?.offsetWidth || 168;
      const menuHeight = menuRef.current?.offsetHeight || visibleItems.length * 36 + 8;
      const gap = 4;
      const viewportPadding = 8;

      let left = rect.right - menuWidth;
      left = Math.max(viewportPadding, Math.min(left, window.innerWidth - menuWidth - viewportPadding));

      let top = rect.bottom + gap;
      if (top + menuHeight > window.innerHeight - viewportPadding) {
        top = Math.max(viewportPadding, rect.top - menuHeight - gap);
      }

      setPosition({ top, left });
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, visibleItems.length]);

  useEffect(() => {
    if (!open) return undefined;

    function handlePointerDown(event) {
      if (
        triggerRef.current?.contains(event.target) ||
        menuRef.current?.contains(event.target)
      ) {
        return;
      }
      setOpen(false);
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  if (!visibleItems.length) {
    return <span>-</span>;
  }

  return (
    <div className="ui-actions-menu">
      <button
        ref={triggerRef}
        type="button"
        className={`ui-actions-trigger${open ? " is-open" : ""}`}
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="ui-actions-trigger-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      </button>

      {open
        ? createPortal(
            <div
              ref={menuRef}
              id={menuId}
              className="ui-actions-dropdown"
              role="menu"
              style={{ top: position.top, left: position.left }}
            >
              {visibleItems.map((item) => (
                <button
                  key={item.key || item.label}
                  type="button"
                  role="menuitem"
                  className={`ui-actions-item${item.tone === "danger" ? " is-danger" : ""}`}
                  disabled={item.disabled}
                  onClick={async () => {
                    setOpen(false);
                    await item.onClick?.();
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>,
            document.body
          )
        : null}
    </div>
  );
}

ActionsMenu.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string,
      label: PropTypes.string.isRequired,
      onClick: PropTypes.func,
      tone: PropTypes.oneOf(["default", "danger"]),
      disabled: PropTypes.bool,
      hidden: PropTypes.bool
    })
  ),
  ariaLabel: PropTypes.string
};

export default ActionsMenu;

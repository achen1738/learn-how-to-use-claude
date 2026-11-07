// A tiny in-house component library. Use these instead of raw elements so the
// dashboard stays consistent. Documented in DOCS.md.

import { useEffect, useId, useRef } from "react";

const TONES = {
  neutral: { background: "#eef1f5", color: "#2b3442" },
  success: { background: "#e3f6ea", color: "#11632f" },
  warning: { background: "#fff4d6", color: "#7a4b00" },
  danger: { background: "#fde7e7", color: "#9b1c1c" },
};

export function Button({ variant = "primary", loading = false, disabled, children, ...rest }) {
  const styles = {
    primary: { background: "#4f46e5", color: "white", border: "1px solid #4f46e5" },
    secondary: { background: "white", color: "#2b3442", border: "1px solid #c9d0db" },
    danger: { background: "#c62828", color: "white", border: "1px solid #c62828" },
  }[variant];
  return (
    <button
      type="button"
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      style={{
        ...styles,
        padding: "6px 12px",
        borderRadius: 6,
        cursor: disabled || loading ? "not-allowed" : "pointer",
        opacity: disabled || loading ? 0.6 : 1,
      }}
      {...rest}
    >
      {loading ? "Working…" : children}
    </button>
  );
}

export function Badge({ tone = "neutral", children }) {
  return (
    <span style={{ ...TONES[tone], padding: "2px 8px", borderRadius: 999, fontSize: 12, whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
}

/** Messages at the top of a page or modal. `onDismiss` adds a close button. */
export function Banner({ tone = "neutral", children, onDismiss }) {
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      style={{ ...TONES[tone], padding: "8px 12px", borderRadius: 6, margin: "8px 0", display: "flex", gap: 8 }}
    >
      <div style={{ flex: 1 }}>{children}</div>
      {onDismiss && (
        <button type="button" aria-label="Dismiss" onClick={onDismiss} style={{ background: "none", border: "none" }}>
          ×
        </button>
      )}
    </div>
  );
}

export function TextField({ label, error, hint, ...inputProps }) {
  const id = useId();
  return (
    <div style={{ margin: "12px 0" }}>
      <label htmlFor={id} style={{ display: "block", fontWeight: 600, marginBottom: 4 }}>
        {label}
      </label>
      <input
        id={id}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        style={{ padding: 6, width: "100%", boxSizing: "border-box" }}
        {...inputProps}
      />
      {hint && !error && (
        <div id={`${id}-hint`} style={{ fontSize: 12, color: "#5b6576" }}>
          {hint}
        </div>
      )}
      {error && (
        <div id={`${id}-error`} style={{ fontSize: 12, color: "#9b1c1c" }}>
          {error}
        </div>
      )}
    </div>
  );
}

/** options: [{ value, label }] */
export function Select({ label, options, error, ...selectProps }) {
  const id = useId();
  return (
    <div style={{ margin: "12px 0" }}>
      <label htmlFor={id} style={{ display: "block", fontWeight: 600, marginBottom: 4 }}>
        {label}
      </label>
      <select id={id} aria-invalid={Boolean(error) || undefined} style={{ padding: 6 }} {...selectProps}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <div style={{ fontSize: 12, color: "#9b1c1c" }}>{error}</div>}
    </div>
  );
}

/**
 * A dialog over the page. Rendered only while `open` is true. Escape and the
 * backdrop call `onClose`, unless `dismissible` is false (for example while a
 * request is in flight). Focus moves into the dialog when it opens.
 */
export function Modal({ open, title, onClose, dismissible = true, children, footer }) {
  const titleId = useId();
  const dialogRef = useRef(null);
  // Read the latest props through a ref so the effect below runs only when the
  // modal opens or closes, not on every render (which would steal focus).
  const latest = useRef({ onClose, dismissible });
  latest.current = { onClose, dismissible };

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement;
    dialogRef.current?.querySelector("input, select, textarea, button")?.focus();
    const onKeyDown = (event) => {
      if (event.key === "Escape" && latest.current.dismissible) latest.current.onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [open]);

  if (!open) return null;
  return (
    <div
      onClick={() => dismissible && onClose()}
      style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.45)", display: "grid", placeItems: "center" }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
        style={{ background: "white", borderRadius: 10, padding: 20, width: "min(420px, 92vw)" }}
      >
        <h3 id={titleId} style={{ marginTop: 0 }}>
          {title}
        </h3>
        {children}
        {footer && <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>{footer}</div>}
      </div>
    </div>
  );
}

/** Maps a payment status to the Badge tone and label used everywhere. */
export const STATUS_DISPLAY = {
  succeeded: { tone: "success", label: "Succeeded" },
  partially_refunded: { tone: "warning", label: "Partially refunded" },
  refunded: { tone: "neutral", label: "Refunded" },
  failed: { tone: "danger", label: "Failed" },
  disputed: { tone: "danger", label: "Disputed" },
};

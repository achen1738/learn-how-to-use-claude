import "./Toasts.css";

// 10 · Toast Notifications. The full prompt is in README.md in this folder.
// Write all styles in Toasts.css. Prefix classes with "toast".

export const SAMPLE_TOASTS = {
  success: { type: "success", message: "Changes saved." },
  error: { type: "error", message: "Couldn't connect to the server. Try again." },
  info: { type: "info", message: "A new version is available." },
  long: {
    type: "info",
    message:
      "Your export is being prepared. Large workspaces can take a few minutes, and we'll also send you an email with a download link when the file is ready.",
  },
};

export function Toasts() {
  // TODO: toast state (list of { id, type, message }), adding, removing,
  // auto-dismiss timers, and the toast container.

  return (
    <div>
      <h2>Toast Notifications</h2>
      <p>See README.md for the prompt.</p>

      <div>
        <button type="button">Success</button>{" "}
        <button type="button">Error</button>{" "}
        <button type="button">Info</button>{" "}
        <button type="button">Long message</button>
      </div>

      <p>
        Click-through test: this button sits near where toasts appear on a
        phone. It should still be clickable around the toasts.
      </p>
      <button type="button" onClick={() => alert("Clicked!")}>
        Can you click me?
      </button>
    </div>
  );
}

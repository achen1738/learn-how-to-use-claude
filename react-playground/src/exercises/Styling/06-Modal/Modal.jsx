import { useState } from "react";
import "./Modal.css";

// 06 · Modal Dialog. The full prompt is in README.md in this folder.
// Write all styles in Modal.css. Prefix classes with "modal".

export const SHORT_BODY =
  "This permanently deletes the “Website Redesign” project, its 42 tasks and all attached files. This can't be undone.";

export const LONG_BODY = Array.from(
  { length: 25 },
  (_, i) =>
    `Clause ${i + 1}. Deleting a project removes every task, comment, file and activity record linked to it. Members lose access immediately and integrations stop syncing.`
);

export function Modal() {
  const [longTerms, setLongTerms] = useState(false);
  const [deleted, setDeleted] = useState(false);
  // TODO: open/close state, the dialog itself, focus management, scroll lock.

  return (
    <div>
      <h2>Modal Dialog</h2>
      <p>See README.md for the prompt.</p>

      <label>
        <input
          type="checkbox"
          checked={longTerms}
          onChange={(e) => setLongTerms(e.target.checked)}
        />{" "}
        Long terms
      </label>

      <p>{deleted ? "Project deleted." : "Project: Website Redesign"}</p>
      <button type="button" disabled={deleted}>
        Delete project
      </button>

      {/* Filler so the page scrolls. Check it doesn't scroll while the modal is open. */}
      {Array.from({ length: 30 }, (_, i) => (
        <p key={i}>Background paragraph {i + 1}.</p>
      ))}

      {/* TODO: the dialog. Its body text is SHORT_BODY, or LONG_BODY
          (one <p> per item) when longTerms is checked. */}
    </div>
  );
}

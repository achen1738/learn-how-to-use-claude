import { useState } from "react";
import "./HolyGrailLayout.css";

// 05 · Holy Grail Layout. The full prompt is in README.md in this folder.
// Write all styles in HolyGrailLayout.css. Prefix classes with "holy-grail".

export const NAV_ITEMS = ["Dashboard", "Projects", "Team", "Reports", "Settings"];

export const SIDEBAR_ITEMS = [
  "Release 4.2 ships Friday",
  "3 pull requests need review",
  "On-call: Priya",
];

const PARAGRAPH =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";

export function HolyGrailLayout() {
  const [longContent, setLongContent] = useState(false);
  const paragraphs = longContent ? 15 : 1;

  // TODO: replace this with the real layout: header, nav, main, aside, footer.
  // Keep the toggle somewhere visible (the header is a good place).
  return (
    <div>
      <h2>Holy Grail Layout</h2>
      <p>See README.md for the prompt.</p>

      <label>
        <input
          type="checkbox"
          checked={longContent}
          onChange={(e) => setLongContent(e.target.checked)}
        />{" "}
        Long content
      </label>

      <ul>
        {NAV_ITEMS.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <h3>Main content</h3>
      {Array.from({ length: paragraphs }, (_, i) => (
        <p key={i}>{PARAGRAPH}</p>
      ))}

      <ul>
        {SIDEBAR_ITEMS.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <p>© 2026 Acme Inc.</p>
    </div>
  );
}

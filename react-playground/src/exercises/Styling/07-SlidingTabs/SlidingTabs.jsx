import { useState } from "react";
import "./SlidingTabs.css";

// 07 · Sliding Tabs. The full prompt is in README.md in this folder.
// Write all styles in SlidingTabs.css. Prefix classes with "sliding-tabs".

export const TABS = [
  { id: "overview", label: "Overview", content: "Project summary and key numbers." },
  { id: "activity", label: "Activity", content: "Recent commits, comments and deploys." },
  { id: "pr", label: "Pull requests", content: "12 open, 3 waiting on review." },
  { id: "ci", label: "CI", content: "All checks passing on main." },
  { id: "settings", label: "Settings & permissions", content: "Who can see and change this project." },
];

export const EXTRA_TABS = [
  "Insights", "Wiki", "Security", "Releases", "Packages", "Environments",
  "Discussions", "Milestones",
].map((label) => ({
  id: label.toLowerCase(),
  label,
  content: `${label} panel.`,
}));

export function SlidingTabs() {
  const [manyTabs, setManyTabs] = useState(false);
  const tabs = manyTabs ? [...TABS, ...EXTRA_TABS] : TABS;
  // TODO: selected tab state, the tab bar, the sliding indicator and the panel.

  return (
    <div>
      <h2>Sliding Tabs</h2>
      <p>See README.md for the prompt.</p>

      <label>
        <input
          type="checkbox"
          checked={manyTabs}
          onChange={(e) => setManyTabs(e.target.checked)}
        />{" "}
        Many tabs (stretch)
      </label>

      <ul>
        {tabs.map((tab) => (
          <li key={tab.id}>{tab.label}</li>
        ))}
      </ul>
    </div>
  );
}

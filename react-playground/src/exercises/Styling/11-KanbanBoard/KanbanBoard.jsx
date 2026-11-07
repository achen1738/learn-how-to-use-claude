import "./KanbanBoard.css";

// 11 · Kanban Board. The full prompt is in README.md in this folder.
// Write all styles in KanbanBoard.css. Prefix classes with "kanban".

export const COLUMNS = [
  { id: "backlog", title: "Backlog" },
  { id: "todo", title: "To do" },
  { id: "doing", title: "In progress" },
  { id: "review", title: "In review" },
  { id: "done", title: "Done" },
];

export const CARDS = [
  { id: "c1", columnId: "backlog", title: "Research competitor pricing pages", tags: ["research"], assignee: "PP", priority: "low" },
  { id: "c2", columnId: "backlog", title: "Dark mode", tags: ["design", "frontend"], assignee: "MF", priority: "low" },
  { id: "c3", columnId: "backlog", title: "Audit colour contrast across the marketing site and the app, including charts, disabled states and placeholder text", tags: ["a11y", "design", "frontend", "marketing", "q3-goal"], assignee: "SL", priority: "high" },
  { id: "c4", columnId: "backlog", title: "Investigate https://status.example.com/incidents/2026-10-28-elevated-error-rates-on-the-payments-api", tags: ["bug"], assignee: "JK", priority: "high" },
  { id: "c5", columnId: "backlog", title: "Write onboarding emails", tags: ["growth"], assignee: "AR", priority: "low" },
  { id: "c6", columnId: "backlog", title: "Add CSV import", tags: ["backend"], assignee: "PP", priority: "low" },
  { id: "c7", columnId: "backlog", title: "Translate settings page", tags: ["i18n"], assignee: "MF", priority: "low" },
  { id: "c8", columnId: "backlog", title: "Clean up feature flags", tags: ["tech-debt"], assignee: "SL", priority: "low" },
  { id: "c9", columnId: "backlog", title: "Keyboard shortcuts help dialog", tags: ["frontend", "a11y"], assignee: "JK", priority: "low" },
  { id: "c10", columnId: "todo", title: "Fix flaky checkout test", tags: ["bug", "testing"], assignee: "AR", priority: "high" },
  { id: "c11", columnId: "todo", title: "New pricing table", tags: ["frontend"], assignee: "PP", priority: "low" },
  { id: "c12", columnId: "todo", title: "Rate limit the public API", tags: ["backend", "security"], assignee: "SL", priority: "high" },
  { id: "c13", columnId: "doing", title: "Migrate avatars to the CDN", tags: ["infra"], assignee: "JK", priority: "low" },
  { id: "c14", columnId: "doing", title: "Redesign empty states", tags: ["design"], assignee: "MF", priority: "low" },
  { id: "c15", columnId: "done", title: "Ship 2FA", tags: ["security"], assignee: "AR", priority: "high" },
  // "In review" starts empty on purpose.
];

export function KanbanBoard() {
  // TODO: keep CARDS in state, render the board, move cards left/right.
  return (
    <div>
      <h2>Kanban Board</h2>
      <p>See README.md for the prompt.</p>
    </div>
  );
}

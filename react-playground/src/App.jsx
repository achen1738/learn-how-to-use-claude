import { useState } from "react";
import TypeaheadSearch from "./exercises/TypeaheadSearch.jsx";
import OptimisticTaskList from "./exercises/OptimisticTaskList.jsx";
import NotificationInbox from "./exercises/NotificationInbox.jsx";
import ReadingList from "./exercises/ReadingList.jsx";
import ProfileTabs from "./exercises/ProfileTabs.jsx";
import Wordle from "./exercises/Wordle.jsx";
import { FormController } from "./exercises/TwoPageForm/FormController.jsx";
import { AuthCodeInput } from "./exercises/AuthCodeInput/AuthCodeInput";
import { CipherWorkbench } from "./exercises/CipherWorkbench/CipherWorkbench";
import { Stripe } from "./exercises/Stripe/Stripe.jsx";
import { TeamDirectory } from "./exercises/TeamDirectory/TeamDirectory.jsx";
import { FileTree } from "./exercises/FileTree/FileTree.jsx";
import { CommentThread } from "./exercises/CommentThread/CommentThread.jsx";
import { PermissionsTree } from "./exercises/PermissionsTree/PermissionsTree.jsx";
import { DynamicForm } from "./exercises/DynamicForm/DynamicForm.jsx";
import { PaymentsDashboard } from "./exercises/RefundsIntegration/PaymentsDashboard.jsx";
import { Stripe as Stripe2 } from "./exercises/Stripe2/Stripe.jsx";
import { ProfileCard } from "./exercises/Styling/01-ProfileCard/ProfileCard.jsx";
import { Navbar } from "./exercises/Styling/02-Navbar/Navbar.jsx";
import { ButtonVariants } from "./exercises/Styling/03-ButtonVariants/ButtonVariants.jsx";
import { ProductGrid } from "./exercises/Styling/04-ProductGrid/ProductGrid.jsx";
import { HolyGrailLayout } from "./exercises/Styling/05-HolyGrailLayout/HolyGrailLayout.jsx";
import { Modal } from "./exercises/Styling/06-Modal/Modal.jsx";
import { SlidingTabs } from "./exercises/Styling/07-SlidingTabs/SlidingTabs.jsx";
import { Accordion } from "./exercises/Styling/08-Accordion/Accordion.jsx";
import { TooltipDemo } from "./exercises/Styling/09-Tooltip/Tooltip.jsx";
import { Toasts } from "./exercises/Styling/10-Toasts/Toasts.jsx";
import { KanbanBoard } from "./exercises/Styling/11-KanbanBoard/KanbanBoard.jsx";
import { DataTable } from "./exercises/Styling/12-DataTable/DataTable.jsx";

// Register each interview exercise here. Add a new entry whenever you
// drop another exercise file into src/exercises/.
const EXERCISES = [
  { id: "stripe2", label: "Stripe2", Component: Stripe2 },
  { id: "stripe", label: "Stripe", Component: Stripe },
  { id: "typeahead-search", label: "Typeahead Search", Component: TypeaheadSearch },
  { id: "optimistic-task-list", label: "Optimistic Task List", Component: OptimisticTaskList },
  { id: "notification-inbox", label: "Notification Inbox", Component: NotificationInbox },
  { id: "reading-list", label: "Reading List (Drag Reorder)", Component: ReadingList },
  { id: "profile-tabs", label: "Profile Tabs (Compound Component)", Component: ProfileTabs },
  { id: "wordle", label: "Wordle", Component: Wordle },
  { id: "two-page-form", label: "Two Page Form", Component: FormController },
  { id: "auth-code-input", label: "Auth Code Input", Component: AuthCodeInput },
  { id: "cipher-workbench", label: "Cipher Workbench", Component: CipherWorkbench },
  { id: "team-directory", label: "Team Directory (Bug Bash)", Component: TeamDirectory },
  { id: "file-tree", label: "File Tree", Component: FileTree },
  { id: "comment-thread", label: "Comment Thread", Component: CommentThread },
  { id: "permissions-tree", label: "Role Permissions", Component: PermissionsTree },
  { id: "dynamic-form", label: "Dynamic Form", Component: DynamicForm },
  {
    id: "refunds-integration",
    label: "Payments Refunds (Integration)",
    Component: PaymentsDashboard,
  },
  // Styling drills: plain CSS practice. Prompts in src/exercises/Styling/.
  { id: "styling-01", label: "Styling 01 · Profile Card", Component: ProfileCard },
  { id: "styling-02", label: "Styling 02 · Navbar", Component: Navbar },
  { id: "styling-03", label: "Styling 03 · Button Variants", Component: ButtonVariants },
  { id: "styling-04", label: "Styling 04 · Product Grid", Component: ProductGrid },
  { id: "styling-05", label: "Styling 05 · Holy Grail Layout", Component: HolyGrailLayout },
  { id: "styling-06", label: "Styling 06 · Modal", Component: Modal },
  { id: "styling-07", label: "Styling 07 · Sliding Tabs", Component: SlidingTabs },
  { id: "styling-08", label: "Styling 08 · Accordion", Component: Accordion },
  { id: "styling-09", label: "Styling 09 · Tooltip", Component: TooltipDemo },
  { id: "styling-10", label: "Styling 10 · Toasts", Component: Toasts },
  { id: "styling-11", label: "Styling 11 · Kanban Board", Component: KanbanBoard },
  { id: "styling-12", label: "Styling 12 · Data Table", Component: DataTable },
];

export default function App() {
  const [activeId, setActiveId] = useState(EXERCISES[0].id);
  const active = EXERCISES.find((e) => e.id === activeId);

  return (
    <div style={styles.app}>
      <nav style={styles.nav}>
        <h1 style={styles.title}>React Interview Playground</h1>
        <ul style={styles.list}>
          {EXERCISES.map((e) => (
            <li key={e.id}>
              <button
                onClick={() => setActiveId(e.id)}
                style={{
                  ...styles.navButton,
                  ...(e.id === activeId ? styles.navButtonActive : {}),
                }}
              >
                {e.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <main style={styles.main}>{active ? <active.Component /> : null}</main>
    </div>
  );
}

const styles = {
  app: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "system-ui, sans-serif",
  },
  nav: {
    width: 220,
    borderRight: "1px solid #eee",
    padding: 16,
    boxSizing: "border-box",
  },
  title: {
    fontSize: 16,
    marginBottom: 16,
  },
  list: {
    listStyle: "none",
    margin: 0,
    padding: 0,
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  navButton: {
    width: "100%",
    textAlign: "left",
    padding: "8px 10px",
    fontSize: 14,
    border: "none",
    borderRadius: 4,
    background: "transparent",
    cursor: "pointer",
  },
  navButtonActive: {
    background: "#eef2ff",
    fontWeight: 600,
  },
  main: {
    flex: 1,
    // Lets wide exercises scroll inside their own boxes instead of
    // stretching the page sideways.
    minWidth: 0,
    padding: 24,
  },
};

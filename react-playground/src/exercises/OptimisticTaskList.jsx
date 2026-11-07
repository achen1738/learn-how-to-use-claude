import { useState, useRef } from "react";

/**
 * SENIOR REACT INTERVIEW EXERCISE — Optimistic Task List
 * -------------------------------------------------------
 * Time: ~35-45 minutes
 *
 * A todo list where checking a task off updates the UI immediately
 * (optimistic update) and persists the change to a mock API in the
 * background, with an "Undo" snackbar after each successful toggle.
 *
 * It "works" for a happy-path demo, but has several bugs and missing
 * features that a senior engineer should be able to spot and fix.
 *
 * Ask the candidate to talk through the problems out loud before fixing
 * them — the diagnosis matters as much as the fix.
 *
 * ------------------------------------------------------------------
 * TASKS (roughly increasing difficulty — pick as many as time allows)
 * ------------------------------------------------------------------
 * 1. STALE CLOSURE / LOST UPDATE: Toggle two different tasks in quick
 *    succession. The rollback snapshot in handleToggle is captured from
 *    the `tasks` state at call time, not the latest state, so if a
 *    later optimistic update lands before an earlier request fails,
 *    the rollback can stomp on it. Fix using functional state updates.
 *
 * 2. RACE CONDITION ON THE SAME ITEM: Rapidly click the same checkbox
 *    on/off/on. Persist calls resolve out of order, so the final UI
 *    state doesn't necessarily match the last click. Fix it (ignore
 *    stale responses via a per-task request id, or serialize by task).
 *
 * 3. NO ROLLBACK ON FAILURE: The mock API fails ~15% of the time but
 *    the optimistic update is never reverted, leaving the UI out of
 *    sync with the "server". Add rollback + a visible error state.
 *
 * 4. DANGLING TIMERS: Each successful toggle starts a 4s timeout to
 *    auto-dismiss the "Undo" snackbar, but old timeouts are never
 *    cleared. Toggling multiple tasks in a row stacks timers that can
 *    dismiss a newer snackbar early, and none are cleared on unmount.
 *
 * 5. INDEX-AS-KEY: The list is keyed by array index, not task id. Try
 *    marking a task done, then imagine deleting a task above it in the
 *    list (or reordering) — the wrong row would end up "checked"
 *    because React reuses DOM nodes by key/index, not by identity.
 *
 * 6. ACCESSIBILITY: The snackbar isn't announced to screen readers
 *    (no aria-live/role="status"), and each checkbox's label isn't
 *    programmatically associated with its input.
 *
 * 7. STRETCH: Extract the optimistic-update + rollback + undo logic
 *    into a reusable `useOptimisticToggle(tasks, persistFn)` hook so
 *    it can be unit tested independently of the UI.
 *
 * ------------------------------------------------------------------
 * Mock API is at the bottom — simulates network latency and randomly
 * throws to exercise error/rollback handling. Do not need to change it.
 * ------------------------------------------------------------------
 */

export default function OptimisticTaskList() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const doneRef = useRef(
    Object.fromEntries(INITIAL_TASKS.map(t => [t.id, t.done]))
  );

  const [snackbar, setSnackbar] = useState(null);
  const requestIdRef = useRef({});
  // BUG: stale closure over `tasks` for rollback, no cancellation/
  // request-ordering guard, and a dangling setTimeout per toggle.
  const handleToggle = (id) => {
    const done = !doneRef.current[id];
    doneRef.current[id] = done;
    setTasks(prevTasks => prevTasks.map((t) =>
      t.id === id ? { ...t, done } : t
    ));

    const myRequestId = (requestIdRef.current[id] || 0) + 1;
    requestIdRef.current[id] = myRequestId;


    persistToggle(id, done)
      .then(({id, done}) => {
        if (requestIdRef.current[id] !== myRequestId) return;
        setSnackbar({ id, label: tasks[id].label, done });
        setTimeout(() => setSnackbar(null), 4000);
      })
      .catch(() => {
        if (requestIdRef.current[id] !== myRequestId) return;
        setTasks(prevTasks => prevTasks.map((t) =>
          t.id === id ? { ...t, done: !t.done } : t
        ));
      });
  };

  const handleUndo = () => {
    if (!snackbar) return;
    handleToggle(snackbar.id);
    setSnackbar(null);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Tasks</h2>
      <ul style={styles.list}>
        {tasks.map((task, index) => (
          <li key={index} style={styles.item}>
            <input
              type="checkbox"
              checked={
                doneRef.current[task.id]
              }
              onChange={() => handleToggle(task.id)}
            />
            <span style={doneRef.current[task.id] ? styles.done : undefined}>
              {task.label}
            </span>
          </li>
        ))}
      </ul>

      {/* TODO: role="status"/aria-live so screen readers hear this */}
      {snackbar && (
        <div style={styles.snackbar}>
          {snackbar.label} marked {snackbar.done ? "done" : "not done"}.{" "}
          <button onClick={handleUndo} style={styles.undoButton}>
            Undo
          </button>
        </div>
      )}
    </div>
  );
}

const INITIAL_TASKS = [
  { id: 1, label: "Write RFC for new auth flow", done: false },
  { id: 2, label: "Review PR #482", done: false },
  { id: 3, label: "Pair on flaky test", done: true },
  { id: 4, label: "Update onboarding docs", done: false },
  { id: 5, label: "Triage bug backlog", done: false },
];

// ------------------------------------------------------------------
// Mock API — leave as-is. Simulates variable latency (150-700ms) and
// a ~15% failure rate so error/rollback handling can be exercised.
// ------------------------------------------------------------------
function persistToggle(id, done) {
  const latency = 150 + Math.random() * 550;
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < 0.15) {
        reject(new Error(`Failed to save task ${id}`));
        return;
      }
      resolve({ id, done });
    }, latency);
  });
}

const styles = {
  container: {
    maxWidth: 360,
    margin: "40px auto",
    fontFamily: "system-ui, sans-serif",
  },
  heading: {
    fontSize: 16,
    marginBottom: 12,
  },
  list: {
    listStyle: "none",
    margin: 0,
    padding: 0,
  },
  item: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 0",
    borderBottom: "1px solid #f2f2f2",
    fontSize: 14,
  },
  done: {
    textDecoration: "line-through",
    color: "#999",
  },
  snackbar: {
    marginTop: 16,
    padding: "10px 12px",
    background: "#333",
    color: "#fff",
    borderRadius: 4,
    fontSize: 13,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  undoButton: {
    background: "none",
    border: "none",
    color: "#8ab4ff",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
  },
};

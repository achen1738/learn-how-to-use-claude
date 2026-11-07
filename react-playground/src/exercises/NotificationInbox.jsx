import { useState, useMemo } from "react";

/**
 * SENIOR REACT INTERVIEW EXERCISE — Notification Inbox: Multi-Select
 * --------------------------------------------------------------------
 * Time: ~35-45 minutes
 *
 * Unlike the other exercises in this playground, this component has NO
 * deliberate bugs. Filtering (All / Unread) and toggling an individual
 * notification's read state both work correctly today. The exercise is
 * to build a genuinely new feature on top of that working code, the
 * way a real ticket would ask you to.
 *
 * Ask the candidate to talk through their state design out loud before
 * writing code — where selection state should live, and what data
 * structure represents it, matters more here than the JSX.
 *
 * ------------------------------------------------------------------
 * FEATURE: Multi-select + bulk actions (roughly increasing difficulty)
 * ------------------------------------------------------------------
 * 1. CHECKBOX SELECTION: Add a checkbox to each row. Clicking it toggles
 *    that item's selected state WITHOUT also triggering the existing
 *    "click row to toggle read" behavior.
 *
 * 2. RANGE SELECT: Shift-click a checkbox to select/deselect every item
 *    between the last-clicked checkbox and this one (Gmail/Finder-style),
 *    based on the currently VISIBLE (filtered) order — not the full
 *    underlying array.
 *
 * 3. SELECT ALL + INDETERMINATE: Add a header checkbox that selects all
 *    currently visible items. It should show as indeterminate (not just
 *    checked/unchecked) when some but not all visible items are
 *    selected — note this requires setting the `indeterminate` DOM
 *    property imperatively; there's no JSX prop for it.
 *
 * 4. BULK ACTION BAR: When one or more items are selected, show a bar
 *    above the list: "Mark N as read", "Mark N as unread", and "Clear
 *    selection". It should disappear when the selection is empty.
 *
 * 5. SELECTION + FILTER INTERACTION: Decide (and justify) what happens
 *    to selection when the filter changes — e.g. switching from "All"
 *    to "Unread" while some already-read items are selected. There's
 *    no single right answer, but the behavior should be intentional
 *    and consistent, not an accident of how the code happens to work.
 *
 * 6. ACCESSIBILITY: Each checkbox needs an accessible name tied to its
 *    notification's subject. The header checkbox needs
 *    aria-checked="mixed" when indeterminate. The bulk action bar's
 *    selection count should be announced via aria-live when it changes.
 *
 * 7. STRETCH: Extract the selection logic (selected-id set, shift-click
 *    anchor tracking, select-all/indeterminate derivation) into a
 *    reusable `useSelection(items, { getId })` hook decoupled from
 *    notifications specifically, so it could be reused for the task
 *    list exercise or unit tested on its own.
 *
 * ------------------------------------------------------------------
 * The data and toggleRead below are intentionally simple — resist the
 * urge to touch them, the point of the exercise is what you build
 * around them.
 * ------------------------------------------------------------------
 */

export default function NotificationInbox() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [checked, setChecked] = useState({...INITIAL_NOTIFICATIONS.reduce((acc, n) => ({ ...acc, [n.id]: false }), {})});
  const [filter, setFilter] = useState("all"); // "all" | "unread"
  const [lastCheckedId, setLastCheckedId] = useState(null);


  const visible = useMemo(() => {
    return filter === "unread"
      ? notifications.filter((n) => !n.read)
      : notifications;
  }, [notifications, filter]);

  const selected = Object.keys(checked).filter((id) => checked[id]);
  const selectAllStatus = selected.length > 0;

  const toggleRead = (id) => {
    console.log(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  const toggleCheckbox = (id, shiftKey) => {
    if (shiftKey && lastCheckedId !== null) {
      const lastIndex = visible.findIndex(n => n.id === lastCheckedId);
      const currentIndex = visible.findIndex(n => n.id === id);
      if (lastIndex !== -1 && currentIndex !== -1) {
        const [start, end] = lastIndex < currentIndex ? [lastIndex, currentIndex] : [currentIndex, lastIndex];
        const idsToToggle = visible.slice(start, end + 1).map(n => n.id);
        setChecked(prev => {
          const newCheckedValue = !prev[id]; // Ensure lastCheckedId is included
          const newChecked = { ...prev };
          idsToToggle.forEach(id => {
            newChecked[id] = newCheckedValue;
          });
          return newChecked;
        });
      }
    } else {
      setChecked(prev => ({ ...prev, [id]: !prev[id] }));
    }
    setLastCheckedId(id);
  }


  return (
    <div style={styles.container}>
      <div style={styles.toolbar}>
        <h2 style={styles.heading}>Inbox</h2>
        <div>
          <label>
            <input
              type="checkbox"
              label="Select All"
              checked={selectAllStatus}
              onChange={(e) => {
                setChecked({...INITIAL_NOTIFICATIONS.reduce((acc, n) => ({ ...acc, [n.id]: e.target.checked }), {})});
              }}
            />
            <span>{selectAllStatus ? "Deselect All" : "Select All"}</span>
          </label>
        </div>
        <div style={styles.filterGroup}>
          <button
            onClick={() => setFilter("all")}
            style={filter === "all" ? styles.filterActive : styles.filterButton}
          >
            All
          </button>
          <button
            onClick={() => setFilter("unread")}
            style={filter === "unread" ? styles.filterActive : styles.filterButton}
          >
            Unread
          </button>
        </div>
      </div>

      {/* TODO: bulk action bar goes here, shown when selectionCount > 0 */}
    
      {selected.length > 0 && (
        <div style={styles.bulkActions}>
          <button onClick={() => {
            setNotifications(prev => {
              let newNotifications = [...prev];
              selected.forEach((id) => {
                let num = parseInt(id, 10); 
                newNotifications[num - 1] = { ...newNotifications[num - 1], read: true };
              })
           
              return newNotifications;
            });
          }}>
            Mark as Read
          </button>
          <button onClick={() => {
            setNotifications(prev => {
              let newNotifications = [...prev];
              selected.forEach((id) => {
                let num = parseInt(id, 10);
                newNotifications[num - 1] = { ...newNotifications[num - 1], read: false };
              });
              return newNotifications;
            });
          }}>
            Mark as Unread
          </button>
        </div>
      )}

      <ul style={styles.list}>
        {/* TODO: header "select all" checkbox goes somewhere above/in this list */}
        {visible.map((n) => (
          <li key={n.id} style={styles.item}>
            {/* TODO: per-row selection checkbox goes here */}
            <input type="checkbox" checked={checked[n.id] || false}  onChange={(e) => {console.log("Checkbox changed", n.id, e.nativeEvent.shiftKey); toggleCheckbox(n.id, e.nativeEvent.shiftKey)}}/>
            <div style={styles.content} onClick={() => toggleRead(n.id)}>
              <div style={n.read ? styles.subjectRead : styles.subjectUnread}>
                {n.subject}
              </div>
              <div style={styles.preview}>{n.preview}</div>
            </div>
            <div style={styles.timestamp}>{n.timestamp}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

const INITIAL_NOTIFICATIONS = [
  { id: 1, subject: "Your PR was approved", preview: "kai approved #482", timestamp: "9:02 AM", read: false },
  { id: 2, subject: "Deploy succeeded", preview: "main deployed to prod", timestamp: "8:47 AM", read: true },
  { id: 3, subject: "New comment on RFC", preview: "\"what about rollback?\"", timestamp: "8:30 AM", read: false },
  { id: 4, subject: "Build failed", preview: "flaky test in auth suite", timestamp: "7:58 AM", read: false },
  { id: 5, subject: "Weekly digest", preview: "5 PRs merged this week", timestamp: "Yesterday", read: true },
  { id: 6, subject: "Mentioned in #frontend", preview: "@you can you take a look", timestamp: "Yesterday", read: false },
  { id: 7, subject: "On-call handoff", preview: "you're on call starting Mon", timestamp: "2 days ago", read: true },
  { id: 8, subject: "New follower request", preview: "someone wants to follow you", timestamp: "2 days ago", read: false },
];

const styles = {
  container: {
    maxWidth: 480,
    margin: "40px auto",
    fontFamily: "system-ui, sans-serif",
  },
  toolbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  heading: {
    fontSize: 16,
    margin: 0,
  },
  filterGroup: {
    display: "flex",
    gap: 4,
  },
  filterButton: {
    padding: "6px 10px",
    fontSize: 13,
    border: "1px solid #ddd",
    borderRadius: 4,
    background: "#fff",
    cursor: "pointer",
  },
  filterActive: {
    padding: "6px 10px",
    fontSize: 13,
    border: "1px solid #333",
    borderRadius: 4,
    background: "#333",
    color: "#fff",
    cursor: "pointer",
  },
  list: {
    listStyle: "none",
    margin: 0,
    padding: 0,
    border: "1px solid #eee",
    borderRadius: 6,
    overflow: "hidden",
  },
  item: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    borderBottom: "1px solid #f2f2f2",
    cursor: "pointer",
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  subjectUnread: {
    fontSize: 14,
    fontWeight: 700,
  },
  subjectRead: {
    fontSize: 14,
    fontWeight: 400,
    color: "#555",
  },
  preview: {
    fontSize: 12,
    color: "#888",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  timestamp: {
    fontSize: 11,
    color: "#aaa",
    whiteSpace: "nowrap",
  },
};

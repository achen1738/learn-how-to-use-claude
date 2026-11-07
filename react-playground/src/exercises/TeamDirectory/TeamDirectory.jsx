import { useState, useEffect, useMemo } from "react";
import { EditPanel } from "./EditPanel";
import { EMPLOYEES } from "./employees";

/**
 * SENIOR REACT INTERVIEW EXERCISE — Team Directory: Bug Bash
 * -----------------------------------------------------------
 * Time: ~45-60 minutes
 *
 * A searchable, sortable, paginated team directory with row selection,
 * inline editing, delete, and a live "online" presence indicator.
 *
 * The happy path demos fine: load the page, sort a column, edit the
 * first person, delete someone on page 1. But QA has filed the bug
 * reports below. Each one is a SYMPTOM, not a diagnosis — reproduce
 * it, explain the root cause out loud, then fix it properly (not just
 * enough to make the symptom go away).
 *
 * Some bugs can mask or amplify others. Part of the exercise is
 * deciding what order to tackle them in.
 *
 * Answer key: SOLUTIONS.md in this folder. Don't peek until you're done.
 *
 * ------------------------------------------------------------------
 * BUG REPORTS (roughly increasing difficulty)
 * ------------------------------------------------------------------
 * 1. Clicking the ☆ favorite star on a row also opens the editor for
 *    that person.
 *
 * 2. Go to page 5, then search for "design". The table says
 *    "No results", but there are several designers.
 *
 * 3. The "N online" badge in the header never changes, even though
 *    the green dots next to people's names keep changing.
 *
 * 4. Clicking a checkbox often doesn't tick it. The tick shows up a
 *    few seconds later, seemingly at random.
 *
 * 5. Tick Priya Raman, then sort by Name (or go to the next page).
 *    Someone else is now ticked, and "Email selected" emails the
 *    wrong people.
 *
 * 6. Sort by Name, then click the header until the sort indicator
 *    goes away. The table should go back to its original order but
 *    stays sorted (sometimes it snaps back a few seconds later, which
 *    doesn't seem right either).
 *
 * 7. Edit Priya Raman, then (without saving) click Marcus Webb's row.
 *    The panel title says "Edit Marcus Webb" but the fields still
 *    show Priya. Clicking Save turns Marcus into a second Priya.
 *
 * 8. Go to page 2 and delete someone. A different person disappears
 *    (the same happens on page 1 when the table is filtered by search).
 *
 * 9. Edit someone's role and save, or delete someone. A few seconds
 *    later the change is silently undone. Also, check the console
 *    after switching to another exercise in the sidebar.
 *
 * ------------------------------------------------------------------
 * FOLLOW-UPS (if time allows)
 * ------------------------------------------------------------------
 * 10. ACCESSIBILITY: Sortable headers only work with a mouse and don't
 *     expose their sort state. Row checkboxes have no accessible name.
 *     The editor doesn't move focus when it opens.
 *
 * 11. STRETCH: Pull filter/sort/paginate into pure functions (or a
 *     `useTableView(rows, options)` hook) so they can be unit tested
 *     without rendering the component.
 * ------------------------------------------------------------------
 */

const PAGE_SIZE = 5;

const COLUMNS = [
  { key: "name", label: "Name" },
  { key: "role", label: "Role" },
  { key: "team", label: "Team" },
  { key: "startYear", label: "Since" },
];

const NEXT_SORT_DIRECTION = { none: "asc", asc: "desc", desc: "none" };

function compareValues(a, b) {
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b));
}

export function TeamDirectory() {
  const [employees, setEmployees] = useState(EMPLOYEES);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState({ key: null, direction: "none" });
  const [page, setPage] = useState(0);
  const [checkedRows, setCheckedRows] = useState(new Set());
  const [editingId, setEditingId] = useState(null);

  // Simulated presence feed: a few people come online/offline every few seconds.
  useEffect(() => {
    const timerId = setInterval(() => {
      console.log("[presence] polling…");
      setEmployees((prev) =>
        prev.map((employee) => ({ ...employee, online: Math.random() < 0.35 })),
      );
    }, 3000);

    return () => clearInterval(timerId);
  }, []);

  const onlineCount = employees.filter((employee) => employee.online).length;

  const normalizedQuery = query.trim().toLowerCase();
  const visible = normalizedQuery
    ? employees.filter((employee) =>
        [employee.name, employee.role, employee.team]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery),
      )
    : employees;

  if (sort.direction !== "none") {
    visible.sort((a, b) => {
      const result = compareValues(a[sort.key], b[sort.key]);
      return sort.direction === "asc" ? result : -result;
    });
  }

  const pageCount = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const pageRows = visible.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const editing = useMemo(
    () => employees.find((employee) => employee.id === editingId),
    [employees, editingId],
  );

  const toggleSort = (key) => {
    setSort((prev) => {
      return prev.key === key
        ? { key, direction: NEXT_SORT_DIRECTION[prev.direction] }
        : { key, direction: "asc" };
    });
  };

  const toggleChecked = (id) => {
    setCheckedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleFavorite = (event, id) => {
    event.stopPropagation();
    setEmployees((prev) =>
      prev.map((employee) =>
        employee.id === id ? { ...employee, favorite: !employee.favorite } : employee,
      ),
    );
  };

  const handleDelete = (event, id) => {
    event.stopPropagation();
    setEmployees((prev) => prev.filter((employee) => employee.id !== id));
  };

  const handleSave = (updated) => {
    setEmployees((prev) =>
      prev.map((employee) => (employee.id === editingId ? updated : employee)),
    );
    setEditingId(null);
  };

  const emailSelected = () => {
    const names = [...checkedRows]
      .map((id) => pageRows.find((employee) => employee.id === id)?.name)
      .filter(Boolean);
    alert(names.length ? `Emailing: ${names.join(", ")}` : "Nobody selected");
  };

  const handleFavoriteClick = (event, id) => {
    event.stopPropagation();
    toggleFavorite(id);
  };

  useEffect(() => {
    if (!visible.length) {
      setPage((prev) => Math.max(0, prev - 1));
    }
  }, [visible]);

  return (
    <div style={styles.container}>
      <div style={styles.toolbar}>
        <h2 style={styles.heading}>
          Team Directory <span style={styles.badge}>{onlineCount} online</span>
        </h2>
        <input
          type="search"
          placeholder="Search name, role or team"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(0);
          }}
          style={styles.search}
        />
      </div>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th} />
            {COLUMNS.map(({ key, label }) => (
              <th key={key} style={styles.sortableTh} onClick={() => toggleSort(key)}>
                {label}
                {sort.key === key && sort.direction !== "none" && (
                  <span>{sort.direction === "asc" ? " ▲" : " ▼"}</span>
                )}
              </th>
            ))}
            <th style={styles.th} />
          </tr>
        </thead>
        <tbody>
          {pageRows.length === 0 ? (
            <tr>
              <td colSpan={COLUMNS.length + 2} style={styles.empty}>
                No results
              </td>
            </tr>
          ) : (
            pageRows.map((employee) => (
              <tr key={employee.id} style={styles.row} onClick={() => setEditingId(employee.id)}>
                <td style={styles.td} onClick={(event) => event.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={checkedRows.has(employee.id)}
                    onChange={() => toggleChecked(employee.id)}
                  />
                </td>
                <td style={styles.td}>
                  <span
                    style={{
                      ...styles.dot,
                      background: employee.online ? "#22c55e" : "#d4d4d4",
                    }}
                  />
                  {employee.name}
                </td>
                <td style={styles.td}>{employee.role}</td>
                <td style={styles.td}>{employee.team}</td>
                <td style={styles.td}>{employee.startYear}</td>
                <td style={styles.actions}>
                  <button onClick={(event) => handleFavoriteClick(event, employee.id)}>
                    {employee.favorite ? "★" : "☆"}
                  </button>
                  <button onClick={(event) => handleDelete(event, employee.id)}>Delete</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div style={styles.footer}>
        <button onClick={emailSelected}>Email selected</button>
        <div style={styles.pager}>
          <button disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            Prev
          </button>
          <span>
            Page {page + 1} of {pageCount}
          </span>
          <button disabled={page >= pageCount - 1} onClick={() => setPage((p) => p + 1)}>
            Next
          </button>
        </div>
      </div>

      {editing && (
        <EditPanel
          key={editing.id}
          employee={editing}
          onSave={handleSave}
          onClose={() => setEditingId(null)}
        />
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 760,
    margin: "40px auto",
    fontFamily: "system-ui, sans-serif",
  },
  toolbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  heading: {
    fontSize: 16,
    margin: 0,
  },
  badge: {
    marginLeft: 8,
    padding: "2px 8px",
    fontSize: 12,
    fontWeight: 500,
    borderRadius: 999,
    background: "#dcfce7",
    color: "#166534",
  },
  search: {
    padding: "6px 10px",
    fontSize: 13,
    width: 240,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 13,
  },
  th: {
    textAlign: "left",
    padding: "8px 10px",
    borderBottom: "2px solid #eee",
  },
  sortableTh: {
    textAlign: "left",
    padding: "8px 10px",
    borderBottom: "2px solid #eee",
    cursor: "pointer",
    userSelect: "none",
  },
  row: {
    cursor: "pointer",
  },
  td: {
    padding: "8px 10px",
    borderBottom: "1px solid #f2f2f2",
  },
  actions: {
    padding: "8px 10px",
    borderBottom: "1px solid #f2f2f2",
    whiteSpace: "nowrap",
  },
  dot: {
    display: "inline-block",
    width: 8,
    height: 8,
    borderRadius: "50%",
    marginRight: 8,
  },
  empty: {
    padding: 24,
    textAlign: "center",
    color: "#888",
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    fontSize: 13,
  },
  pager: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
};

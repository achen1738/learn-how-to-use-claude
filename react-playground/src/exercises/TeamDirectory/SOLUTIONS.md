# Team Directory: Answer Key

Spoilers below. Each entry gives the root cause, the fix, and what a strong senior answer covers beyond the fix.

## Suggested order

Fix **9** (presence polling) first. It re-renders the table every 3 seconds and undoes changes, which hides or confuses almost every other bug. Bug **4** is only visible *because* of that re-render: once polling is fixed, the checkbox seems to never tick at all.

Fixing **6** (in-place sort) also changes **8**: while the sort mutates `employees`, the visible order and the array order match, so deleting on a sorted page 1 deletes the right person by accident. Once the sort stops mutating state, deleting on a sorted page breaks too. Spotting that interaction is a strong signal.

---

## 1. Favorite star also opens the editor

**Cause:** The click on the star button bubbles up to the `<tr>`, whose `onClick` sets `editingId`. The Delete button has the same problem. It's just hidden, because the editor can't open for a person who was deleted (until bug 8 deletes the wrong person, or bug 9 brings them back and the editor pops open by itself).

**Fix:** Stop propagation on the actions cell, the same way the checkbox cell already does, so it covers both buttons.

**Senior signal:** Notes that a clickable `<tr>` is an accessibility problem in its own right (not focusable, no role), and suggests a real button or link for "edit" instead of relying on row clicks.

## 2. "No results" after searching on a later page

**Cause:** `page` isn't reset when `query` changes. Page 5 of a 1-page result set is empty.

**Fix:** Reset `page` to 0 in the search `onChange` handler (and when sorting, if desired). Better still, clamp when rendering: `const safePage = Math.min(page, pageCount - 1)`, so any change that shrinks the list (search, delete) can't strand the user.

**Senior signal:** Resets in the event handler rather than a `useEffect(() => setPage(0), [query])`, which causes an extra render with the empty state first. Mentions that deleting the last row on the last page has the same problem, which is why clamping is the more robust fix.

## 3. "N online" badge never changes

**Cause:** `useMemo(..., [])` is missing `employees` in its dependency array, so it computes once on mount and never again.

**Fix:** Add `employees` to the dependencies, or drop `useMemo` entirely. Filtering 23 items is trivial, and memoizing it adds complexity without benefit.

**Senior signal:** Questions whether the memo is needed at all, and mentions the `react-hooks/exhaustive-deps` lint rule would have caught this.

## 4. Checkbox doesn't tick until later

**Cause:** `toggleChecked` mutates the existing `Set` and passes the *same* object to `setCheckedRows`. React compares with `Object.is`, sees no change and skips the render. Because the checkbox is controlled, React resets it to the old value. The tick only appears when something else re-renders the component, which is the presence poll every 3 seconds.

**Fix:** Create a new `Set` each time:

```js
setCheckedRows((prev) => {
  const next = new Set(prev);
  next.has(id) ? next.delete(id) : next.add(id);
  return next;
});
```

**Senior signal:** Explains *why* the tick appears later (an unrelated re-render reads the mutated set), not just that mutation is bad. Uses a functional update.

## 5. Selection jumps to other people

**Cause:** Two related problems. Selection is stored by **row position on the current page** (`index`) instead of by employee `id`, so sorting or paging leaves the same positions ticked with different people in them. Rows are also keyed by `index`, so React reuses DOM nodes by position, not identity.

**Fix:** Store selected **ids** (`Set<number>`), check with `checkedRows.has(employee.id)`, and use `key={employee.id}`. `emailSelected` should look employees up by id from the full list, not `pageRows`, so selections on other pages are included.

**Senior signal:** Asks the product question: should selection survive filtering and paging? With ids, it can. Also decides what happens to selected ids when that person is deleted.

## 6. Sort can't be turned off

**Cause:** When there's no search query, `visible` *is* the `employees` state array, and `.sort()` sorts in place. That mutates React state, so there's no original order left to return to.

The "snaps back a few seconds later" part comes from bug 9: the next presence poll rebuilds the list from its stale copy of the *original* array, which happens to restore the order. After fixing 9, the table stays sorted for good, which makes this bug easier to see.

**Fix:** Copy before sorting: `[...visible].sort(...)` or `visible.toSorted(...)`.

**Senior signal:** Mentions that derived data like this should be computed without touching state, and that `useMemo` keyed on `[employees, query, sort]` is reasonable for larger lists. Bonus: notices the initial state *is* the imported `EMPLOYEES` array, so sorting before the first state update mutates the module-level constant itself, and that mutation would survive unmounting and remounting the component.

## 7. Editor shows the previous person's data

**Cause:** `EditPanel` copies its prop into state with `useState(employee)`. The initial value is only used on first mount. Clicking another row changes the `employee` prop but the component stays mounted, so `draft` still holds Priya. `handleSave` then replaces the employee matching `editingId` (Marcus) with Priya's draft, including Priya's `id`, creating a duplicate id.

**Fix:** Remount the panel per person with `<EditPanel key={editing.id} ... />`. In `handleSave`, also keep the id from the employee being edited (`{ ...updated, id: editingId }`) so a draft can never overwrite another record's identity.

**Senior signal:** Reaches for `key` rather than a `useEffect` that syncs props into state. Mentions the duplicate id would break any id-based keys or lookups later. May also ask whether switching rows with unsaved changes should prompt the user.

## 8. Deleting removes the wrong person

**Cause:** `handleDelete(index)` receives the row's position **on the current page of the filtered/sorted view**, but filters the full `employees` array by that position. They're only the same on page 1 with no filter (and, accidentally, while bug 6 keeps `employees` in sorted order).

**Fix:** Delete by id: `prev.filter((employee) => employee.id !== id)`.

**Senior signal:** Generalizes it: never use a view index to address source data. Also clears the deleted id from the selection and closes the editor if that person was being edited.

## 9. Changes are undone a few seconds later; polling never stops

**Cause:** Three problems in one effect:

1. **Stale closure:** the interval callback captured `employees` from the first render. Every tick rebuilds the list from that original snapshot, wiping out edits and bringing deleted people back.
2. **No cleanup:** the interval is never cleared, so it keeps running (and logging) after the component unmounts.
3. **StrictMode:** in development React mounts effects twice, so without cleanup there are **two** intervals, and the console logs twice per tick. This is the hint that cleanup is missing.

**Fix:**

```js
useEffect(() => {
  const intervalId = setInterval(() => {
    setEmployees((prev) =>
      prev.map((employee) => ({ ...employee, online: Math.random() < 0.35 }))
    );
  }, 3000);
  return () => clearInterval(intervalId);
}, []);
```

**Senior signal:** Explains why adding `employees` to the dependency array would "work" but tear down and recreate the interval on every update, versus a functional update, which keeps one stable interval. Bonus: suggests storing presence separately (for example, a `Map<id, boolean>`) so a presence feed never touches editable employee data at all.

## 10. Accessibility

- Put a `<button>` inside each sortable `<th>` so it's focusable and works with Enter/Space, and set `aria-sort="ascending" | "descending" | "none"` on the `<th>`.
- Give each checkbox an accessible name, e.g. `aria-label={`Select ${employee.name}`}`.
- Move focus into the editor when it opens (first input), and back to the row's edit control when it closes. Escape should cancel.
- Announce result counts after searching with an `aria-live="polite"` region ("3 results").
- The presence dot conveys meaning by color only. Add visually hidden text such as "online".

## 11. Stretch: testable table logic

Extract pure functions, `filterRows(rows, query)`, `sortRows(rows, sort)` and `paginate(rows, page, pageSize)`, or a `useTableView(rows, { query, sort, page, pageSize })` hook that returns `{ pageRows, pageCount, safePage }`. Each can be unit tested without rendering. Strong answers note that most bugs in this exercise (2, 6, 8) would have been caught by small tests on those functions.

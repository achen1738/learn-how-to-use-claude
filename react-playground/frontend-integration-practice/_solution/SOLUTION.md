# Solution walkthrough

Reference code lives in `_solution/src/` and mirrors `src/`. To try it:
copy `_solution/src/*` over `src/` (back yours up first), then run `npm test` and
`npm run test:acceptance`. It passes both.

This isn't the only good answer. What follows is what a strong candidate does, and
what interviewers watch for at each step.

---

## 0. The first 10 minutes (Ability to help yourself)

Strong signals:
- Reads the spec **and** the docs before typing. Notices that `docs/API.md` says
  requests are cancellable via `AbortSignal` and that latency *varies with how
  broad the search is*. That's the clue for BUG-102.
- Runs `npm test` first to get a green baseline.
- Opens the running app and reproduces both bugs before fixing them.
- Sees that `useUrlState` returns **strings only** and merges patches; reads its
  tests to confirm behaviour instead of guessing.

Weak signals: starts building a search box from scratch with `<input>`, installs
lodash for `debounce`, or writes a new fetch hook beside `useTickets`.

---

## Parts 1–3: search, filters, URL (Abstractions)

**Key insight:** the URL *is* the state. Don't keep `useState` for filters and
then try to sync it to the URL. Two sources of truth drift apart.

The reference adds `hooks/useTicketFilters.ts`, a thin, typed wrapper over
`useUrlState`:
- maps URL keys (`q`, `status`, `priority`, `page`) → typed `TicketFilters`
- **validates** with the existing `isTicketStatus` / `isTicketPriority` guards and
  parses `page` (bad values become defaults, so `?page=banana` is fine)
- exposes intent-named setters, and **every filter setter also resets `page` to '1'**.
  Putting the reset rule in one place beats remembering it in three `onChange`s.
  (A `useEffect` that resets page when filters change is a common weaker answer:
  it causes an extra render and an extra request for the stale page.)

Then in `App.tsx`:
- The input is bound to `filters.search` (instant feedback), and
  `useDebouncedValue(filters.search, 300)` feeds the query. Debounce the **value**
  sent to the server, not the input.
- `'' → undefined` when building the `TicketQuery`, so "All" means "no filter".
- `TicketToolbar` is a small presentational component that composes `TextInput`
  and two `Select`s with the existing `STATUS_OPTIONS` / `PRIORITY_OPTIONS`.
- Empty state: check `data.total === 0` and render `EmptyState`.

Discussion points an interviewer may raise:
- *Should typing write to the URL on every keystroke?* It uses `replaceState`, so
  there are no history entries; cheap. Writing the debounced value instead is also
  fine. Be able to defend either.
- *Why not filter on the client?* Pagination is server-side; you only have 10 rows.

---

## Part 4: loading & errors

- `ErrorBanner message="Couldn't load tickets." onRetry={refetch}`. `refetch`
  already existed on `useTickets`; spotting that is the point.
- Keep `Spinner` only for the *first* load. On later loads, keep the old rows
  visible (the hook already keeps `data`) and dim them (`aria-busy`). No flashing.

---

## Part 5: bugs (Correctness / Debugging)

### BUG-101: last page missing
`Pagination` computed `Math.floor(61 / 10) = 6`. Fix: `Math.max(1, Math.ceil(total / pageSize))`.

Why it slipped through: every existing test used a total that divides evenly
(50 / 10). The fix pulls the math into an exported `getTotalPages` with a
table-driven test (`50→5, 51→6, 61→7, 9→1, 0→1`).

Good talking point: `Pagination` is a **shared** component. Mention that the fix
affects every screen that uses it, and that it's a bug fix, so that's desired, but
you'd flag it in the PR.

### BUG-102: stale search results (race condition)
`useTickets` fires a request whenever the query changes but never cancels the
previous one. The mock makes 1–2 character searches slow (~900ms) and longer ones
fast (~250ms), so:

```
t=0      "bi" request starts   (900ms)
t=~450   "billing" request starts (250ms)
t=~700   "billing" response → table correct
t=900    "bi" response → overwrites with WRONG results, also flips isLoading off early
```

Debouncing reduces how often this happens but **does not fix it**. Saying "I
added a debounce so it's fixed" is a classic miss.

Fix (in `useTickets`): create an `AbortController` per effect run, pass its
`signal` to `fetchTickets`, and `abort()` in the effect cleanup. Ignore results and
errors from aborted requests (an `AbortError` is not a real failure, so don't show
the error banner). An `ignore` flag in the cleanup works too; aborting is better
because it also stops the network work.

Test: `useTickets.test.ts` uses fake timers + `apiConfig.setLatency(null)`,
renders with `'bi'`, rerenders with `'billing'`, advances 250ms, then advances
past 900ms and asserts the data is still the `billing` results.

---

## Bonus: Assign to me (optimistic update)

- `useTickets` gains `updateTicketLocally(id, updater)`, which patches one row in
  `data`. Extending the existing hook beats keeping a second copy of the rows in
  `App` state.
- `TicketTable` gains an **optional** `renderActions` prop that adds an "Actions"
  column only when provided, so its existing tests keep passing unchanged. A render
  prop keeps the table generic instead of teaching it about assignment.
- `useAssignToMe` does: remember previous assignee → optimistic update → `await
  updateTicket` → on error roll back to the *previous* value and set the error
  message. A `pendingIds` set disables the button during the request.

Edge cases worth naming (even if not implemented):
- The page changes or refetches while a save is in flight. The rollback targets a
  row that may no longer be loaded (harmless here: `map` finds nothing).
- Two quick actions on the same ticket: the pending guard prevents it.
- Should a successful save refetch? Not needed here; the server echoes the ticket.

---

## Testing: what to test (Correctness/Testing)

Prioritise behaviour a user or QA would notice:
1. Regression tests for **both bugs** (most important; the spec asked for them).
2. `useTicketFilters`: parsing/validation of bad URL values, page reset rule.
3. One integration test through `App` for search + filter + URL (RTL + user-event).
4. Optimistic update success **and** rollback.

Query by role/label (`getByLabelText('Status')`, `getByRole('button', { name: 'Retry' })`),
not class names. That's also how the acceptance suite is written.

## Interaction & collaboration

Things interviewers note positively:
- Asking a clarifying question early ("Should the URL update while typing or after
  the debounce?") and stating the assumption if there's no answer.
- Saying out loud *"`src/api` is owned by another team, so I'll fix the race in our
  hook rather than in the client."*
- Leaving time at the end to run the full suite and walk through the diff.

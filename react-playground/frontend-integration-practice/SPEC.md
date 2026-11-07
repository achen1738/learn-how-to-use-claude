# Support Inbox: Search, Filters & Bug Fixes

**Timebox:** 75 minutes (Parts 1–5). The bonus is only if you have time left.
**Stack:** React 18, TypeScript, Vitest, React Testing Library, date-fns.

## Context

You've joined the team that builds **Support Inbox**, the tool our support agents
use to work through customer tickets. Right now the app can only page through
every ticket. Agents have asked for search and filters, and QA has filed two bugs.

This is an existing codebase. Before you write anything, spend 5–10 minutes reading:

- `docs/API.md`: the tickets API client (owned by another team; **don't edit `src/api/`**)
- `docs/COMPONENTS.md`: shared UI components and hooks you're expected to reuse
- `src/App.tsx`, `src/hooks/useTickets.ts`, `src/components/TicketTable.tsx`

## Ground rules

- **Reuse what exists.** There are already components and hooks for most of what
  you need. Don't add new npm packages unless you can explain why.
- **Don't break anything.** `npm test` passes today and must still pass when you're
  done. If you change a shared component, keep its existing behaviour.
- **Test your changes.** Add or update tests for what you build and fix. We care
  more about *what* you chose to test than how many tests you write.
- **Think out loud.** Explain your trade-offs as you go, as if an interviewer
  were sitting next to you.

---

## Part 1: Search

Add a search box above the table.

- It must be labelled **`Search tickets`** (the label can be visually hidden).
- Searching matches ticket ID, subject and customer. The API already supports
  this; use it rather than filtering on the client.
- Don't send a request on every keystroke. Wait until the user has paused
  typing for **300ms**.
- The input itself must stay responsive while typing.
- When no tickets match, show an empty state with the title
  **`No tickets match your filters`** instead of an empty table.

## Part 2: Filters

Add two dropdowns next to the search box.

- **`Status`**: options *All*, Open, Pending, Resolved, Closed.
- **`Priority`**: options *All*, Low, Medium, High, Urgent.
- The option `value`s must be the API values (`open`, `urgent`, …), with `""` for *All*.
- Search and both filters combine (AND).
- Changing the search text or either filter takes the user **back to page 1**.

## Part 3: Shareable URLs

Agents paste inbox links to each other in chat. The current search, filters and
page must live in the URL query string, so a reload or a shared link shows the
same view.

| State    | Query param | Example        |
| -------- | ----------- | -------------- |
| Search   | `q`         | `?q=refund`    |
| Status   | `status`    | `?status=open` |
| Priority | `priority`  | `?priority=high` |
| Page     | `page`      | `?page=3`      |

- Default values should not appear in the URL.
- A hand-edited URL with a bad value (`?page=banana`, `?status=nope`) must not crash
  or send an invalid request. Fall back to the default.

## Part 4: Loading & error states

- While the first page is loading, show the loading indicator.
- If loading fails, show an error banner reading **`Couldn't load tickets.`** with a
  **Retry** button that retries the request.

## Part 5: Bug reports from QA

> **BUG-101: Oldest ticket is missing**
> *Reported by: QA.* There are 61 tickets in the seed data but I can only page up
> to page 6. Ticket T-0001 never shows up in the list.

> **BUG-102: Search results don't match the search box**
> *Reported by: an agent.* If I type quickly (e.g. "bi", pause, then keep typing
> "billing") the table sometimes shows results for the *earlier* text, even
> though the box says "billing". Happens most on slow connections.

For each bug: find the root cause, fix it, and add a test that would have caught it.
Be ready to explain why the bug happened.

---

## Bonus: Assign to me

Agents want to claim a ticket without leaving the list.

- Add an **`Assign to me`** button to each row whose ticket isn't already assigned
  to the signed-in user (see `useCurrentUser`).
- Clicking it updates the row **immediately** (optimistic update), then saves via
  `updateTicket`.
- If the save fails, put the row back how it was and show an error banner reading
  **`Couldn't assign <ID>. Please try again.`** (e.g. `Couldn't assign T-0007. Please try again.`).
- Don't let the user fire duplicate requests for the same ticket while one is in flight.

---

## When you're done

1. `npm test` and `npm run typecheck` pass.
2. Run `npm run test:acceptance`. This is a hidden-style test suite that checks the
   spec from the outside (labels, text, URL). In the real interview you wouldn't
   have this; here it shows you what you missed.
3. Compare your approach with `_solution/SOLUTION.md`.

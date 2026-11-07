# Tickets API client

`src/api/client.ts`. Owned by the Platform team. **Don't modify `src/api/`**; if you
think it's wrong, say so and work around it.

The client talks to a fake in-memory backend, but behaves like a real network API:
every call is async, takes time, can fail, and can be cancelled.

## Types (`src/api/types.ts`)

| Type          | Shape |
| ------------- | ----- |
| `Ticket`      | `{ id, subject, customer, status, priority, assignee: string \| null, createdAt }` |
| `TicketStatus`   | `'open' \| 'pending' \| 'resolved' \| 'closed'` |
| `TicketPriority` | `'low' \| 'medium' \| 'high' \| 'urgent'` |
| `TicketQuery` | `{ query?, status?, priority?, page, pageSize }`. `page` is 1-based. |
| `Page<T>`     | `{ items: T[], total, page, pageSize }`. `total` counts all matches, not just this page. |
| `TicketPatch` | Partial of `assignee`, `status`, `priority` |

## `fetchTickets(params, options?) → Promise<Page<Ticket>>`

`GET /tickets`. Returns one page of matching tickets, **newest first**.

- `query`: case-insensitive substring match against ID, subject and customer.
  Leading/trailing whitespace is ignored. Omit (or `''`) for no search.
- `status`, `priority`: exact match. Omit for "any".
- `page` must be an integer ≥ 1, otherwise rejects with `ApiError` 400.
- A page past the end returns `items: []` with the real `total`.
- **Latency:** response times vary, roughly 250ms to 1s depending on how broad the search is.

## `updateTicket(id, patch, options?) → Promise<Ticket>`

`PATCH /tickets/:id`. Applies `patch` and resolves with the saved ticket.

- Rejects with `ApiError` **404** if the ticket doesn't exist.
- Rejects with `ApiError` **409** if another agent edited the ticket first. The mock
  simulates this for every ticket whose number is divisible by 7 (T-0007, T-0014, …),
  so you can see failures in the running app.

## Options

Both functions accept `{ signal?: AbortSignal }`. Aborting rejects the promise with
a `DOMException` whose `name` is `'AbortError'`.

## Errors

Failures reject with `ApiError` (`err.status` holds the HTTP status code).

## Dev & test controls: `apiConfig`

| Call | Effect |
| ---- | ------ |
| `apiConfig.setLatency(ms)` | Every request takes exactly `ms`. `null` restores realistic latency. |
| `apiConfig.failNextRequest()` | The next request (fetch or update) rejects with `ApiError` 500. |
| `apiConfig.reset()` | Back to defaults. |

`src/test/setup.ts` runs before **every** test: it resets the database (`resetDb()`),
resets `apiConfig`, sets latency to **0ms**, and clears the URL. Call
`apiConfig.setLatency(null)` in a test if you need realistic timing.

## Seed data

61 tickets, `T-0001` (oldest) to `T-0061` (newest), generated from a fixed seed, so
they're identical on every run. `T-0007` and `T-0012` are always unassigned.

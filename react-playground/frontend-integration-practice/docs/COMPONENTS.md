# Shared components & hooks

Everything here is used elsewhere in the (imaginary) wider product. Prefer reusing
these over writing new ones. If you change one, its existing tests must still pass.

## UI components (`src/components/ui/`)

### `TextInput`
Labelled text input. Calls `onChange` with the **string value**, not the event.

| Prop | Type | Notes |
| ---- | ---- | ----- |
| `label` | `string` | Required. Associated with the input via `htmlFor`. |
| `value` | `string` | Controlled. |
| `onChange` | `(value: string) => void` | |
| `hideLabel` | `boolean?` | Visually hides the label; still accessible. |
| …rest | input attributes | `placeholder`, `type`, `autoFocus`, etc. |

### `Select<T>`
Labelled native `<select>`, generic over the option value type.

| Prop | Type | Notes |
| ---- | ---- | ----- |
| `label` | `string` | Required. |
| `value` | `T \| ''` | `''` selects the placeholder option. |
| `options` | `readonly { value: T; label: string }[]` | |
| `onChange` | `(value: T \| '') => void` | |
| `placeholder` | `string?` | Renders an extra first option with value `''`. |
| `disabled` | `boolean?` | |

### `Pagination`
"Previous / Page X of Y / Next" control. Renders nothing when `total` is 0.
Props: `page` (1-based), `pageSize`, `total`, `onPageChange(page)`.

### `Button`
Props: `variant?: 'primary' | 'secondary'`, `size?: 'sm' | 'md'`, plus all button attributes.
Defaults to `type="button"`.

### `Badge`
Small coloured pill. Props: `tone?: 'neutral' | 'info' | 'success' | 'warning' | 'danger'`.

### `Feedback.tsx`
- **`Spinner`**: loading indicator, `role="status"`. Optional `label`.
- **`EmptyState`**: `title`, optional `description` and `action` (any node).
- **`ErrorBanner`**: `role="alert"`. `message`; optional `onRetry` (shows **Retry**)
  and `onDismiss` (shows **Dismiss**).

## Feature components (`src/components/`)

### `TicketTable`
Renders tickets as a table (`aria-label="Tickets"`). Props: `tickets: Ticket[]`.

## Hooks (`src/hooks/`)

### `useTickets(query) → { data, isLoading, error, refetch }`
Loads a page of tickets for `query` and re-fetches whenever any field of `query`
changes. `data` holds the last page received and is kept while a new one loads.

### `useDebouncedValue(value, delayMs) → value`
Returns `value` only once it has stopped changing for `delayMs`.

### `useUrlState(defaults) → [state, setState]`
Like `useState`, but the state is stored in the URL query string.
- Only manages the keys in `defaults`; other query params are left untouched.
- **All values are strings.** Parse and validate them yourself.
- Values equal to their default (or `''`) are removed from the URL.
- `setState(patch)` **merges** a partial object (like class-component `setState`).
- Keep `defaults` stable (define it outside the component). It's read once on mount.

## Other

- `src/auth/useCurrentUser.ts`: `useCurrentUser()` returns the signed-in agent `{ id, name }`.
- `src/constants.ts`: `STATUS_OPTIONS`, `PRIORITY_OPTIONS` (ready for `Select`),
  label/tone maps, and the `isTicketStatus` / `isTicketPriority` type guards.

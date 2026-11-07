# 12 · Data Table

**Time:** 50–60 min · plain CSS in `DataTable.css` only.

Build a styled, sortable table of the 40 users in `USERS` from
`DataTable.jsx`.

## Requirements

### Layout and scrolling

- Use a real `<table>` with `<thead>`, `<tbody>` and `<th scope="col">`.
- The table sits in a box **400px tall** that scrolls in both directions.
  The table is wider than the box on most screens (there are a lot of
  columns), so it scrolls sideways too.
- The **header row stays visible** while scrolling down.
- The **Name column stays visible** while scrolling sideways.
- The top-left corner cell (Name header) stays put in both directions and
  is never covered by other cells.

### Styling

- Rows alternate background color (zebra stripes), and the hovered row is
  highlighted.
- Comfortable padding, a 1px line between rows, no vertical lines.
- **Status** shows as a colored pill: Active (green), Invited (blue),
  Suspended (red).
- **Numbers** (Seats, MRR) are right-aligned with digits lined up
  (`tabular-nums`). Money is formatted as currency.
- **Email** is cut off with "…" when it doesn't fit in 220px, with the full
  address available on hover.
- Text in header cells doesn't wrap.

### Sorting

- Clicking a column header sorts by it, ascending first, then descending.
- The header is a `<button>` inside the `<th>`, and the `<th>` gets
  `aria-sort="ascending" | "descending"` (or none).
- An arrow (▲/▼) shows the sort direction, and a faint ↕ shows on sortable
  headers that aren't sorted. The arrow must not shift the column's width
  when it appears.

## Stretch

- **Row selection:** a checkbox column (sticky, left of Name) and a "Select
  all" checkbox in the header with an indeterminate state.
- **Phone (below 600px):** turn each row into a stacked card, with each
  value labeled by its column name (use `data-label` + `::before`).
- A **density toggle** (comfortable / compact) that changes one CSS
  variable.

## What's being evaluated

- **Table semantics** and why a `<table>` beats a grid of `<div>`s here.
- **`position: sticky` in tables:** the header, the first column and the
  corner, and the `z-index` order between them.
- **`border-collapse`** and why sticky cells lose their borders.
- **Truncation** in table cells (it needs a width).
- **Number alignment** and `font-variant-numeric`.

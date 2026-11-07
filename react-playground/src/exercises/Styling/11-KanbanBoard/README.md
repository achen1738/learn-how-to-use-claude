# 11 · Kanban Board

**Time:** 50–60 min · plain CSS in `KanbanBoard.css` only.

Build a Kanban board from `COLUMNS` and `CARDS` in `KanbanBoard.jsx`. This
one is mostly about **scrolling inside nested flex/grid layouts**, which is
where a lot of real-world CSS bugs live.

## Requirements

### Board

- The board is a fixed-height area: **600px tall** (or the rest of the
  window, your call).
- Columns are **280px wide** each, side by side with a 16px gap. When they
  don't all fit, **the board scrolls sideways**. The page itself must not
  get a horizontal scrollbar.

### Columns

- Each column has a light grey background, rounded corners, and a header
  with the column name and a **card count** pill ("To do  4").
- When a column has more cards than fit, **that column scrolls on its own**,
  vertically. The header stays visible at the top while its cards scroll.
- An **empty column** shows a dashed "No cards" placeholder.

### Cards

- White, rounded, small shadow. Shows the title, a row of **tag pills**
  (they wrap onto more lines when there are many) and the assignee's initials
  in a small circle at the bottom right.
- Long titles wrap; extremely long words (see the URL card) don't overflow.
- **←** and **→** buttons move the card to the previous or next column. They're
  disabled in the first and last columns.
- Cards with `priority: "high"` have a red left border.

## Stretch

- **Drag and drop** with the HTML drag-and-drop API: the card being dragged
  looks faded, and the column you're over gets a highlighted outline.
- **Phone:** columns snap one at a time when swiping sideways
  (`scroll-snap`).
- "+ Add card" button at the bottom of each column that stays pinned below
  the scrolling list.

## What's being evaluated

- **Nested scrolling:** `overflow` on the right element, and the
  `min-height: 0` / `min-width: 0` rule for flex and grid children.
- **Fixed-width columns** that don't shrink (`flex: 0 0 280px`).
- **`position: sticky`** inside a scroll container, or a flex column with
  a scrolling middle.
- **Wrapping** for tags and long words.
- **Immutable state updates** for moving cards.

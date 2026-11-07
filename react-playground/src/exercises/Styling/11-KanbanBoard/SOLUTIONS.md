# 11 · Kanban Board: Solution Notes

Spoilers below.

## State

Keep the flat `CARDS` list in state and group by `columnId` when rendering.
Moving a card is then one immutable update:

```js
function move(cardId, dir) {
  setCards((prev) => prev.map((c) => {
    if (c.id !== cardId) return c;
    const i = COLUMNS.findIndex((col) => col.id === c.columnId);
    return { ...c, columnId: COLUMNS[i + dir].id };
  }));
}
```

The count pill is derived (`cardsInColumn.length`), not stored.

## The scroll chain

Picture what scrolls:

```
.kanban            fixed height, scrolls sideways   (overflow-x: auto)
  .kanban__column  full height, does NOT scroll     (flex column)
    header         fixed size
    .kanban__list  takes the rest, scrolls down     (overflow-y: auto)
```

```css
.kanban {
  display: flex;
  gap: 16px;
  height: 600px;
  overflow-x: auto;
  padding-bottom: 8px; /* room for the scrollbar */
}

.kanban__column {
  flex: 0 0 280px;
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: #f3f4f6;
  border-radius: 12px;
}

.kanban__header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 12px 8px;
  font-weight: 600;
}

.kanban__list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 4px 12px 12px;
  margin: 0;
  list-style: none;
}
```

- `flex: 0 0 280px`: don't grow, don't shrink, 280px. With plain
  `width: 280px`, flex items shrink to fit, so the board squashes the columns
  instead of scrolling.
- **`min-height: 0` on the list** is what makes it scroll. Flex items
  default to `min-height: auto` ("at least as tall as my content"), so the
  list grows past the column and the column overflows the board instead.
  If you get this wrong, the board itself scrolls vertically.
- The header doesn't need `position: sticky`: it's outside the scrolling
  list, so it never moves. Sticky is the alternative if the whole column
  scrolls (`overflow-y: auto` on the column, `position: sticky; top: 0` on
  the header, with a background so cards don't show through).

## The page must not scroll sideways

The same `min-width: auto` rule applies sideways. A flex child won't shrink
below its content's width, so a 5 × 280px board inside a flex layout can
push every ancestor wider than the window, and the whole page scrolls
instead of the board.

The playground's `<main>` already has `min-width: 0` for this reason (look
at `App.jsx`). In an interview, if the page scrolls sideways, walk up the
ancestors in DevTools until you find the flex or grid item that won't
shrink, and give it `min-width: 0`. Saying "a flex ancestor needs
`min-width: 0`" out loud is exactly the debugging interviewers want to see.

## Cards

```css
.kanban__card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: #fff;
  border-radius: 8px;
  border-left: 4px solid transparent;
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.08);
}
.kanban__card--high { border-left-color: #dc2626; }

.kanban__title { margin: 0; overflow-wrap: anywhere; }

.kanban__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  list-style: none;
  margin: 0;
  padding: 0;
}
.kanban__tag {
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 12px;
  background: #eef2ff;
  color: #3730a3;
}

.kanban__footer { display: flex; align-items: center; gap: 4px; }
.kanban__avatar {
  margin-left: auto;
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  font-size: 12px;
  background: #e5e7eb;
}
```

- The transparent left border on every card keeps high-priority cards the
  same width as the others.
- `overflow-wrap: anywhere` breaks the long URL. `word-break: break-all`
  works too but also breaks normal words mid-word.
- Move buttons: `aria-label="Move to In review"`, not just an arrow.

## Empty column

```css
.kanban__empty {
  padding: 24px;
  text-align: center;
  color: #6b7280;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
}
```

## Stretch: drag and drop

- Card: `draggable`, `onDragStart` stores the id
  (`e.dataTransfer.setData("text/plain", id)`) and sets a `draggingId`
  state for the faded class.
- Column: `onDragOver={(e) => e.preventDefault()}` (required, or drop never
  fires), `onDragEnter`/`onDragLeave` for the highlight, `onDrop` moves.
- `dragleave` fires when moving over a child element. Track the hovered
  column id in state rather than toggling a boolean on enter/leave.
- Keep the arrow buttons: native drag and drop isn't keyboard accessible.

## Stretch: scroll snap

```css
@media (max-width: 599px) {
  .kanban { scroll-snap-type: x mandatory; }
  .kanban__column { flex-basis: 85vw; scroll-snap-align: start; }
}
```

85vw shows a sliver of the next column, so users know they can swipe.

## Common mistakes

- Columns shrink instead of the board scrolling (`width` without
  `flex-shrink: 0`).
- The whole board scrolls vertically instead of each column (missing
  `min-height: 0`).
- Fixed `height` on cards, so long titles overflow.
- Storing column counts in state.

# 12 · Data Table: Solution Notes

Spoilers below.

## Sorting

```js
const [sort, setSort] = useState({ key: null, dir: "asc" });

const rows = useMemo(() => {
  if (!sort.key) return USERS;
  const sorted = [...USERS].sort((a, b) => {
    const x = a[sort.key], y = b[sort.key];
    return typeof x === "number" ? x - y : String(x).localeCompare(String(y));
  });
  return sort.dir === "asc" ? sorted : sorted.reverse();
}, [sort]);

function onSort(key) {
  setSort((s) => s.key === key
    ? { key, dir: s.dir === "asc" ? "desc" : "asc" }
    : { key, dir: "asc" });
}
```

Copy before sorting (`[...USERS]`), since `.sort()` changes the array in
place. ISO dates sort correctly as strings.

## Header cell

```jsx
<th
  scope="col"
  aria-sort={sort.key === col.key ? (sort.dir === "asc" ? "ascending" : "descending") : undefined}
  className={`data-table__th ${col.align === "end" ? "data-table__num" : ""}`}
>
  <button className="data-table__sort" onClick={() => onSort(col.key)}>
    {col.label}
    <span className="data-table__arrow" aria-hidden="true">
      {sort.key === col.key ? (sort.dir === "asc" ? "▲" : "▼") : "↕"}
    </span>
  </button>
</th>
```

The arrow slot is **always** rendered (↕ when unsorted), so the column width
never jumps when sorting starts. `aria-hidden` because `aria-sort` already
tells screen readers the direction.

## Scroll box and table

```css
.data-table__wrap {
  max-height: 400px;
  overflow: auto;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.data-table {
  --data-table-pad: 10px 12px;
  border-collapse: separate;
  border-spacing: 0;
  min-width: 100%;
  font-size: 14px;
}

.data-table th,
.data-table td {
  padding: var(--data-table-pad);
  text-align: left;
  white-space: nowrap;
  border-bottom: 1px solid #e5e7eb;
  background: var(--data-table-row-bg, #fff);
}
```

**`border-collapse: separate`**, not `collapse`. With collapsed borders, the
borders belong to the table, not the cells, so when a sticky cell moves, its
border stays behind and content scrolls through the gap. Separate borders +
`border-spacing: 0` looks the same and the borders travel with the cells.

**Every cell has a background.** Sticky cells are see-through by default, so
rows scrolling underneath show through.

## Sticky header, column and corner

```css
.data-table thead th {
  position: sticky;
  top: 0;
  z-index: 2;
  background: #f9fafb;
}

.data-table tbody th,
.data-table td:first-child {
  position: sticky;
  left: 0;
  z-index: 1;
}

.data-table thead th:first-child {
  left: 0;
  z-index: 3;
}
```

Layering: body cells (none) < first column (1) < header row (2) < corner (3).
The corner sticks both ways and sits above everything else.

Making the Name cell in each row a `<th scope="row">` is the semantic way
to say "this cell labels the row". Then select it as `tbody th`.

A shadow on the sticky column's right edge helps users see that content is
scrolling under it:
`box-shadow: inset -1px 0 0 #e5e7eb;`

## Zebra and hover

```css
.data-table tbody tr:nth-child(even) { --data-table-row-bg: #f9fafb; }
.data-table tbody tr:hover { --data-table-row-bg: #eef2ff; }
```

Setting a variable on the row, which every cell reads, keeps the sticky
column's background in sync with the rest of the row. Setting `background`
on the `<tr>` doesn't work here, because the cells' own backgrounds cover it.

## Numbers

```css
.data-table__num {
  text-align: right;
  font-variant-numeric: tabular-nums;
}
.data-table__num .data-table__sort { flex-direction: row-reverse; }
```

`tabular-nums` makes every digit the same width, so 1,111 and 8,888 line up.
Right-align the header too, so it sits above its numbers.

## Truncated email

```css
.data-table__email {
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

Truncation needs three things: a width limit, `overflow: hidden` and
`white-space: nowrap` (already on all cells). With `table-layout: auto`,
`max-width` on a cell works in all current browsers; if it doesn't, put the
text in an inner `<span>` with `display: block`. Add `title={email}`.

## Status pills

```css
.data-table__status {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
}
.data-table__status--active    { background: #dcfce7; color: #166534; }
.data-table__status--invited   { background: #dbeafe; color: #1e40af; }
.data-table__status--suspended { background: #fee2e2; color: #991b1b; }
```

Dark text on a light tint passes contrast. White text on a light green
doesn't.

## Stretch: phone cards

```css
@media (max-width: 599px) {
  .data-table thead { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
  .data-table, .data-table tbody, .data-table tr, .data-table td, .data-table tbody th { display: block; }
  .data-table tr { margin-bottom: 12px; border: 1px solid #e5e7eb; border-radius: 8px; }
  .data-table td::before {
    content: attr(data-label);
    display: block;
    font-size: 12px;
    color: #6b7280;
  }
}
```

Hide the header visually (not with `display: none`, which some screen
readers use to drop the table semantics). Changing `display` on table
elements removes table semantics in some browsers; adding `role="table"`,
`role="row"` and `role="cell"` restores it. Mention that trade-off.

## Common mistakes

- `border-collapse: collapse` with sticky cells, so borders vanish.
- Sticky cells without a background, so content shows through.
- Wrong `z-index` order, so the corner cell gets covered.
- A clickable `<th>` with no button inside, so keyboard users can't sort.
- Sorting `USERS` in place.

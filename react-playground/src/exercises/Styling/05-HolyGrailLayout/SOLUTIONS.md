# 05 · Holy Grail Layout: Solution Notes

Spoilers below.

## Markup

```jsx
<div className="holy-grail">
  <header className="holy-grail__header">…</header>
  <nav className="holy-grail__nav" aria-label="Main">…</nav>
  <main className="holy-grail__main">…</main>
  <aside className="holy-grail__aside">…</aside>
  <footer className="holy-grail__footer">…</footer>
</div>
```

Order the JSX by importance (header, nav, main, aside, footer is fine),
then let `grid-template-areas` decide where things go visually.

## Desktop

```css
.holy-grail {
  display: grid;
  min-height: calc(100vh - 48px); /* playground padding */
  grid-template-columns: 220px minmax(0, 1fr) 260px;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "header header header"
    "nav    main   aside"
    "footer footer footer";
}

.holy-grail__header { grid-area: header; }
.holy-grail__nav    { grid-area: nav; }
.holy-grail__main   { grid-area: main; }
.holy-grail__aside  { grid-area: aside; }
.holy-grail__footer { grid-area: footer; }
```

- **Sticky footer:** `min-height` on the grid plus a `1fr` middle row. Short
  content: the middle row grows and pushes the footer to the bottom. Long
  content: the grid grows past `min-height` and the footer follows.
- `minmax(0, 1fr)` instead of `1fr`: a plain `1fr` column won't shrink below
  its content's minimum width, so one long URL or code block could push the
  aside off screen.

## Tablet and phone

```css
@media (max-width: 1023px) {
  .holy-grail {
    grid-template-columns: 220px minmax(0, 1fr);
    grid-template-rows: auto 1fr auto auto;
    grid-template-areas:
      "header header"
      "nav    main"
      "nav    aside"
      "footer footer";
  }
}

@media (max-width: 767px) {
  .holy-grail {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto 1fr auto auto auto;
    grid-template-areas: "header" "main" "nav" "aside" "footer";
  }
}
```

Only the template changes. No JSX changes, no duplicated markup.

**Accessibility trade-off:** visual order now differs from DOM order on
phones, so keyboard Tab order goes nav → main while the screen shows main →
nav. Say this out loud. Options: put `<main>` first in the DOM, or accept it
and add a "Skip to content" link.

## Readable width

```css
.holy-grail__main { padding: 24px; }
.holy-grail__main > * { max-width: 70ch; }
```

`ch` is the width of the "0" character, so `70ch` is roughly 70 characters.

## Stretch: collapsible nav

Animate the grid column itself:

```css
.holy-grail {
  --holy-grail-nav: 220px;
  grid-template-columns: var(--holy-grail-nav) minmax(0, 1fr) 260px;
  transition: grid-template-columns 200ms ease;
}
.holy-grail--collapsed { --holy-grail-nav: 64px; }
.holy-grail__nav { overflow: hidden; white-space: nowrap; }
```

`grid-template-columns` is animatable in current browsers as long as both
values have the same number of tracks. Older approach: transition `width` on
the nav and use `auto` for its column.

Respect `prefers-reduced-motion` by removing the transition there.

## Stretch: sticky header and nav

```css
.holy-grail__header { position: sticky; top: 0; z-index: 1; }
.holy-grail__nav {
  position: sticky;
  top: 56px; /* header height */
  align-self: start;
  max-height: calc(100vh - 56px);
  overflow-y: auto;
}
```

`align-self: start` matters. Grid items stretch to the row's full height by
default, and a nav as tall as the page has nowhere to stick.

## Common mistakes

- Using `height: 100vh` instead of `min-height`, so long content overflows.
- Plain `1fr` columns that get blown out by long words.
- Floats or absolute positioning for the columns.
- Writing the phone layout with `order` on each element instead of areas.
  That works, but it's harder to read and to talk through.

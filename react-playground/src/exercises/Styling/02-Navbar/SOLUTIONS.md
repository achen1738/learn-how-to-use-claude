# 02 · Responsive Navbar: Solution Notes

Spoilers below.

## Markup

Render the links **once** and let CSS decide whether they appear in the row
or the dropdown panel. Duplicating the list for mobile and desktop means two
copies to keep in sync.

```jsx
<header className="navbar">
  <a className="navbar__logo" href="#">Acme</a>
  <button
    className="navbar__toggle"
    aria-expanded={open}
    aria-controls="navbar-menu"
    aria-label={open ? "Close menu" : "Open menu"}
    onClick={() => setOpen((o) => !o)}
  >{open ? "✕" : "☰"}</button>
  <div id="navbar-menu" className={`navbar__menu ${open ? "navbar__menu--open" : ""}`}>
    <nav aria-label="Main">
      <ul className="navbar__links">…</ul>
    </nav>
    <button className="navbar__signin">Sign in</button>
  </div>
</header>
```

Links that only change state should really be `<button>`s, or `<a href>`
with `preventDefault`. In a real app they'd be router links. Say which you're
doing.

## Desktop-first layout

```css
.navbar {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 24px;
  height: 64px;
  padding: 0 24px;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
}

.navbar__menu {
  flex: 1;
  display: flex;
  align-items: center;
}

.navbar__menu nav { flex: 1; display: flex; justify-content: center; }

.navbar__links {
  display: flex;
  gap: 24px;
  list-style: none;
  margin: 0;
  padding: 0;
}

.navbar__toggle { display: none; }
```

`flex: 1` on the nav makes it take the space between the logo and Sign in,
and `justify-content: center` centers the links in that space. That centers
them between the neighbours, not on the page. To center on the page exactly,
use a 3-column grid: `grid-template-columns: 1fr auto 1fr` with the last item
`justify-self: end`.

## Current link underline

```css
.navbar__link {
  position: relative;
  padding: 8px 0;
  color: #374151;
  text-decoration: none;
}
.navbar__link[aria-current="page"] { color: #111827; font-weight: 600; }
.navbar__link[aria-current="page"]::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: -2px;
  height: 2px;
  background: #4f46e5;
}
```

Styling off `[aria-current]` keeps the visual state and the accessible state
in sync automatically. Bold text changes the word's width; if that makes the
row jiggle, reserve the space or use a color change instead.

## Mobile

```css
@media (max-width: 767px) {
  .navbar__toggle { display: block; margin-left: auto; }

  .navbar__menu {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    flex-direction: column;
    align-items: stretch;
    padding: 8px 16px 16px;
    background: #fff;
    border-bottom: 1px solid #e5e7eb;
  }
  .navbar__menu--open { display: flex; }

  .navbar__links { flex-direction: column; gap: 0; }
  .navbar__link { display: flex; align-items: center; min-height: 44px; }
}
```

- `top: 100%` puts the panel right under the header. The header being
  `sticky` also makes it the positioning parent for the `absolute` panel.
- `margin-left: auto` on the toggle pushes it to the right edge of a flex row.

## Sticky gotchas

- `sticky` needs `top` set.
- It sticks within its parent. If the parent is only as tall as the header,
  it has nowhere to stick.
- Any ancestor with `overflow: hidden` or `auto` becomes the scroll container
  and stops sticky from working against the page.

## Stretch: slide down

`display: none` can't animate. Instead keep the panel rendered and toggle
`transform: translateY(-8px)` + `opacity: 0` + `visibility: hidden`, with a
transition on all three. `visibility: hidden` also removes the links from the
Tab order while it's closed, which `opacity: 0` alone doesn't.

## Stretch: Escape and outside click

A `useEffect` while `open` adds a `keydown` listener (Escape closes and calls
`toggleRef.current.focus()`) and a `pointerdown` listener on `document` that
closes if `!headerRef.current.contains(e.target)`. Remove both in cleanup.

## Common mistakes

- Two separate lists of links for mobile and desktop.
- Hiding the menu with `opacity: 0` only, so hidden links are still
  tabbable.
- Menu button with only an icon and no `aria-label`.
- Forgetting `z-index`, so content scrolls over the sticky header.

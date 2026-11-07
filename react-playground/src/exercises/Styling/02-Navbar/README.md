# 02 · Responsive Navbar

**Time:** 25–35 min · plain CSS in `Navbar.css` only.

Build a site header that works on desktop and phone. Start in `Navbar.jsx`.

## Requirements

### Desktop (768px and wider)

- One row, 64px tall: **logo on the left**, **links in the middle**,
  **"Sign in" button on the right**.
- The links are evenly spaced. The current page's link is highlighted (bold
  plus a 2px underline bar under it, or a pill background; your choice).
- Clicking a link makes it the current page (no real routing, just state).
- The header has a bottom border and stays at the top of the page when you
  scroll the content underneath (filler content is provided).

### Mobile (below 768px)

- The links and Sign in button hide. A **menu button** (☰) appears on the
  right.
- Clicking it opens a panel **below the header** with the links stacked
  vertically, full width, each at least 44px tall so they're easy to tap.
  Sign in sits at the bottom of the panel.
- The menu button shows ✕ when open.
- Choosing a link closes the panel.

### Both

- Every link and button has hover and `:focus-visible` styles.
- The current link has `aria-current="page"`. The menu button has
  `aria-expanded` and `aria-controls`, and an accessible name.

## Stretch

- Escape closes the menu and moves focus back to the menu button.
- Clicking outside the header closes the menu.
- The panel slides down instead of appearing instantly.
- If the window is resized back to desktop with the menu open, nothing looks
  broken.

## What's being evaluated

- **Flexbox:** three groups in a row with the middle one centered.
- **Media queries:** a mobile-first or desktop-first approach, and saying
  which you picked.
- **Show/hide with state + CSS** without duplicating the link markup.
- **`position: sticky`** and what it needs to work.
- **Semantics:** `<header>`, `<nav>`, a `<ul>` of links.

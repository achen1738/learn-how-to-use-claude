# 05 · Holy Grail Layout

**Time:** 30–45 min · plain CSS in `HolyGrailLayout.css` only.

Build the classic app page layout: header, left nav, main content, right
sidebar and footer. `HolyGrailLayout.jsx` has the content; you build the
structure and layout.

## Requirements

- **Desktop (1024px+):** header across the top, then three columns: left nav
  **220px**, main content **takes the rest**, right sidebar **260px**. Footer
  across the bottom.
- **Tablet (768–1023px):** the right sidebar moves **below the main
  content**, inside the same column. The left nav stays on the left.
- **Phone (below 768px):** one column in this order: header, main, left nav,
  right sidebar, footer. Main content comes first because it matters most.
- **Sticky footer:** the layout fills at least the visible height of the
  window. When content is short (use the toggle), the footer sits at the
  **bottom of the screen**, not right after the content.
- **Long content:** when the main content is long, the page scrolls normally
  and the footer comes after it.
- Main content has a readable line length: at most about **70 characters**
  wide, even on a big screen.
- Use landmark elements: `<header>`, `<nav>`, `<main>`, `<aside>`,
  `<footer>`.

## Stretch

- A button in the header **collapses the left nav** to a 64px icon rail with
  a smooth width transition. The main content grows to fill the space.
- The header stays fixed at the top while scrolling, and the left nav stays
  visible too (its own scroll if it's taller than the screen).
- Do the phone order with **no changes to the JSX** (only CSS).

## What's being evaluated

- **`grid-template-areas`:** naming areas and rearranging them per breakpoint.
- **Sticky footer:** `min-height` with grid or flex.
- **Responsive reordering** without duplicating markup.
- **`max-width` + `ch` units** for readable text.
- **Landmarks** and why they help screen reader users.

Note: the playground already has a sidebar and padding around exercises, so
"full height" here means `min-height: calc(100vh - 48px)` or similar. Say
that out loud rather than fighting it.

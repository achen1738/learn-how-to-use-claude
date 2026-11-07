# 09 · Tooltip

**Time:** 40–50 min · plain CSS in `Tooltip.css` only.

Build a reusable `Tooltip` component. `Tooltip.jsx` has a demo page that
uses it; right now `Tooltip` just renders its child.

## Requirements

- `<Tooltip content="Copy link" position="top">{child}</Tooltip>` wraps any
  focusable element.
- The tooltip appears on **hover and on keyboard focus**, and hides on mouse
  leave, blur and **Escape**.
- `position` is `top` (default), `right`, `bottom` or `left`. The tooltip is
  centered against the trigger on that side, with an **8px gap**.
- A small **arrow** points at the trigger, drawn with CSS (no images, no
  SVG).
- Style: dark background, white 13px text, small padding and rounded
  corners. Short text stays on one line, and long text wraps at **240px**.
- It fades in (about 120ms) after a short **delay** (about 300ms) so it
  doesn't flash when the mouse just passes over.
- Showing it must **not shift the layout** of anything on the page.
- The trigger gets `aria-describedby` pointing at the tooltip, which has
  `role="tooltip"`.

## Stretch

- **Clipping:** the last demo puts a tooltip inside a box with
  `overflow: hidden`. Your first version will probably be cut off there.
  Fix it by rendering the tooltip in a portal and positioning it with
  `getBoundingClientRect()`.
- **Flipping:** the tooltip near the right edge of the window should flip to
  the other side instead of going off screen.
- Hovering the tooltip itself keeps it open, so a user can move the mouse
  onto it (a WCAG requirement).

## What's being evaluated

- **`position: absolute`** inside a `relative` wrapper, and centering with
  `transform`.
- **Drawing triangles** with borders or a rotated square.
- **Transitions with a delay** and `visibility` so hidden tooltips don't
  catch the mouse.
- **Why `overflow: hidden` clips absolute children**, and how portals and
  `position: fixed` get around it.
- **Accessibility:** focus as well as hover, Escape, `aria-describedby`.

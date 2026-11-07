# 07 · Sliding Tabs

**Time:** 40–50 min · plain CSS in `SlidingTabs.css` only.

Build a tab bar where the active underline **slides** to the tab you pick.
`SlidingTabs.jsx` has the tab data. (The **Profile Tabs** exercise covers the
component API side; this one is about the visuals.)

## Requirements

- A row of tab buttons with a **1px grey line** under the whole row.
- The active tab has darker, bold text and a **2px colored indicator** that
  sits on top of the grey line, exactly as wide as that tab's text.
- Switching tabs **slides** the indicator to the new tab and resizes it to
  the new width (about 200ms). It does not fade out and back in.
- Tabs have different label lengths, so the indicator really has to measure.
- Hover changes the text color. `:focus-visible` shows a clear focus ring
  that isn't confused with the indicator.
- The selected tab's panel shows below the bar.
- The indicator stays correct when the **window is resized** and when the
  font or label changes width (bold text is wider than regular!).
- **Keyboard:** Left/Right arrows move between tabs, Home/End jump to the
  ends. ARIA tab roles: `tablist`, `tab` with `aria-selected` and
  `aria-controls`, `tabpanel` with `aria-labelledby`.

## Stretch

- **Overflow:** with "Many tabs" checked, there are too many to fit. The bar
  scrolls sideways (no visible scrollbar), the selected tab scrolls into
  view, and a soft fade shows on whichever edge has more tabs.
- **Reduced motion:** the indicator jumps instead of sliding when the user
  prefers less motion.
- A "pill" variant where a rounded background slides behind the active tab
  instead of an underline.

## What's being evaluated

- **Measuring the DOM** with refs (`offsetLeft`/`offsetWidth` or
  `getBoundingClientRect`) and when to measure (`useLayoutEffect`).
- **Animating with `transform`** rather than `left`/`width`, and why it's
  smoother.
- **Absolute positioning** of the indicator inside the tab list.
- **Overflow scrolling** and masking for the stretch.

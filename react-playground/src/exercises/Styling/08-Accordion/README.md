# 08 · Accordion

**Time:** 35–45 min · plain CSS in `Accordion.css` only.

Build an FAQ accordion from `FAQS` in `Accordion.jsx`.

## Requirements

- Each question is a full-width row with the question on the left and a
  **chevron** (▾ or a CSS-drawn one) on the right. Rows are separated by a
  1px line.
- Clicking a question **smoothly expands** its answer, and clicking again
  collapses it. The answers have very different lengths, so you can't
  hardcode a height.
- The chevron **rotates 180°** when open, with the same timing as the
  expand.
- A **"Allow multiple open"** checkbox: when off, opening one question
  closes the others. When on, any number can be open.
- The open question's text is slightly bolder or darker.
- Hover and `:focus-visible` styles on each question row.
- **Accessibility:** the question is a `<button>` inside a heading, with
  `aria-expanded` and `aria-controls`. The answer region has an `id` and
  `role="region"` + `aria-labelledby`. A collapsed answer must not be
  reachable with Tab (the "Learn more" link inside one answer is there to
  test this).

## Stretch

- **Expand all / Collapse all** buttons (only shown when multiple is
  allowed).
- Respect `prefers-reduced-motion`.
- Build a second version with `<details>` and `<summary>`. Compare: what do
  you get for free, and what's harder to do?

## What's being evaluated

- **Animating an unknown height.** There are a few approaches (the
  `max-height` hack, measuring `scrollHeight`, and the
  `grid-template-rows: 0fr → 1fr` trick). Know the trade-offs.
- **Transitions on `transform`** for the chevron.
- **Hidden-but-animatable** content that's still removed from the Tab order
  and the accessibility tree when closed.
- **State shape** for single vs multiple open (a `Set` of ids works for
  both).

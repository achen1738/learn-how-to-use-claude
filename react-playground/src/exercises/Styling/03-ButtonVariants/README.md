# 03 · Button Variants

**Time:** 25–35 min · plain CSS in `ButtonVariants.css` only.

Build a reusable `Button` component, the kind a design system would ship.
`ButtonVariants.jsx` already has a showcase page that uses it; right now
`Button` ignores all its props. Make the showcase look right.

## Requirements

- **Variants:** `primary` (filled), `secondary` (outlined), `danger` (filled
  red) and `ghost` (no border or background until hover).
- **Sizes:** `sm` (32px tall), `md` (40px, the default), `lg` (48px).
- **States** for every variant: hover, active (pressed), `:focus-visible`
  and disabled.
- **Loading:** shows a spinning circle and disables the button. The button
  must **not change width** when it switches to loading, and the text should
  stay readable to screen readers (or announce "Loading").
- **Icons:** an optional `icon` prop shows before the label, with a gap.
  An icon-only button (no children) is square and needs an `aria-label`.
- **`fullWidth`** prop stretches to fill its container.
- Any other props (`onClick`, `type`, `aria-*`) are passed through to the
  `<button>`. `type` defaults to `"button"`.
- Colors live in **CSS custom properties**, so changing the brand color is a
  one-line change.

## Stretch

- Spinner respects `prefers-reduced-motion`.
- A dark theme: wrap the showcase in `.button-demo--dark` and only override
  variables, not every rule.
- A `ButtonGroup` that joins buttons together (shared borders, only the outer
  corners rounded).

## What's being evaluated

- **Component API:** turning props into class names cleanly.
- **CSS variables** for theming instead of repeating colors.
- **Keyframe animation** for the spinner.
- **Stable layout:** no jumping when loading toggles.
- **Accessibility:** focus ring, `disabled` vs `aria-disabled`, labels on
  icon-only buttons, announcing loading.

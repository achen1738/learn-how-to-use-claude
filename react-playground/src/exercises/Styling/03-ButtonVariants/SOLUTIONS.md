# 03 · Button Variants: Solution Notes

Spoilers below.

## Props to class names

```jsx
const className = [
  "button",
  `button--${variant}`,
  `button--${size}`,
  fullWidth && "button--full",
  !children && "button--icon-only",
  loading && "button--loading",
  rest.className,
].filter(Boolean).join(" ");

return (
  <button
    type="button"
    {...rest}
    className={className}
    disabled={rest.disabled || loading}
    aria-busy={loading || undefined}
  >
    {icon && <span className="button__icon" aria-hidden="true">{icon}</span>}
    {children && <span className="button__label">{children}</span>}
    {loading && <span className="button__spinner" aria-hidden="true" />}
  </button>
);
```

`type="button"` comes **before** `{...rest}` so a caller can still pass
`type="submit"`. A `<button>` inside a form is a submit button by default,
which surprises people.

## Variables and base styles

```css
.button {
  --button-bg: var(--color-brand, #4f46e5);
  --button-fg: #fff;
  --button-border: var(--button-bg);
  --button-hover-bg: #4338ca;

  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 40px;
  padding: 0 16px;
  font: inherit;
  font-weight: 500;
  line-height: 1;
  white-space: nowrap;
  color: var(--button-fg);
  background: var(--button-bg);
  border: 1px solid var(--button-border);
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 120ms, transform 60ms;
}

.button:hover:not(:disabled) { background: var(--button-hover-bg); }
.button:active:not(:disabled) { transform: translateY(1px); }
.button:focus-visible { outline: 2px solid var(--button-bg); outline-offset: 2px; }
.button:disabled { opacity: 0.5; cursor: not-allowed; }
```

Each variant only changes variables:

```css
.button--secondary {
  --button-bg: #fff;
  --button-fg: #4f46e5;
  --button-border: #c7d2fe;
  --button-hover-bg: #eef2ff;
}
.button--danger { --button-bg: #dc2626; --button-hover-bg: #b91c1c; }
.button--ghost {
  --button-bg: transparent;
  --button-fg: #374151;
  --button-border: transparent;
  --button-hover-bg: #f3f4f6;
}
```

The ghost focus ring uses `--button-bg`, which is transparent. Give
`.button--ghost:focus-visible` its own outline color. Spotting that is a
good thing to say out loud.

## Sizes and icon-only

```css
.button--sm { height: 32px; padding: 0 12px; font-size: 14px; }
.button--lg { height: 48px; padding: 0 20px; font-size: 18px; }
.button--icon-only { padding: 0; aspect-ratio: 1; }
.button--full { display: flex; width: 100%; }
```

Using `height` (not just padding) keeps all sizes exact even when an emoji
icon has a taller line box than text.

## Loading without changing width

Keep the label in the layout but invisible, and lay the spinner over it:

```css
.button--loading .button__label,
.button--loading .button__icon { visibility: hidden; }

.button__spinner {
  position: absolute;
  inset: 0;
  margin: auto;
  width: 1em;
  height: 1em;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: button-spin 700ms linear infinite;
}

@keyframes button-spin { to { transform: rotate(360deg); } }

@media (prefers-reduced-motion: reduce) {
  .button__spinner { animation-duration: 2s; }
}
```

- `visibility: hidden` keeps the space; `display: none` would collapse it and
  the button would shrink.
- `inset: 0; margin: auto` centers an absolutely positioned box that has a
  fixed size.
- `currentColor` makes the spinner match each variant's text color for free.
- Screen readers: `visibility: hidden` hides the label from them too. Either
  keep a visually-hidden "Loading" text or rely on `aria-busy` plus the
  button's existing accessible name. Mention the trade-off.

## Dark theme stretch

```css
.button-demo--dark { --color-brand: #818cf8; background: #111827; color: #f9fafb; }
.button-demo--dark .button--secondary { --button-bg: transparent; --button-fg: #c7d2fe; }
```

Only variables change, which is the point of using them.

## Common mistakes

- Swapping the label for a spinner, so the button changes width.
- Ignoring `rest.className` or putting `{...rest}` last and losing your own
  `className`.
- Hardcoding the same hex code in ten rules.
- `cursor: pointer` on disabled buttons.

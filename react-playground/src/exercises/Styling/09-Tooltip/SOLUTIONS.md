# 09 · Tooltip: Solution Notes

Spoilers below.

## Component (CSS-positioned version)

```jsx
export function Tooltip({ content, position = "top", children }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const timer = useRef();

  const show = () => { clearTimeout(timer.current); timer.current = setTimeout(() => setOpen(true), 300); };
  const hide = () => { clearTimeout(timer.current); setOpen(false); };

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && hide();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <span
      className="tooltip"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {cloneElement(children, { "aria-describedby": id })}
      <span
        id={id}
        role="tooltip"
        className={`tooltip__bubble tooltip__bubble--${position} ${open ? "tooltip__bubble--open" : ""}`}
      >
        {content}
      </span>
    </span>
  );
}
```

- Focus and blur events bubble in React, so putting them on the wrapper
  catches focus on the child.
- `cloneElement` adds `aria-describedby` to the real trigger. The tooltip
  text is read after the button's name ("Copy link, button, Copy link"), so
  an icon button can use the same text for both.
- Clear the timer on unmount, or `setOpen` fires on an unmounted component.

## Wrapper and bubble

```css
.tooltip {
  position: relative;
  display: inline-block;
}

.tooltip__bubble {
  position: absolute;
  z-index: 100;
  width: max-content;
  max-width: 240px;
  padding: 6px 8px;
  border-radius: 6px;
  background: #111827;
  color: #fff;
  font-size: 13px;
  line-height: 1.4;
  pointer-events: none;
  opacity: 0;
  visibility: hidden;
  transition: opacity 120ms ease, visibility 120ms;
}

.tooltip__bubble--open { opacity: 1; visibility: visible; }
```

- `position: absolute` takes the bubble out of the layout, so nothing moves
  when it shows.
- `width: max-content` + `max-width: 240px`: short text stays on one line,
  long text wraps at 240px. Without `max-content`, an absolute box inside a
  narrow trigger shrinks to the trigger's width and wraps every word.
- `visibility: hidden` (not just `opacity: 0`) so the hidden bubble can't be
  hovered and isn't read out. `visibility` can be transitioned: it flips at
  the end when hiding and at the start when showing.
- The 300ms delay lives in JS. You could also use `transition-delay`, but
  then keyboard focus would wait too.

## Placement

```css
.tooltip__bubble--top    { bottom: calc(100% + 8px); left: 50%; transform: translateX(-50%); }
.tooltip__bubble--bottom { top: calc(100% + 8px);    left: 50%; transform: translateX(-50%); }
.tooltip__bubble--right  { left: calc(100% + 8px);   top: 50%;  transform: translateY(-50%); }
.tooltip__bubble--left   { right: calc(100% + 8px);  top: 50%;  transform: translateY(-50%); }
```

`left: 50%` puts the bubble's left edge at the trigger's middle, then
`translateX(-50%)` moves it back by half its own width: centered, whatever
its size. `bottom: 100%` means "my bottom edge at the wrapper's top edge".

## Arrow

```css
.tooltip__bubble::before {
  content: "";
  position: absolute;
  width: 8px;
  height: 8px;
  background: inherit;
  transform: rotate(45deg);
}
.tooltip__bubble--top::before    { top: 100%;    left: 50%; margin: -4px 0 0 -4px; }
.tooltip__bubble--bottom::before { bottom: 100%; left: 50%; margin: 0 0 -4px -4px; }
.tooltip__bubble--right::before  { right: 100%;  top: 50%;  margin: -4px -4px 0 0; }
.tooltip__bubble--left::before   { left: 100%;   top: 50%;  margin: -4px 0 0 -4px; }
```

A rotated square half-tucked under the bubble. `background: inherit` keeps it
the same color. The classic alternative is a zero-size box with three
transparent borders and one colored one (`border: 6px solid transparent;
border-top-color: #111827`), which makes a triangle. Know both.

## Stretch: clipping, portal and flip

`overflow: hidden` clips everything inside the box, including absolutely
positioned children, unless the positioned ancestor (`.tooltip`) is outside
the clipping box. Raising `z-index` doesn't help, since clipping isn't
stacking.

Fix: render the bubble with `createPortal(…, document.body)` and position it
with `position: fixed` using the trigger's rectangle:

```js
const r = triggerRef.current.getBoundingClientRect();
// top placement:
const top = r.top - 8;            // then translate(-50%, -100%) in CSS
const left = r.left + r.width / 2;
```

Flip: measure the bubble too, and if `left + bubbleWidth > window.innerWidth`
for a `right` tooltip, use `left` instead. Recalculate on scroll and
resize while open. This is what libraries like Floating UI do; saying "in
production I'd use Floating UI, here's what it handles" is a good answer.

## Common mistakes

- Only hover, no focus, so keyboard users never see it.
- `display: none` toggling, which can't fade.
- Tooltip text wrapping one word per line (missing `max-content`).
- `title` attribute "tooltips": not keyboard accessible and can't be styled.

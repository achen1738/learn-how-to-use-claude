# 08 · Accordion: Solution Notes

Spoilers below.

## State

```js
const [openIds, setOpenIds] = useState(() => new Set());

function toggle(id) {
  setOpenIds((prev) => {
    const isOpen = prev.has(id);
    const next = allowMultiple ? new Set(prev) : new Set();
    if (!isOpen) next.add(id);
    else next.delete(id);
    return next;
  });
}
```

One `Set` handles both modes. A single `openId` string would need a rewrite
when "multiple" is turned on. When switching from multiple back to single,
decide what happens to the extra open items (keep the last one, or close
all) and say so.

## Markup

```jsx
<div className="accordion">
  {FAQS.map((faq) => {
    const open = openIds.has(faq.id);
    return (
      <div key={faq.id} className={`accordion__item ${open ? "accordion__item--open" : ""}`}>
        <h3 className="accordion__heading">
          <button
            id={`acc-btn-${faq.id}`}
            className="accordion__trigger"
            aria-expanded={open}
            aria-controls={`acc-panel-${faq.id}`}
            onClick={() => toggle(faq.id)}
          >
            <span>{faq.question}</span>
            <span className="accordion__chevron" aria-hidden="true" />
          </button>
        </h3>
        <div
          id={`acc-panel-${faq.id}`}
          role="region"
          aria-labelledby={`acc-btn-${faq.id}`}
          className="accordion__panel"
          inert={!open ? "" : undefined}
        >
          <div className="accordion__panel-inner">
            <div className="accordion__content">{faq.answer}</div>
          </div>
        </div>
      </div>
    );
  })}
</div>
```

The button goes **inside** the heading, so screen reader users can jump by
heading and still have a button.

`inert` removes the closed panel's contents from the Tab order and the
accessibility tree, while it stays in the DOM so it can animate. React 18
passes it through as an unknown attribute, so use `""` / `undefined`. (In
React 19 it's a real boolean prop.)

## The 0fr → 1fr trick

```css
.accordion__panel {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 250ms ease;
}
.accordion__item--open .accordion__panel { grid-template-rows: 1fr; }

.accordion__panel-inner {
  overflow: hidden;
  min-height: 0;
}

.accordion__content { padding: 0 16px 16px; }
```

A grid row of `0fr` with `min-height: 0` children collapses to zero; `1fr`
is the content's natural height. Browsers can animate between the two, so
you get a real height animation with no measuring and no magic numbers.

Put the padding on an inner element, not the one with `overflow: hidden`.
Otherwise the padding still shows when "collapsed".

## The other approaches

| Approach | How | Trade-off |
|---|---|---|
| `max-height` hack | animate `max-height: 0` → `max-height: 1000px` | Timing is wrong (it animates to 1000px, so closing has a delay) and very long content gets cut off |
| Measure | set `height` to `el.scrollHeight` px, then `auto` after the transition | Precise and works everywhere, but needs JS and handling resize while open |
| `0fr → 1fr` | grid rows, as above | Clean CSS only; needs a browser from 2023 or later |
| `interpolate-size: allow-keywords` | lets `height: 0 → auto` animate directly | Newest; Chromium only at time of writing |

Naming two of these and why you picked one is what interviewers want to hear.

## Chevron

```css
.accordion__chevron {
  width: 10px;
  height: 10px;
  border-right: 2px solid currentColor;
  border-bottom: 2px solid currentColor;
  transform: rotate(45deg);
  transition: transform 250ms ease;
  flex-shrink: 0;
}
.accordion__trigger[aria-expanded="true"] .accordion__chevron {
  transform: rotate(225deg);
}
```

A square with two borders, rotated 45°, makes a "v". Rotating to 225° flips
it. `flex-shrink: 0` stops a long question from squashing the chevron.
Styling off `[aria-expanded]` keeps visuals tied to the accessible state.

## Trigger row

```css
.accordion__item { border-bottom: 1px solid #e5e7eb; }
.accordion__heading { margin: 0; font-size: inherit; }
.accordion__trigger {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px;
  font: inherit;
  text-align: left;
  background: none;
  border: none;
  cursor: pointer;
}
.accordion__trigger:hover { background: #f9fafb; }
.accordion__trigger:focus-visible { outline: 2px solid #4f46e5; outline-offset: -2px; }
.accordion__item--open .accordion__trigger { font-weight: 600; }
```

`text-align: left` because buttons center text by default, which looks wrong
for long questions that wrap.

## `<details>` comparison

Free: open/close without state, keyboard and screen reader support, works
with find-in-page (browsers open it to show matches). Harder: animating the
close (the content disappears immediately), and single-open mode needs
`name="faq"` on each `<details>` (supported in newer browsers) or JS.

## Common mistakes

- `display: none` / conditional rendering, which can't animate.
- Animating only `opacity`, so the content still takes space.
- Hidden link still tabbable inside a "closed" panel.
- Using `div` with `onClick` instead of a `button`.

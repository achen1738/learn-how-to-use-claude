# 07 · Sliding Tabs: Solution Notes

Spoilers below.

## Structure

One indicator element for the whole bar, moved with `transform`. Not one
underline per tab: separate underlines can only fade, not slide.

```jsx
<div className="sliding-tabs__bar">
  <div role="tablist" aria-label="Project" className="sliding-tabs__list" ref={listRef} onKeyDown={onKeyDown}>
    {tabs.map((tab) => (
      <button
        key={tab.id}
        ref={(el) => (tabRefs.current[tab.id] = el)}
        role="tab"
        id={`tab-${tab.id}`}
        aria-selected={tab.id === selected}
        aria-controls={`panel-${tab.id}`}
        tabIndex={tab.id === selected ? 0 : -1}
        className="sliding-tabs__tab"
        onClick={() => setSelected(tab.id)}
      >{tab.label}</button>
    ))}
    <span className="sliding-tabs__indicator" style={indicatorStyle} aria-hidden="true" />
  </div>
</div>
```

## Measuring

```js
const [indicator, setIndicator] = useState({ left: 0, width: 0 });

useLayoutEffect(() => {
  const el = tabRefs.current[selected];
  if (!el) return;
  const update = () => setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
  update();
  const ro = new ResizeObserver(update);
  ro.observe(el);
  ro.observe(listRef.current);
  return () => ro.disconnect();
}, [selected, tabs.length]);

const indicatorStyle = {
  transform: `translateX(${indicator.left}px) scaleX(${indicator.width})`,
};
```

- `useLayoutEffect` measures after the DOM updates but **before the browser
  paints**, so you never see the indicator in the wrong place for one frame.
- `offsetLeft` is relative to the nearest positioned ancestor, so the list
  must be `position: relative`.
- `ResizeObserver` catches window resizes, font loading, and the tab getting
  wider when it turns bold. A `resize` listener on `window` misses the last
  two.
- Passing the measured numbers through inline `style` is fine: they're
  data, not design.

## Indicator CSS

```css
.sliding-tabs__list {
  position: relative;
  display: flex;
  gap: 4px;
  border-bottom: 1px solid #e5e7eb;
}

.sliding-tabs__tab {
  font: inherit;
  padding: 10px 12px;
  border: none;
  background: none;
  color: #6b7280;
  cursor: pointer;
  white-space: nowrap;
}
.sliding-tabs__tab:hover { color: #111827; }
.sliding-tabs__tab[aria-selected="true"] { color: #111827; font-weight: 600; }
.sliding-tabs__tab:focus-visible {
  outline: 2px solid #4f46e5;
  outline-offset: -2px;
  border-radius: 6px;
}

.sliding-tabs__indicator {
  position: absolute;
  left: 0;
  bottom: -1px;
  width: 1px;
  height: 2px;
  background: #4f46e5;
  transform-origin: left;
  transition: transform 200ms ease;
}

@media (prefers-reduced-motion: reduce) {
  .sliding-tabs__indicator { transition: none; }
}
```

- The indicator is 1px wide and `scaleX(width)` stretches it; with
  `transform-origin: left` it grows from the left edge. `transform` animates
  on the GPU without triggering layout, unlike animating `left` and `width`.
  At a 2px height, the scaled edges look fine. For a rounded pill, animate
  `width` instead, since `scaleX` would squash the rounded corners.
- `bottom: -1px` places it over the list's 1px border.
- Negative `outline-offset` keeps the focus ring inside the tab so it isn't
  cut off and doesn't look like the indicator.

## Bold text jiggle

Bold text is wider, so the neighbours shift when selection changes. Fix:
reserve the bold width with a hidden copy.

```css
.sliding-tabs__tab::after {
  content: attr(data-label);
  display: block;
  height: 0;
  visibility: hidden;
  overflow: hidden;
  font-weight: 600;
}
```

Add `data-label={tab.label}` to each tab and use `display: inline-flex;
flex-direction: column` on the tab. Mentioning this is a strong signal even
if you don't build it.

## Keyboard

```js
function onKeyDown(e) {
  const i = tabs.findIndex((t) => t.id === selected);
  const next = {
    ArrowRight: (i + 1) % tabs.length,
    ArrowLeft: (i - 1 + tabs.length) % tabs.length,
    Home: 0,
    End: tabs.length - 1,
  }[e.key];
  if (next === undefined) return;
  e.preventDefault();
  setSelected(tabs[next].id);
  tabRefs.current[tabs[next].id].focus();
}
```

## Stretch: overflow

```css
.sliding-tabs__list {
  overflow-x: auto;
  scrollbar-width: none;
}
.sliding-tabs__list::-webkit-scrollbar { display: none; }
```

- Scroll the selected tab into view:
  `el.scrollIntoView({ block: "nearest", inline: "nearest" })`.
- Once the list scrolls, `offsetLeft` is still relative to the list's content,
  so the indicator scrolls with the tabs. 
- `overflow-x: auto` clips anything outside the box, so the
  `bottom: -1px` indicator gets cut off. Move the border to an inner element
  or set `bottom: 0` with a padded list.
- Edge fades: `mask-image: linear-gradient(to right, transparent, black 24px,
  black calc(100% - 24px), transparent)`. Toggle each side with classes based
  on `scrollLeft` (0 at the start, `scrollWidth - clientWidth` at the end).

## Common mistakes

- Measuring in `useEffect`, so the indicator flashes in the old spot.
- Forgetting `position: relative` on the list, so `offsetLeft` measures from
  some other ancestor.
- Only re-measuring on `selected` changes, so resizing the window breaks it.
- Removing the focus outline because "it looks like a second underline".

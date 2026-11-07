# Styling Drills

Twelve exercises for interviews where **HTML and CSS are graded**, not just
whether the component works. Each one lives in its own numbered folder with:

- `README.md`: the prompt
- `<Name>.jsx`: the starter component, already in the sidebar
- `<Name>.css`: an empty stylesheet, already imported
- `SOLUTIONS.md`: the approach, key CSS and common mistakes (spoilers)

## Rules

- **Plain CSS only.** Write it in the `.css` file. No inline `style={{}}`, no
  Emotion, no Tailwind, no SCSS, no component libraries. This is the
  "SCSS-to-raw-CSS" gap these drills are for.
- **Prefix every class with the exercise name** (e.g. `.profile-card`,
  `.profile-card__avatar`). All CSS files in the app are global, so
  unprefixed classes like `.title` will leak into other exercises. Naming
  things this way is also something interviewers notice.
- **Semantic HTML first.** Real `<button>`s, `<nav>`, `<ul>`, headings in
  order, labels on inputs. Get the markup right before styling it.
- **Set a timer.** Each prompt has a time box. Get it working, then polish.
- **Talk out loud.** Say why you chose grid over flex, why that element is
  `position: relative`, and so on.

## Testing your layout

Media queries respond to the **window** width, not the playground's content
area. Open DevTools and use the device toolbar (Ctrl+Shift+M) to try
375px, 768px and 1280px widths. Also check:

- Very long text (names, titles, emails)
- Keyboard only: Tab through everything. Can you see where focus is?
- Hover, focus, active and disabled states on every button
- Zoom to 200%: does anything overlap or get cut off?

## The exercises

| # | Exercise | Time | Main skills |
|---|----------|------|-------------|
| 01 | Profile Card | 20–30 min | box model, `object-fit`, button states, overflow |
| 02 | Responsive Navbar | 25–35 min | flexbox, media queries, mobile menu |
| 03 | Button Variants | 25–35 min | class names from props, CSS variables, spinner |
| 04 | Product Grid | 30–45 min | grid `auto-fill`/`minmax`, equal-height cards, line clamp |
| 05 | Holy Grail Layout | 30–45 min | `grid-template-areas`, sticky footer, stacking on mobile |
| 06 | Modal Dialog | 35–45 min | `position: fixed`, centering, `z-index`, scroll lock |
| 07 | Sliding Tabs | 40–50 min | transform transitions, measuring elements, focus styles |
| 08 | Accordion | 35–45 min | animating unknown heights, rotation, ARIA |
| 09 | Tooltip | 40–50 min | absolute positioning, CSS arrows, clipping |
| 10 | Toast Notifications | 45–60 min | fixed stacks, keyframes, enter/exit animation |
| 11 | Kanban Board | 50–60 min | nested scrolling, `min-height: 0`, sticky headers |
| 12 | Data Table | 50–60 min | sticky header + column, table styling, truncation |

## Plain CSS to know cold

- Centering three ways: flex, grid, and absolute + `transform`.
- Flexbox: `flex: 1`, `flex-shrink: 0`, `flex-wrap`, `gap`, `align-items`
  vs `align-content`, and why a flex child needs `min-width: 0` to shrink.
- Grid: `fr`, `minmax()`, `repeat(auto-fill, ...)` vs `auto-fit`,
  `grid-template-areas`.
- Positioning: which ancestor `absolute` measures from, how `sticky` needs a
  scrolling ancestor and an offset, and what creates a stacking context.
- Specificity: why your rule isn't applying, and how to fix it without
  `!important`.
- Custom properties: define on `:root` or a component class, read with
  `var(--name, fallback)`.
- No SCSS nesting or mixins. Write out `.card .title`, or use `.card__title`.
- `:hover`, `:focus-visible`, `:disabled`, `[aria-expanded="true"]`
  selectors.
- `transition` vs `@keyframes`, and `@media (prefers-reduced-motion: reduce)`.

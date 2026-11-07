# 10 · Toast Notifications: Solution Notes

Spoilers below.

## State

```js
const [toasts, setToasts] = useState([]);
const nextId = useRef(0);

function addToast(toast) {
  const id = nextId.current++;
  setToasts((prev) => [...prev, { ...toast, id }].slice(-5));
}

function removeToast(id) {
  setToasts((prev) => prev.filter((t) => t.id !== id));
}
```

`.slice(-5)` keeps the newest five. Use a counter (or `crypto.randomUUID()`)
for ids, not `Date.now()`, which collides on fast double clicks.

## Each toast owns its timer

```jsx
function Toast({ toast, onClose }) {
  const [paused, setPaused] = useState(false);
  const remaining = useRef(3000);
  const startedAt = useRef(0);

  useEffect(() => {
    if (paused) return;
    startedAt.current = Date.now();
    const t = setTimeout(onClose, remaining.current);
    return () => {
      clearTimeout(t);
      remaining.current -= Date.now() - startedAt.current;
    };
  }, [paused]);

  return (
    <li
      className={`toast toast--${toast.type}`}
      role={toast.type === "error" ? "alert" : "status"}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >…</li>
  );
}
```

- Putting the timer inside `Toast` means it's cleaned up automatically when
  the toast unmounts. One `setTimeout` per toast in the parent is easy to
  leak.
- The cleanup subtracts elapsed time, so pausing and resuming continues
  where it left off instead of restarting.
- `onClose` should be stable (`useCallback`) or left out of deps on purpose;
  if it changes on every render, the timer restarts every render. Say so.

## Container

```css
.toast-region {
  position: fixed;
  right: 16px;
  bottom: 16px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 360px;
  margin: 0;
  padding: 0;
  list-style: none;
  pointer-events: none;
}

.toast { pointer-events: auto; }

@media (max-width: 599px) {
  .toast-region { left: 16px; width: auto; }
}
```

- Newest at the bottom: append to the array and use a normal column.
  (Newest on top would be `column-reverse` or prepending.)
- `pointer-events: none` on the container lets clicks pass through the gaps;
  `auto` on each toast turns them back on.
- Phone: setting both `left` and `right` on a fixed element stretches it
  between them; `width: auto` undoes the 360px.

## Toast

```css
.toast {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 12px 12px 16px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-left: 4px solid var(--toast-color);
  border-radius: 8px;
  box-shadow: 0 8px 24px rgb(0 0 0 / 0.12);
  animation: toast-in 200ms ease-out;
}
.toast--success { --toast-color: #16a34a; }
.toast--error   { --toast-color: #dc2626; }
.toast--info    { --toast-color: #2563eb; }

.toast__icon { color: var(--toast-color); flex-shrink: 0; }
.toast__message { flex: 1; margin: 0; overflow-wrap: anywhere; }
.toast__close { flex-shrink: 0; /* + button reset */ }

@keyframes toast-in {
  from { opacity: 0; transform: translateX(calc(100% + 16px)); }
}

@media (prefers-reduced-motion: reduce) {
  .toast { animation: none; }
}
```

`align-items: flex-start` keeps the icon and close button at the top when
the long message wraps.

## Live regions

Screen readers only announce changes **inside a live region that already
existed**. If each toast mounts with `role="status"`, some screen readers
miss it. Safer: render the `<ol className="toast-region">` all the time
(empty when there are no toasts) with `aria-live="polite"`, and add a
separate always-mounted `aria-live="assertive"` region for errors, or give
error toasts `role="alert"`, which most screen readers handle on insert.

## Stretch: exit animation

The problem: when a toast leaves state, React removes it immediately, so
there's nothing left to animate. Fix: mark it as leaving first, then remove
it when the animation ends.

```js
// in state: { ...toast, leaving: true }
<li className={leaving ? "toast toast--leaving" : "toast"}
    onAnimationEnd={() => leaving && removeToast(id)}>
```

```css
.toast--leaving { animation: toast-out 150ms ease-in forwards; }
@keyframes toast-out { to { opacity: 0; transform: translateX(100%); } }
```

## Stretch: smooth reflow

When a toast leaves, the ones below jump up. Options: animate the leaving
toast's height to 0 (`grid-template-rows: 1fr → 0fr`, like the accordion),
or use the FLIP technique (measure positions before and after, then animate
the difference with `transform`). Libraries like Framer Motion do FLIP for
you with `layout`.

## Stretch: progress bar

```css
.toast::after {
  content: "";
  position: absolute;
  left: 0; right: 0; bottom: 0;
  height: 3px;
  background: var(--toast-color);
  transform-origin: left;
  animation: toast-progress 3s linear forwards;
}
.toast:hover::after { animation-play-state: paused; }
@keyframes toast-progress { to { transform: scaleX(0); } }
```

`animation-play-state: paused` pauses the bar on hover in pure CSS, matching
the JS timer pause. Needs `position: relative` and `overflow: hidden` on the
toast.

## Common mistakes

- The fixed container blocks clicks on the page underneath.
- Timers never cleared, so a closed toast's timer later removes a
  different toast (or warns about state on an unmounted component).
- Toast is mounted with `role="status"` but nothing is announced.
- `left: 0; right: 0` on mobile without removing the fixed width.

# 06 · Modal Dialog: Solution Notes

Spoilers below.

## Markup

```jsx
{open && createPortal(
  <div className="modal__backdrop" onMouseDown={handleBackdrop}>
    <div
      className="modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-body"
    >
      <header className="modal__header">
        <h2 id="modal-title" className="modal__title">Delete project?</h2>
        <button className="modal__close" aria-label="Close" onClick={close}>✕</button>
      </header>
      <div id="modal-body" className="modal__body">…</div>
      <footer className="modal__footer">
        <button ref={cancelRef} onClick={close}>Cancel</button>
        <button className="modal__danger" onClick={confirm}>Delete</button>
      </footer>
    </div>
  </div>,
  document.body
)}
```

## Backdrop click without closing on inner clicks

```js
function handleBackdrop(e) {
  if (e.target === e.currentTarget) close();
}
```

`e.target === e.currentTarget` is true only when the click lands on the
backdrop itself, not a child. Using `onMouseDown` instead of `onClick`
avoids a nasty case: a user selects text inside the dialog, drags out and
releases over the backdrop. With `onClick`, that closes the modal.

## Backdrop and centering

```css
.modal__backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  padding: 16px;
  background: rgb(17 24 39 / 0.5);
}
```

- `inset: 0` is shorthand for top/right/bottom/left 0: covers the window.
- `display: grid; place-items: center` centers the dialog whatever its
  height.
- `padding: 16px` on the backdrop gives the 16px phone gutter for free.

## Dialog with a scrolling body

```css
.modal {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 480px;
  max-height: 100%;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgb(0 0 0 / 0.2);
}

.modal__header,
.modal__footer { flex-shrink: 0; padding: 16px 20px; }

.modal__header { display: flex; align-items: center; justify-content: space-between; }
.modal__footer { display: flex; justify-content: flex-end; gap: 8px; }

.modal__body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 0 20px;
}
```

- `max-height: 100%` caps the dialog at the backdrop's inner height.
- `min-height: 0` on the body is the key line. Flex items default to
  `min-height: auto`, which means "never smaller than my content", so the body
  refuses to shrink and `overflow-y: auto` never kicks in. This is the most
  common flex scrolling bug.

## Scroll lock

```js
useEffect(() => {
  if (!open) return;
  const prev = document.body.style.overflow;
  document.body.style.overflow = "hidden";
  return () => { document.body.style.overflow = prev; };
}, [open]);
```

Restoring the previous value, not `""`, keeps it correct if something else
also locked scrolling. Hiding the scrollbar can shift the page sideways by the
scrollbar width; `scrollbar-gutter: stable` on `html` fixes that.

## Focus management

```js
useEffect(() => {
  if (!open) return;
  const opener = document.activeElement;
  cancelRef.current?.focus();
  const onKey = (e) => { if (e.key === "Escape") close(); };
  document.addEventListener("keydown", onKey);
  return () => {
    document.removeEventListener("keydown", onKey);
    opener?.focus();
  };
}, [open]);
```

Focusing Cancel (not Delete) means a stray Enter press doesn't destroy
anything.

## Why a portal

Rendering inside the page can trap the modal in a **stacking context**. If
any ancestor has `transform`, `filter`, `opacity < 1`, or `position` plus a
`z-index`, the modal's `z-index: 1000` only competes inside that ancestor,
and a sibling with `z-index: 2` can still cover it. A `transform` on an
ancestor also makes `position: fixed` measure from that ancestor instead of
the window. A portal into `document.body` sidesteps both.

## Animation stretch

```css
.modal__backdrop { animation: modal-fade 150ms ease-out; }
.modal { animation: modal-pop 150ms ease-out; }
@keyframes modal-fade { from { opacity: 0; } }
@keyframes modal-pop { from { opacity: 0; transform: scale(0.95); } }
@media (prefers-reduced-motion: reduce) {
  .modal__backdrop, .modal { animation: none; }
}
```

Keyframes with only `from` animate to the element's normal styles. Animating
the exit needs the element to stay mounted until the animation ends
(`onAnimationEnd`).

## Native `<dialog>`

`showModal()` gives you the backdrop (`::backdrop`), top-layer stacking
(no z-index fights), Escape to close, and `inert` on the rest of the page
for free. You still handle backdrop clicks, scroll lock and returning focus
in some browsers. A good answer mentions it even if you build the custom one.

## Common mistakes

- Dialog closes when clicking inside it (missing the target check).
- Body can't scroll because `min-height: 0` is missing.
- `position: absolute` instead of `fixed`, so the modal scrolls away.
- Focus stays on the page behind, so Tab moves through hidden content.

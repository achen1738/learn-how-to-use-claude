# 06 · Modal Dialog

**Time:** 35–45 min · plain CSS in `Modal.css` only.

Build a confirmation modal for deleting a project. `Modal.jsx` has a page
with a "Delete project" button and enough text to scroll.

## Requirements

- Clicking **Delete project** opens a modal over the whole window (including
  the playground sidebar) with a **dimmed backdrop**.
- The dialog box is **centered** horizontally and vertically, **max 480px
  wide**, and on a phone it leaves a **16px gap** on each side.
- It contains: a title ("Delete project?"), body text, a close (✕) button in
  the top-right corner, and **Cancel** and **Delete** buttons aligned to the
  right at the bottom. Delete is red.
- **Long body:** with "Long terms" checked, the body text is very long. The
  dialog must not grow taller than the window: the **body scrolls** while
  the title and buttons stay visible.
- **The page behind doesn't scroll** while the modal is open, and its scroll
  position is unchanged after closing.
- **Closing:** ✕, Cancel, the **Escape** key, or clicking the backdrop.
  Clicking inside the dialog box must **not** close it.
- Delete closes the modal and shows "Project deleted" on the page.
- **Accessibility:** `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
  pointing at the title. When it opens, focus moves into the dialog (Cancel
  is a safe choice). When it closes, focus goes back to the button that
  opened it.

## Stretch

- Fade in the backdrop and scale the dialog from 95% to 100% on open.
- **Focus trap:** Tab and Shift+Tab cycle inside the dialog only.
- Render it with `createPortal` into `document.body`, and explain why that
  helps.
- Build a second version with the native `<dialog>` element and
  `showModal()`, and compare the two.

## What's being evaluated

- **`position: fixed`** and `inset: 0` for the backdrop.
- **Centering** a box of unknown height.
- **`z-index` and stacking contexts:** why the modal might end up *behind*
  something.
- **A flex column with a scrolling middle** (`min-height: 0`).
- **Scroll lock** and **focus management**.

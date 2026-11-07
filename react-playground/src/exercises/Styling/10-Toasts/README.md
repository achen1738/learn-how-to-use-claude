# 10 · Toast Notifications

**Time:** 45–60 min · plain CSS in `Toasts.css` only.

Build a toast notification system. `Toasts.jsx` has buttons that should
trigger toasts.

## Requirements

- Buttons trigger **success**, **error**, **info** and **long message**
  toasts.
- Toasts stack in the **bottom-right corner** of the window, 16px from the
  edges, **newest at the bottom**, with an 8px gap between them.
- Each toast: a colored left border and icon by type (✓ green, ✕ red, ℹ
  blue), the message, and a close button (✕). Fixed **width of 360px**.
  Long messages wrap.
- New toasts **slide in** from the right.
- Toasts **disappear by themselves after 3 seconds**, or when closed.
- At most **5** toasts at once: adding a sixth removes the oldest.
- **Phone (below 600px):** toasts span the full width at the bottom, with
  16px side margins.
- Toasts must not block clicks on the page around them: the empty space in
  the toast area should be click-through.
- **Accessibility:** screen readers announce new toasts. Use
  `role="status"` (or `aria-live="polite"`) for info and success, and
  `role="alert"` for errors. The live region must already exist in the page
  before toasts are added to it.

## Stretch

- **Pause on hover:** the countdown pauses while the mouse is over a toast,
  and resumes when it leaves.
- **Exit animation:** toasts slide out before being removed.
- **Smooth reflow:** when a toast is removed, the others glide into place
  instead of jumping.
- A thin progress bar along the bottom of each toast shows the time left.

## What's being evaluated

- **`position: fixed`** container with a flex column.
- **`@keyframes`** enter animation and the unmount problem for exit
  animations.
- **`pointer-events`** for the click-through container.
- **Timers in React:** cleaning them up, and pausing them.
- **Live regions** and how screen readers find out about new content.

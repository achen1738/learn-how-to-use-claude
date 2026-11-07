# 01 · Profile Card

**Time:** 20–30 min · plain CSS in `ProfileCard.css` only.

Build a team member card and show the three users from `ProfileCard.jsx` in
a row. Start in `ProfileCard.jsx`; it's already in the sidebar.

## Requirements

- Each card shows a round avatar, name, job title, a short bio, and two
  buttons: **Follow** and **Message**.
- The avatar is a **circle, 96px**, and the image must not look squashed or
  stretched. The source images are deliberately not square.
- Center the content. Give the card padding, rounded corners, a light border
  or shadow, and consistent spacing between sections.
- Cards are **280px wide** and sit in a row with a gap. When the window is
  too narrow, they wrap onto the next line.
- **Follow** is a filled primary button. Clicking it switches to
  **Following** with a different (outlined) look. **Message** is an outlined
  secondary button.
- Both buttons need **hover**, **focus-visible** and **disabled** styles.
  The blocked user's buttons are disabled.
- The long name must not break the card: no text spilling out, and the card
  stays 280px wide.

## Stretch

- Show a small green "online" dot on the avatar's bottom right, with a white
  ring around it, for users who are online.
- Make the whole card lift slightly on hover (shadow + small translate),
  without moving the cards next to it.
- Keep the buttons pinned to the bottom so all cards in a row line up, even
  when the bios are different lengths.

## What's being evaluated

- **Box model:** padding vs margin vs `gap`, and `box-sizing`.
- **Images:** `object-fit` and keeping a fixed shape.
- **Text overflow:** wrapping vs truncating, and choosing one on purpose.
- **Interactive states:** every button looks clickable, focused and disabled.
- **Semantics:** a heading for the name, real buttons, useful `alt` text.

# 01 · Profile Card: Solution Notes

Spoilers below.

## Markup

A `<ul>` of cards (it's a list of people), each card an `<article>` or
`<li>` with an `<h3>` for the name, a `<p>` for the title and bio, and two
`<button type="button">`s. Avatar `alt` should be the person's name (or `""`
if the name is right next to it, since a screen reader would read it twice).

## Layout

```css
.profile-card-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  list-style: none;
  padding: 0;
  margin: 0;
}

.profile-card {
  box-sizing: border-box;
  width: 280px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 1px 3px rgb(0 0 0 / 0.08);
}
```

`box-sizing: border-box` means the 280px includes padding and border.
Without it the card is 280 + 48 + 2 = 330px.

## Avatar

```css
.profile-card__avatar-wrap { position: relative; }

.profile-card__avatar {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  object-fit: cover;
  display: block;
}

.profile-card__status {
  position: absolute;
  right: 4px;
  bottom: 4px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #22c55e;
  border: 2px solid #fff;
}
```

- `object-fit: cover` crops instead of stretching. Without it the wide image
  becomes an oval squashed into a circle.
- `display: block` removes the few pixels of gap under inline images.
- The status dot is `absolute` inside a `relative` wrapper, not the card, so
  it stays attached to the avatar.

## Long name

`overflow-wrap: anywhere` (or `break-word`) on the name lets a very long word
break. The alternative is truncating to one line:

```css
.profile-card__name {
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

If you truncate, add a `title` attribute so the full name is still
reachable. Say which you chose and why: wrapping shows everything, truncating
keeps cards the same height.

## Buttons

```css
.profile-card__btn {
  font: inherit;
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid #4f46e5;
  cursor: pointer;
}
.profile-card__btn--primary { background: #4f46e5; color: #fff; }
.profile-card__btn--secondary { background: #fff; color: #4f46e5; }
.profile-card__btn--primary:hover:not(:disabled) { background: #4338ca; }
.profile-card__btn--secondary:hover:not(:disabled) { background: #eef2ff; }
.profile-card__btn:focus-visible {
  outline: 2px solid #4f46e5;
  outline-offset: 2px;
}
.profile-card__btn:disabled { opacity: 0.5; cursor: not-allowed; }
```

- `font: inherit` because buttons don't inherit the page font by default.
- `:focus-visible` instead of `:focus` shows the ring for keyboard users but
  not on mouse click. Never just remove the outline.
- Add `aria-pressed={isFollowing}` to the Follow button so screen readers
  hear the toggle state.

## Stretch: buttons at the bottom

Wrap the buttons in a `.profile-card__actions` row with `margin-top: auto`.
In a column flex container, auto margin soaks up the leftover space and pushes
the row to the bottom. Cards in the same row are already the same height
because flex items stretch by default.

## Stretch: hover lift

```css
.profile-card { transition: transform 150ms ease, box-shadow 150ms ease; }
.profile-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgb(0 0 0 / 0.12);
}
```

`transform` doesn't affect layout, so neighbours don't move. Changing
`margin-top` would.

## Common mistakes

- `width: 96px; height: 96px` without `object-fit`, so the image distorts.
- `outline: none` on buttons with no replacement focus style.
- Fixed `height` on the card, so the long bio overflows.
- Unprefixed class names like `.card`, which leak into other exercises.

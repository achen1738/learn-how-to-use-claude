# 04 · Product Grid: Solution Notes

Spoilers below.

## The grid, no media queries

```css
.product-grid {
  --product-grid-min: 220px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(var(--product-grid-min), 100%), 1fr));
  gap: 20px;
  list-style: none;
  padding: 0;
  margin: 0;
}
```

- `minmax(220px, 1fr)`: each column is at least 220px and they share the
  leftover space equally.
- `auto-fill` vs `auto-fit`: with few items, `auto-fill` keeps empty column
  slots (cards stay card-sized), while `auto-fit` collapses the empty slots
  so the cards stretch to fill the row. With 10 products you won't see a
  difference on most screens. Filter to 2 items to see it.
- `min(220px, 100%)` stops a 220px column from overflowing on a container
  narrower than 220px.
- Compact stretch: change `--product-grid-min` to `160px` on a modifier
  class.

## Card: equal heights and button at the bottom

```css
.product-grid__card {
  display: flex;
  flex-direction: column;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
}

.product-grid__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 16px 16px;
}

.product-grid__button { margin-top: auto; }
```

Grid items in the same row stretch to the row's height by default. The card
is a flex column, the body takes the remaining space (`flex: 1`), and
`margin-top: auto` pushes the button to the bottom.

## Image box

```css
.product-grid__media {
  position: relative;
  aspect-ratio: 4 / 3;
  background: #f3f4f6;
}

.product-grid__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.product-grid__card--sold-out .product-grid__image { opacity: 0.4; filter: grayscale(1); }
```

`aspect-ratio` on the wrapper reserves the space before the image loads, so
the page doesn't jump. `object-fit: contain` is the alternative if cropping
products is unacceptable. Say which and why.

## Badges

```css
.product-grid__badge {
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
  background: #dc2626;
}
```

The wrapper is `position: relative`, so the badge measures from the image
box, not the card or the page.

## Two-line clamp

```css
.product-grid__title {
  margin: 0;
  font-size: 16px;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
}
```

The `-webkit-` version is the one that works everywhere today, even in
Firefox. Put the full title in a `title` attribute. Screen readers read the
full text anyway, since it's only visually cut off.

Optional: `min-height: calc(2 * 1.3em)` reserves two lines so one-line titles
don't make the prices sit at different heights.

## Prices

```jsx
{salePrice ? (
  <p className="product-grid__price">
    <span className="visually-hidden">Was </span>
    <s>{formatPrice(price)}</s>
    <span className="visually-hidden">, now </span>
    <strong>{formatPrice(salePrice)}</strong>
  </p>
) : (
  <p className="product-grid__price"><strong>{formatPrice(price)}</strong></p>
)}
```

`<s>` alone isn't announced as "struck through" by most screen readers, so
add hidden text. Classic visually-hidden class:

```css
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}
```

## Stretch: CSS stars

Draw "★★★★★" in grey, then lay a gold copy on top whose width is the rating
as a percentage:

```css
.product-grid__stars { position: relative; display: inline-block; color: #d1d5db; }
.product-grid__stars::before {
  content: "★★★★★";
  position: absolute;
  inset: 0;
  width: var(--rating-pct);
  overflow: hidden;
  color: #f59e0b;
}
```

Set `style={{ "--rating-pct": `${rating * 20}%` }}`. Passing a CSS variable
from React is the one acceptable inline style here, because it's data, not
styling. Add `aria-label={`${rating} out of 5`}`.

## Common mistakes

- Media queries with fixed column counts instead of letting the grid decide.
- Fixed `height` on cards, which breaks the long description.
- `object-fit` on the image without giving it a height, so nothing changes.
- Forgetting `overflow: hidden` on the card, so the image corners stick out of
  the rounded border.

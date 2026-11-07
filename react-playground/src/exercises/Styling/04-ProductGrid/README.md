# 04 · Product Grid

**Time:** 30–45 min · plain CSS in `ProductGrid.css` only.

Build a responsive grid of product cards from `PRODUCTS` in
`ProductGrid.jsx`.

## Requirements

- **Columns adapt to the width:** each card is at least 220px wide and as
  many columns as fit are shown, filling the row. Aim for 4 on a wide
  desktop, 2 on a tablet and 1 on a phone. Try to do it **without any media
  queries**.
- **Image area:** every image box has the same **4:3** shape, whatever the
  image's real size, and the image fills it without stretching.
- **Title:** at most **2 lines**, then cut off with "…". The full title is
  still available (tooltip or screen reader).
- **Price:** shown bold. Items on sale show the old price struck through next
  to the new one, plus a red "Sale" badge in the image's top-left corner.
- **Out of stock:** the image is dimmed, a "Sold out" badge shows on it, and
  the button is disabled with the text "Sold out".
- **Equal heights:** all cards in a row are the same height, and the
  **"Add to cart" button lines up at the bottom** of every card, even when
  titles and descriptions are different lengths.
- Clicking "Add to cart" updates a cart count shown above the grid.

## Stretch

- Star ratings (`rating` is 0–5 with halves) drawn with CSS, not images.
- Cards get a hover shadow, and keyboard focus on the button shows clearly.
- A "Compact" toggle above the grid switches to a smaller card size by
  changing one CSS variable.

## What's being evaluated

- **CSS grid:** `repeat(auto-fill, minmax(...))` and knowing how it differs
  from `auto-fit`.
- **Aspect ratio + `object-fit`** for consistent images.
- **Line clamping** and its browser quirks.
- **Flex column + auto margin** to pin the button.
- **Absolute badges** on top of a `relative` image box.
- **Semantics:** a list of products, prices readable by screen readers
  ("was $40, now $28").

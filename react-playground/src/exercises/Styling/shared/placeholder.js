// Offline placeholder images, so the exercises work without a network.
// Returns an SVG data URI you can use as an <img src>.
//
// Sizes are deliberately mixed (wide, tall, square) so you have to deal
// with images that don't match the box you put them in.
export function placeholderImage({
  label = "",
  width = 400,
  height = 300,
  bg = "#c7d2fe",
  fg = "#312e81",
} = {}) {
  const fontSize = Math.round(Math.min(width, height) / 5);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="${bg}"/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
    font-family="system-ui, sans-serif" font-weight="600" font-size="${fontSize}" fill="${fg}">${label}</text>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

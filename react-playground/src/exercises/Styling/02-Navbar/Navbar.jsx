import "./Navbar.css";

// 02 · Responsive Navbar. The full prompt is in README.md in this folder.
// Write all styles in Navbar.css. Prefix classes with "navbar".

export const LINKS = ["Home", "Products", "Pricing", "Docs", "Blog"];

export function Navbar() {
  // TODO: track the current link and whether the mobile menu is open.
  return (
    <div>
      <h2>Responsive Navbar</h2>
      <p>See README.md for the prompt.</p>

      {/* TODO: your <header> goes here, above the filler content. */}

      <FillerContent />
    </div>
  );
}

// Long content so you can check the header sticks while scrolling.
function FillerContent() {
  return (
    <section>
      {Array.from({ length: 30 }, (_, i) => (
        <p key={i}>
          Paragraph {i + 1}. Scroll down: the header should stay at the top of
          the page.
        </p>
      ))}
    </section>
  );
}

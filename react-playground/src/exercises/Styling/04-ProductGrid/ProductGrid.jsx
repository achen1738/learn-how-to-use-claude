import { placeholderImage } from "../shared/placeholder.js";
import "./ProductGrid.css";

// 04 · Product Grid. The full prompt is in README.md in this folder.
// Write all styles in ProductGrid.css. Prefix classes with "product-grid".

const img = (label, width, height, bg, fg) =>
  placeholderImage({ label, width, height, bg, fg });

// Images have mixed shapes on purpose. Prices are in cents.
export const PRODUCTS = [
  { id: "p1", title: "Desk Lamp", description: "Warm LED, three brightness levels.", price: 4900, salePrice: null, inStock: true, rating: 4.5, image: img("Lamp", 600, 450) },
  { id: "p2", title: "Ergonomic Mesh Office Chair with Adjustable Lumbar Support and Headrest", description: "Breathable mesh back. Long title on purpose.", price: 32900, salePrice: 24900, inStock: true, rating: 4, image: img("Chair", 300, 600, "#fde68a", "#78350f") },
  { id: "p3", title: "Notebook", description: "A5, dotted.", price: 1200, salePrice: null, inStock: true, rating: 3.5, image: img("Book", 500, 500, "#bbf7d0", "#14532d") },
  { id: "p4", title: "Mechanical Keyboard", description: "Hot-swappable switches, aluminium case, USB-C. Comes with a braided cable, a keycap puller and a spare set of switches.", price: 15900, salePrice: null, inStock: false, rating: 5, image: img("Keys", 900, 300, "#fecaca", "#7f1d1d") },
  { id: "p5", title: "Monitor Stand", description: "Bamboo.", price: 3900, salePrice: 2900, inStock: true, rating: 4, image: img("Stand", 640, 480, "#e9d5ff", "#581c87") },
  { id: "p6", title: "Noise Cancelling Headphones", description: "30 hour battery.", price: 22900, salePrice: null, inStock: true, rating: 4.5, image: img("Audio", 400, 300, "#bae6fd", "#0c4a6e") },
  { id: "p7", title: "Cable Organiser", description: "Set of 6 clips.", price: 900, salePrice: null, inStock: false, rating: 3, image: img("Clips", 300, 400, "#fed7aa", "#7c2d12") },
  { id: "p8", title: "Webcam 4K", description: "Auto focus, privacy shutter.", price: 11900, salePrice: 8900, inStock: true, rating: 2.5, image: img("Cam", 800, 600) },
  { id: "p9", title: "Plant", description: "Low maintenance.", price: 2400, salePrice: null, inStock: true, rating: 5, image: img("Plant", 450, 700, "#bbf7d0", "#14532d") },
  { id: "p10", title: "USB-C Hub", description: "7-in-1, HDMI, SD card.", price: 4500, salePrice: null, inStock: true, rating: 4, image: img("Hub", 600, 300, "#e5e7eb", "#111827") },
];

export const formatPrice = (cents) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);

export function ProductGrid() {
  // TODO: render the grid and track the cart count in state.
  return (
    <div>
      <h2>Product Grid</h2>
      <p>See README.md for the prompt.</p>
    </div>
  );
}

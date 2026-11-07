import { useState } from "react";

/**
 * SENIOR REACT INTERVIEW EXERCISE — Reading List: Drag-to-Reorder
 * ------------------------------------------------------------------
 * Time: ~35-45 minutes
 *
 * Like the Notification Inbox exercise, this component has NO
 * deliberate bugs. Removing an article from the list already works
 * correctly today. The exercise is to build genuine drag-and-drop
 * reordering on top of it, the way a real ticket would ask you to.
 *
 * ------------------------------------------------------------------
 * FEATURE: Drag-and-drop reordering (roughly increasing difficulty)
 * ------------------------------------------------------------------
 * 1. BASIC REORDER: Make rows draggable using the native HTML5 Drag
 *    and Drop API (`draggable`, onDragStart/onDragOver/onDrop/onDragEnd
 *    — no library). Dropping a row onto another row should move it to
 *    that position in the list.
 *
 * 2. DROP INDICATOR: While dragging, show a visual indicator of where
 *    the item will land (e.g. a highlighted line between rows) that
 *    updates live as the dragged row moves over different targets —
 *    not just a static highlight on whatever row is currently hovered.
 *
 * 3. PERSIST THE NEW ORDER: On drop, optimistically apply the new
 *    order and call `persistOrder(orderedIds)` (mock API below,
 *    ~15% failure rate). If it fails, revert to the previous order
 *    and show an inline error.
 *
 * 4. KEYBOARD REORDERING: Native HTML5 drag-and-drop is mouse/touch
 *    only — it's entirely unreachable via keyboard. Add a keyboard
 *    path to reordering (e.g. focus a row, Alt+ArrowUp/ArrowDown moves
 *    it) that goes through the same reorder-and-persist logic as the
 *    mouse path, not a separate parallel implementation.
 *
 * 5. ACCESSIBLE ANNOUNCEMENT: When a row is moved (by mouse or
 *    keyboard), announce the new position via aria-live, e.g. "Moved
 *    Article Title to position 2 of 5."
 *
 * 6. STRETCH: Extract the reorder/persist/rollback logic into a
 *    `useReorderableList(items, { onReorder, persist })` hook, and be
 *    ready to discuss why native HTML5 DnD doesn't work on touch
 *    devices at all, and what you'd reach for instead in a real app
 *    (pointer-events-based custom drag, or a library like dnd-kit).
 *
 * ------------------------------------------------------------------
 * The data and handleRemove below are intentionally simple — resist
 * the urge to touch them, the point of the exercise is what you build
 * around them.
 * ------------------------------------------------------------------
 */

export default function ReadingList() {
  const [articles, setArticles] = useState(INITIAL_ARTICLES);
  const [draggedOverId, setDraggedOverId] = useState(null);
  const [error, setError] = useState(null);
  const handleRemove = (id) => {
    setArticles((prev) => prev.filter((a) => a.id !== id));
  };

  // onDragStart/onDragOver/onDrop/onDragEnd
  const handleDragStart = (e, article) => {
    e.dataTransfer.setData("text/plain", article.id);
  };

  const handleDragOver = (e, article) => {
    e.preventDefault();
    setDraggedOverId(article.id);
  };

  const handleDragLeave = (_, __) => {
    setDraggedOverId(null);
  };

  const handleDrop = (e, article) => {
    e.preventDefault();
    const droppedOverId = e.dataTransfer.getData("text/plain");
    let droppedOverIndex = articles.findIndex((a) => a.id === article.id);
    let draggedIndex = articles.findIndex((a) => a.id === parseInt(droppedOverId));
    const newArticles = [...articles];
    const [draggedArticle] = newArticles.splice(draggedIndex, 1);
    newArticles.splice(droppedOverIndex, 0, draggedArticle);
    persistOrder(newArticles.map((a) => a.id))
      .then(() => {
        setArticles(newArticles);
        setError(null);
      })
      .catch((error) => {
        setError(error);
      });
    setDraggedOverId(null);
  };

  const handleDragEnd = (e, _) => {
    e.preventDefault();
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Reading List</h2>

      {/* TODO: aria-live region for reorder announcements goes here */}

      <ul style={styles.list}>
        {articles.map((article) => (
          <li
            onDrop={(e) => handleDrop(e, article)}
            onDragOver={(e) => handleDragOver(e, article)}
            onDragLeave={(e) => handleDragLeave(e, article)}
            key={article.id}
            style={
              draggedOverId === article.id ? { ...styles.item, ...styles.hoveredOver } : styles.item
            }
          >
            <div
              draggable
              onDragStart={(e) => handleDragStart(e, article)}
              onDragEnd={(e) => handleDragEnd(e, article)}
              style={styles.content}
            >
              <div style={styles.title}>{article.title}</div>
              <div style={styles.source}>{article.source}</div>
            </div>
            <button
              onClick={() => handleRemove(article.id)}
              style={styles.removeButton}
              aria-label={`Remove ${article.title}`}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
      <div>{error && <p style={styles.error}>{error.message}</p>}</div>
    </div>
  );
}

const INITIAL_ARTICLES = [
  { id: 1, title: "The Cost of JavaScript in 2025", source: "web.dev" },
  { id: 2, title: "A Deep Dive into React Fiber", source: "overreacted.io" },
  { id: 3, title: "CSS Container Queries, Explained", source: "css-tricks.com" },
  { id: 4, title: "Designing Resilient Retry Logic", source: "aws.amazon.com" },
  { id: 5, title: "What Happens When You Type a URL", source: "github.com" },
];

// ------------------------------------------------------------------
// Mock API — leave as-is. Simulates latency (150-600ms) and a ~15%
// failure rate so rollback handling can be exercised.
// ------------------------------------------------------------------
function persistOrder(orderedIds) {
  const latency = 150 + Math.random() * 450;
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < 0.15) {
        reject(new Error("Failed to save new order"));
        return;
      }
      resolve(orderedIds);
    }, latency);
  });
}

const styles = {
  container: {
    maxWidth: 420,
    margin: "40px auto",
    fontFamily: "system-ui, sans-serif",
  },
  heading: {
    fontSize: 16,
    marginBottom: 12,
  },
  list: {
    listStyle: "none",
    margin: 0,
    padding: 0,
    border: "1px solid #eee",
    borderRadius: 6,
    overflow: "hidden",
  },
  item: {
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    borderBottom: "1px solid #f2f2f2",
    background: "#fff",
  },
  hoveredOver: {
    borderBottom: "2px solid #007bff",
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 14,
    fontWeight: 600,
  },
  source: {
    fontSize: 12,
    color: "#888",
  },
  removeButton: {
    background: "none",
    border: "none",
    color: "#999",
    cursor: "pointer",
    fontSize: 14,
  },
};

import { useState, useEffect, useRef } from "react";

/**
 * SENIOR REACT INTERVIEW EXERCISE — Typeahead Search
 * ---------------------------------------------------
 * Time: ~35-45 minutes
 *
 * This component fetches suggestions from a mock API as the user types.
 * It "works" for a happy-path demo, but has several bugs and missing
 * features that a senior engineer should be able to spot and fix.
 *
 * Ask the candidate to talk through the problems out loud before fixing
 * them — the diagnosis matters as much as the fix.
 *
 * ------------------------------------------------------------------
 * TASKS (roughly increasing difficulty — pick as many as time allows)
 * ------------------------------------------------------------------
 * 1. RACE CONDITION: Type quickly (e.g. "a", "ap", "app"). Slower
 *    requests can resolve after faster ones and overwrite results with
 *    stale data. Fix it (ignore-flag, AbortController, or request id).
 *
 * 3. NO CANCELLATION: Add an AbortController so in-flight requests are
 *    cancelled when the query changes or the component unmounts.
 *
 * 4. NO LOADING / ERROR STATE: The UI gives no feedback while fetching
 *    and swallows errors silently. Add both.
 *
 * 5. NO CACHING: Re-searching the same query re-fetches. Add a simple
 *    in-memory cache (e.g. a ref-backed Map) keyed by query.
 *
 * 6. ACCESSIBILITY: The suggestion list isn't keyboard-navigable and
 *    has no ARIA wiring for a combobox pattern. Add arrow-key
 *    navigation, Enter to select, Escape to close, and appropriate
 *    aria-* attributes (role="combobox", aria-expanded,
 *    aria-activedescendant, role="listbox"/"option", etc).
 *
 * 7. STRETCH: Extract the data-fetching logic into a reusable
 *    `useSearch(query)` hook so it could be unit tested independently
 *    of the UI.
 *
 * ------------------------------------------------------------------
 * Mock API is at the bottom — simulates network latency and randomly
 * throws to exercise error handling. Do not need to change it.
 * ------------------------------------------------------------------
 */

export default function TypeaheadSearch() {
  const [query, setQuery] = useState("");
  const { results, loading, error } = useSearch(query);

  return (
    <div style={styles.container}>
      <label htmlFor="search-input" style={styles.label}>
        Search products
      </label>
      <input
        id="search-input"
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Try typing 'lap', 'phone', or 'watch'..."
        style={styles.input}
        // TODO: wire up combobox ARIA attributes here
      />

      {loading && <p style={styles.loading}>Loading...</p>}
      {error && <p style={styles.error}>Error: {error.message}</p>}

      <ul style={styles.list}>
        {results.map((item) => (
          <li key={item.id} style={styles.item}>
            {item.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ------------------------------------------------------------------
// Mock API — leave as-is. Simulates variable latency (100-900ms) and
// a ~15% failure rate so error handling can actually be exercised.
// ------------------------------------------------------------------
const CATALOG = [
  { id: 1, name: "Laptop Pro 14" },
  { id: 2, name: "Laptop Air 13" },
  { id: 3, name: "Smartphone X" },
  { id: 4, name: "Smartphone X Mini" },
  { id: 5, name: "Smart Watch Series 5" },
  { id: 6, name: "Wireless Earbuds" },
  { id: 7, name: "Tablet 11-inch" },
  { id: 8, name: "Desktop Tower" },
];


const useSearch = (query) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const cacheRef = useRef({});
  // BUG: no cancellation, no ignore-stale-response guard, no loading/error state.
  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }
    const abortController = new AbortController();

    if (cacheRef.current[query]) {
      setResults(cacheRef.current[query]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);
    const timeoutId = setTimeout(() => {
      fetchSuggestions(query, { signal: abortController.signal }).then((data) => {
        setResults(data);
        cacheRef.current[query] = data;
      }).catch((err) => {
        if (err.name !== "AbortError") setError(err); 
      }).finally(() => {
        setLoading(false);
      });
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      abortController.abort();
    };
  }, [query]);

  return {results, loading, error};
}

function fetchSuggestions(query, { signal } = {}) {
  const latency = 100 + Math.random() * 800;

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      if (Math.random() < 0.15) {
        reject(new Error("Network error: failed to fetch suggestions"));
        return;
      }
      const matches = CATALOG.filter((item) =>
        item.name.toLowerCase().includes(query.toLowerCase())
      );
      resolve(matches);
    }, latency);

    if (signal) {
      signal.addEventListener("abort", () => {
        clearTimeout(timer);
        reject(new DOMException("Aborted", "AbortError"));
      });
    }
  });
}

const styles = {
  container: {
    maxWidth: 360,
    margin: "40px auto",
    fontFamily: "system-ui, sans-serif",
  },
  label: {
    display: "block",
    marginBottom: 6,
    fontSize: 14,
    fontWeight: 600,
  },
  input: {
    width: "100%",
    padding: "8px 10px",
    fontSize: 14,
    border: "1px solid #ccc",
    borderRadius: 4,
    boxSizing: "border-box",
  },
  list: {
    listStyle: "none",
    margin: "4px 0 0",
    padding: 0,
    border: "1px solid #eee",
    borderRadius: 4,
  },
  item: {
    padding: "8px 10px",
    fontSize: 14,
    borderBottom: "1px solid #f2f2f2",
  },
};

import { getPath } from "./get-path.js";

// Sort specs look like "created" (ascending) or "-created" (descending).
// Several keys can be combined with commas: "-amount,name".

function compareValues(a, b) {
  if (a == null && b == null) return 0;
  if (a == null) return 1; // missing values sort last
  if (b == null) return -1;
  if (typeof a === "string" && typeof b === "string") return a.localeCompare(b);
  return a < b ? -1 : a > b ? 1 : 0;
}

export function comparatorFor(spec, schema) {
  const keys = spec
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const descending = part.startsWith("-");
      const field = schema.field(descending ? part.slice(1) : part);
      return { path: field.path, direction: descending ? -1 : 1 };
    });

  return (a, b) => {
    for (const { path, direction } of keys) {
      const result = compareValues(getPath(a, path), getPath(b, path));
      if (result !== 0) return result * direction;
    }
    return 0;
  };
}

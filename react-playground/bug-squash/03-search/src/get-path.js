/** Reads a dotted path such as "subscription.plan" from an object; undefined if any step is missing. */
export function getPath(object, path) {
  let value = object;
  for (const key of path.split(".")) {
    if (value == null) return undefined;
    value = value[key];
  }
  return value;
}

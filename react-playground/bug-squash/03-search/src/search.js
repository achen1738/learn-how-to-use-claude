import { compile } from "./evaluate.js";
import { parse } from "./parser.js";
import { CUSTOMER_SCHEMA } from "./schema.js";
import { comparatorFor } from "./sort.js";

/**
 * Filters `records` with a query string.
 *
 * Results keep the order of `records` unless `sort` is given. `records` is
 * never modified.
 *
 * @param {object[]} records
 * @param {string} query
 * @param {{schema?: object, sort?: string, limit?: number}} [options]
 */
export function search(records, query, { schema = CUSTOMER_SCHEMA, sort, limit = Infinity } = {}) {
  const tree = parse(query);
  let matched = tree.type === "all" ? records : records.filter(compile(tree, schema));
  if (sort) matched.toSorted(comparatorFor(sort, schema));

  return matched.slice(0, limit);
}

/** Parses and compiles a query once, for filtering many batches of records. */
export function compileQuery(query, schema = CUSTOMER_SCHEMA) {
  return compile(parse(query), schema);
}

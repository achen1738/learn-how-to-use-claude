import { QueryError } from "./errors.js";
import { closestMatch } from "./suggest.js";

// Describes which fields a query may reference and how to compare them.
//
// Field options:
//   type      "string" | "enum" | "number" | "date" | "boolean"
//   path      where the value lives on a record (defaults to the field name)
//   values    allowed values, for enums
//   multi     the record holds an array; the term matches if any element does
//   aliases   other names users may type for this field

export function defineSchema(fields, { textFields = [] } = {}) {
  const byName = new Map();
  for (const [name, options] of Object.entries(fields)) {
    const field = Object.freeze({ name, path: name, multi: false, aliases: [], ...options });
    for (const key of [name, ...field.aliases]) {
      if (byName.has(key)) throw new Error(`Duplicate field name or alias: ${key}`);
      byName.set(key, field);
    }
  }

  return Object.freeze({
    textFields,
    names: [...byName.keys()],

    field(name, position) {
      const field = byName.get(name);
      if (field) return field;
      const suggestion = closestMatch(name, [...byName.keys()]);
      throw new QueryError(
        `Unknown field "${name}".` + (suggestion ? ` Did you mean "${suggestion}"?` : ""),
        position,
      );
    },
  });
}

export const CUSTOMER_SCHEMA = defineSchema(
  {
    id: { type: "string" },
    name: { type: "string" },
    email: { type: "string" },
    status: { type: "enum", values: ["active", "trialing", "past_due", "canceled"] },
    plan: { type: "enum", path: "subscription.plan", values: ["free", "starter", "pro", "enterprise"] },
    amount: { type: "number", path: "subscription.amount", aliases: ["mrr"] },
    country: { type: "string", path: "address.country" },
    created: { type: "date", aliases: ["signup"] },
    delinquent: { type: "boolean" },
    tag: { type: "string", path: "tags", multi: true, aliases: ["tags"] },
  },
  { textFields: ["name", "email"] },
);

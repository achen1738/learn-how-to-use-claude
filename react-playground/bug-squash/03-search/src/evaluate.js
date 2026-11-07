import { QueryError } from "./errors.js";
import { getPath } from "./get-path.js";

// Compiles an AST into a predicate function `(record) => boolean`.
//
// All validation (unknown fields, bad numbers, unsupported operators) happens
// at compile time, so a bad query fails before any record is looked at.

const ORDERING_OPS = new Set([">", "<", ">=", "<="]);

function compareOrdered(op, left, right) {
  switch (op) {
    case ":":
      return left === right;
    case "!=":
      return left !== right;
    case ">":
      return left > right;
    case "<":
      return left < right;
    case ">=":
      return left >= right;
    case "<=":
      return left <= right;
    default:
      throw new Error(`Unhandled operator ${op}`);
  }
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** "acme" matches exactly (ignoring case); "*@acme.com" and "gr*" are wildcards. */
function stringMatcher(pattern) {
  const lowered = pattern.toLowerCase();
  if (!lowered.includes("*")) return (value) => String(value).toLowerCase() === lowered;
  const regex = new RegExp(`^${lowered.split("*").map(escapeRegExp).join(".*")}$`);
  return (value) => regex.test(String(value).toLowerCase());
}

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

/** Builds a test for a single (non-array) value of the field. */
function valueTest(field, op, raw, pos) {
  const unsupported = () =>
    new QueryError(`Operator "${op}" isn't supported for ${field.type} field "${field.name}"`, pos);

  switch (field.type) {
    case "string": {
      if (ORDERING_OPS.has(op)) throw unsupported();
      const matches = stringMatcher(raw);
      return op === "!=" ? (v) => v != null && !matches(v) : (v) => v != null && matches(v);
    }

    case "enum": {
      if (ORDERING_OPS.has(op)) throw unsupported();
      const wanted = raw.toLowerCase();
      if (!field.values.includes(wanted)) {
        throw new QueryError(`Unknown ${field.name} "${raw}". Expected one of: ${field.values.join(", ")}`, pos);
      }
      return op === "!=" ? (v) => v !== wanted : (v) => v === wanted;
    }

    case "number": {
      const wanted = Number(raw);
      if (raw.trim() === "" || Number.isNaN(wanted)) {
        throw new QueryError(`Expected a number for ${field.name}, got "${raw}"`, pos);
      }
      return (v) => typeof v === "number" && compareOrdered(op, v, wanted);
    }

    case "date": {
      if (!ISO_DAY.test(raw)) throw new QueryError(`Expected a date like 2026-01-31 for ${field.name}, got "${raw}"`, pos);
      // Compare calendar days as strings: "2025-03-04" < "2025-11-02" lexically and chronologically.
      return (v) => typeof v === "string" && compareOrdered(op, v.slice(0, 10), raw);
    }

    case "boolean": {
      if (op !== ":" && op !== "!=") throw unsupported();
      if (raw !== "true" && raw !== "false") {
        throw new QueryError(`Expected true or false for ${field.name}, got "${raw}"`, pos);
      }
      const wanted = raw === "true";
      return op === "!=" ? (v) => v !== wanted : (v) => v === wanted;
    }

    default:
      throw new Error(`Field ${field.name} has unknown type ${field.type}`);
  }
}

function compileCompare(node, schema) {
  const field = schema.field(node.field, node.pos);
  const test = valueTest(field, node.op, node.value, node.pos);
  if (!field.multi) return (record) => test(getPath(record, field.path));
  return (record) => {
    const values = getPath(record, field.path) ?? [];
    return node.op === "!=" ? values.every(test) : values.some(test);
  };
}

function compileText(node, schema) {
  const needle = node.value.toLowerCase();
  return (record) =>
    schema.textFields.some((path) => {
      const value = getPath(record, path);
      return value != null && String(value).toLowerCase().includes(needle);
    });
}

export function compile(node, schema) {
  switch (node.type) {
    case "all":
      return () => true;
    case "and": {
      const predicates = node.children.map((child) => compile(child, schema));
      return (record) => predicates.every((predicate) => predicate(record));
    }
    case "or": {
      const predicates = node.children.map((child) => compile(child, schema));
      return (record) => predicates.some((predicate) => predicate(record));
    }
    case "not": {
      const predicate = compile(node.child, schema);
      return (record) => !predicate(record);
    }
    case "compare":
      return compileCompare(node, schema);
    case "text":
      return compileText(node, schema);
    default:
      throw new TypeError(`Unknown node type: ${node.type}`);
  }
}

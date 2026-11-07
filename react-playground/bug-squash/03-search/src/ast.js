// AST node constructors and a printer for debugging.
//
// Node shapes:
//   { type: "all" }                                  matches everything (empty query)
//   { type: "and", children: [node, ...] }
//   { type: "or", children: [node, ...] }
//   { type: "not", child: node }
//   { type: "compare", field, op, value, pos }      status:active, amount>=100
//   { type: "text", value, pos }                     free text: grace, "Grace Hopper"

export const all = () => ({ type: "all" });

/** Builds an AND node, flattening nested ANDs and unwrapping single children. */
export function and(children) {
  const flat = children.flatMap((child) => (child.type === "and" ? child.children : [child]));
  return flat.length === 1 ? flat[0] : { type: "and", children: flat };
}

/** Builds an OR node, flattening nested ORs and unwrapping single children. */
export function or(children) {
  const flat = children.flatMap((child) => (child.type === "or" ? child.children : [child]));
  return flat.length === 1 ? flat[0] : { type: "or", children: flat };
}

export const not = (child) => ({ type: "not", child });

export const compare = (field, op, value, pos) => ({ type: "compare", field, op, value, pos });

export const text = (value, pos) => ({ type: "text", value, pos });

/**
 * Renders an AST as an S-expression, which is much easier to eyeball than JSON:
 *
 *   printAst(parse("-status:canceled plan:pro"))
 *   // (and (not (status : "canceled")) (plan : "pro"))
 */
export function printAst(node) {
  switch (node.type) {
    case "all":
      return "(all)";
    case "and":
    case "or":
      return `(${node.type} ${node.children.map(printAst).join(" ")})`;
    case "not":
      return `(not ${printAst(node.child)})`;
    case "compare":
      return `(${node.field} ${node.op} ${JSON.stringify(node.value)})`;
    case "text":
      return `(text ${JSON.stringify(node.value)})`;
    default:
      throw new TypeError(`Unknown node type: ${node.type}`);
  }
}

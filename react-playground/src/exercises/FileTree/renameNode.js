/**
 * Returns a new tree where the node with `id` has the new `name`, without
 * recursion and without modifying `nodes` (it works on frozen data).
 *
 * Only the nodes on the path from the top to the renamed node are copied.
 * Every other folder and file is reused as-is, so unchanged subtrees keep the
 * same identity (=== the old ones) and React can skip re-rendering them.
 */
export function renameNode(nodes, id, name) {
  // 1. Find the target with an explicit stack instead of the call stack.
  //    Each entry remembers the path of child indexes that leads to it, e.g.
  //    [0, 3, 1] means nodes[0].children[3].children[1].
  const stack = nodes.map((node, index) => ({ node, path: [index] }));
  let path = null;

  while (stack.length > 0) {
    const { node, path: current } = stack.pop();
    if (node.id === id) {
      path = current;
      break;
    }
    node.children?.forEach((child, index) => {
      stack.push({ node: child, path: [...current, index] });
    });
  }

  if (!path) return nodes; // no such id: return the same tree, nothing changes

  // 2. Walk down the path, collecting the array we pass through at each depth.
  //    lists[0] is the top level, lists[1] is the children of the first node
  //    on the path, and so on. The target lives in lists[lists.length - 1].
  const lists = [nodes];
  for (let depth = 0; depth < path.length - 1; depth++) {
    lists.push(lists[depth][path[depth]].children);
  }

  // 3. Rebuild from the bottom up. At each level, copy the array with the one
  //    changed entry swapped in (Array#with returns a new array), then copy
  //    the parent folder so it points at the new children.
  let depth = path.length - 1;
  let replacement = { ...lists[depth][path[depth]], name };

  for (; depth > 0; depth--) {
    const newChildren = lists[depth].with(path[depth], replacement);
    replacement = { ...lists[depth - 1][path[depth - 1]], children: newChildren };
  }

  return lists[0].with(path[0], replacement);
}

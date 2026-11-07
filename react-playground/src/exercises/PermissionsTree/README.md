# Role Permissions

**Time:** ~60–90 min · function components + hooks only, no state libraries.

Build the "Edit role" screen of an admin dashboard: a tree of nested
checkboxes for granting permissions, using the data in `permissions.js`.
The data is deep-frozen, so every update has to build new values.

Start in `PermissionsTree.jsx`; it's already registered in the sidebar.

## Part 1: Render and expand

- Show the tree with indentation and an expand/collapse toggle on every
  group. Everything starts expanded.
- Each leaf shows its label, with its description as smaller text below.
- Leaves in `INITIAL_GRANTED` start checked.

## Part 2: Checkboxes that spread down and roll up

- Checking a **group** grants every leaf underneath it, at every depth.
  Unchecking it removes them all.
- A group's checkbox shows one of three states, based on the leaves under it:
  - **checked:** all granted
  - **unchecked:** none granted
  - **indeterminate:** some granted

  `indeterminate` is a DOM property, not an HTML attribute, so you'll need a
  ref to set it.
- Checking or unchecking a single leaf updates every group above it.

## Part 3: Locked permissions

- Locked leaves show a 🔒 and their `lockedReason` (a `title` tooltip is
  enough). Their checkbox is disabled and never changes.
- Clicking a group only affects its **unlocked** leaves:
  - if every unlocked leaf is granted, clicking removes them all;
  - otherwise clicking grants them all.
- A group's three states still count **all** its leaves, locked ones
  included. "Payouts" with only "View payouts" granted is indeterminate, and
  clicking it grants nothing new, because the other two leaves are locked off.
  It must not get stuck flickering.
- A group where every leaf is locked (Compliance) has a disabled checkbox.

## Part 4: Search

- A search box filters the tree by leaf label or description
  (case-insensitive).
- Show matching leaves **plus the groups above them**, so they stay in
  context. Hide groups with no matches. Matching groups are shown expanded
  while searching.
- **Grant all results** grants every *visible, unlocked* matching leaf, and
  nothing that's hidden. Try searching "view", then granting all results.
- Clearing the search restores each group's expand/collapse state from before
  the search.

## Part 5: Summary, Reset and Save

- A summary bar: `12 of 40 permissions` and, per top-level group,
  `Billing 4/10`.
- The changes since `INITIAL_GRANTED`: `+2 added · −1 removed`, with a
  "Show changes" toggle that lists them by label.
- **Reset** returns to `INITIAL_GRANTED`. **Save** makes the current state the
  new baseline (no server needed). Both are disabled when nothing changed.
  Granting then removing the same leaf counts as no change.

## Stretch

- **Presets:** apply a preset from `PRESETS`. Patterns use `*` as a wildcard
  on leaf ids (`"api.*"`, `"*.view"`). Locked leaves keep their locked value.
- **Undo / Redo** with Ctrl+Z / Ctrl+Shift+Z, covering clicks, presets,
  grant-all-results and Reset (but not search or expand/collapse).
- **Keyboard:** arrow keys move between rows, Right/Left expand and collapse,
  Space toggles.

## What's being evaluated

- **Minimal state.** The only stored permission state should be the set of
  granted leaf ids (and the saved baseline). Group states, counts and the
  list of changes are all computed from it. Be ready to say why storing a
  `checked` flag on groups goes wrong.
- **Choosing the right data structure:** a `Set` for "is this id granted?"
  lookups, and a way to get all leaves under a group without searching the
  whole tree every time.
- **Tree traversal:** collecting leaves (down), group state (up) and
  filtering by search (keep a group if anything under it matches), much like
  the comment-thread pruning.
- **Immutable updates** to a `Set`: a new `Set` per change, never `.add()` on
  the one in state.
- **Edge cases:** locked leaves on and off, a fully locked group, a group with
  one child, uneven nesting (API keys is 4 levels deep, Team is 2).

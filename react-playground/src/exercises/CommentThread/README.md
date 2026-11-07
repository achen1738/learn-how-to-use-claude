# Comment Thread

**Time:** ~60–90 min · function components + hooks only, no state libraries.

Build a Reddit-style nested comment thread on top of the data in
`comments.js`. The data is a **flat, unordered, deep-frozen** list, so every
change has to be an immutable update. Mutating it throws.

Start in `CommentThread.jsx`; it's already registered in the sidebar.

## Part 1: Render the thread

- Turn the flat list into a nested thread. Replies can appear in the list
  **before** their parent.
- Indent each level. Show author, score, the body and how long ago it was
  posted (relative to `NOW`, e.g. "2h ago").
- Deleted comments show `[deleted]` with no author or actions, but their
  replies still show.
- Sort siblings **by score, highest first**; break ties with the newest first.

## Part 2: Reply

- Every comment has a **Reply** button that opens an inline textarea under it.
- Submitting adds a reply by `CURRENT_USER` with score 1 and your vote set to
  up, then closes the form. It should appear immediately in the right place.
- Empty or whitespace-only replies can't be submitted.
- Only one reply form is open at a time.
- There's also a box at the top for a new top-level comment.

## Part 3: Edit and delete your own comments

- Comments by `CURRENT_USER` get **Edit** and **Delete**.
- Edit swaps the body for a textarea prefilled with the current text, with
  Save and Cancel. Cancel restores the original text.
- Delete has two cases:
  - **No replies:** remove it completely.
  - **Has replies:** keep it as a `[deleted]` placeholder so the replies stay
    in place.
- **Clean-up:** if removing a comment leaves a `[deleted]` parent with no
  replies, remove that parent too. Keep going up as far as needed.
  - Try it: under Bob's comment (`c2`) there's a `[deleted]` →
    `[deleted]` → your comment chain (`c24` → `c25` → `c26`). Deleting
    `c26` should make all three disappear.
  - Under the top-level `[deleted]` comment (`c5`), deleting your reply
    `c21` removes only it, because `c20` is still there.
  - Deleting `c3` (yours, has a reply) leaves a `[deleted]` placeholder
    above Frank's reply.

## Part 4: Voting and sorting

- ▲ and ▼ buttons on each live comment, highlighted when active.
- Clicking your current vote removes it. Clicking the opposite one switches.
  The score must stay correct:
  - none → up: +1 · up → none: −1 · up → down: −2
- A **Top / New** toggle above the thread changes how siblings are ordered
  (New = newest first). The order you store must not change; sorting is only
  for display.
- Sorting happens among siblings only; a reply never moves to another parent.

## Part 5: Collapse

- A `[–]` toggle on each comment collapses its replies, showing
  `[+] 5 replies` instead. The count is **all** replies underneath, not just
  direct ones.
- Collapsed state survives voting, replying elsewhere and changing the sort.

## Stretch

- **Optimistic votes:** call `saveVote()` (fails 30% of the time, responses
  may arrive out of order). Update the UI immediately. If the request fails,
  undo **only that vote** and show a brief error. Other changes made in the
  meantime must survive. Rapid repeated clicks must end in the state of the
  last click.
- **Deep-link:** a "Show parent" link on replies that scrolls to and briefly
  highlights the parent.
- **Load more:** show only 3 top-level comments plus a "Load more" button.

## What's being evaluated

- **Choosing a state shape.** Keep the flat list as state and derive the tree
  when rendering, or store the tree? Either can work. Be ready to say why, and
  how it affects each update (Part 3's clean-up and Part 4 especially).
- **Immutable updates** that copy only what changed.
- **Derived values aren't stored:** sorted order, reply counts and "is mine".
- **Stable keys** (ids, not indexes), so collapsed state and open forms stay
  on the right comment when the sort changes.
- **Edge cases:** deleted parents, deep nesting (7 levels in the `c1` thread), ties in
  score (`c3` and `c4`), negative scores.

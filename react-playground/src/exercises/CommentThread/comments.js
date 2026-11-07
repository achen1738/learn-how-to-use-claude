// Dummy data for the Comment Thread exercise.
//
// COMMENTS is a FLAT list, the way an API returns it. Replies point at their
// parent with `parentId` (null = top-level). The list is NOT in any useful
// order: replies can appear before their parents.
//
// Comment shape:
//   {
//     id: "c7",
//     parentId: "c1" | null,
//     author: "frank",
//     body: "About 8 months...",   null when deleted
//     createdAt: "2026-10-10T09:20:00Z",
//     score: 30,                    net votes, INCLUDING yours
//     myVote: 1 | 0 | -1,           your current vote on it
//     deleted: false,
//   }
//
// Everything here is deep-frozen. Any attempt to modify it in place
// (comment.score++, comments.push(...), comments.sort()) throws a TypeError,
// so every update has to build new objects and arrays.

export const CURRENT_USER = "you";

// Use this instead of Date.now() for "5 minutes ago" labels so the thread
// looks the same every time.
export const NOW = "2026-10-10T12:00:00Z";

export const POST = {
  title: "We rewrote our billing system in Rust. Here's what we learned",
  author: "frank",
};

const c = (id, parentId, author, body, createdAt, score, myVote = 0) => ({
  id,
  parentId,
  author,
  body,
  createdAt,
  score,
  myVote,
  deleted: false,
});

const deletedComment = (id, parentId, createdAt, score) => ({
  id,
  parentId,
  author: null,
  body: null,
  createdAt,
  score,
  myVote: 0,
  deleted: true,
});

const RAW = [
  c(
    "c11",
    "c10",
    "frank",
    "Thousands. Mostly rounding. It's all in the blog post.",
    "2026-10-10T11:00:00Z",
    5,
  ),
  c(
    "c2",
    null,
    "bob",
    "Rewrites are almost always a mistake. What made this one different?",
    "2026-10-10T09:05:00Z",
    57,
  ),
  c("c19", "c18", "dana", "Compile-time checked queries? Nice.", "2026-10-10T10:35:00Z", 2),
  c(
    "c7",
    "c1",
    "frank",
    "About 8 months, mostly spent running both systems side by side.",
    "2026-10-10T09:20:00Z",
    30,
  ),
  c("c22", "c6", "kim", "Please don't.", "2026-10-10T08:50:00Z", 15, 1),
  c("c4", null, "dana", "What did you use for the database layer?", "2026-10-10T10:15:00Z", 12),
  c(
    "c14",
    "c2",
    "frank",
    "Fair, but the old system couldn't handle multiple currencies at all.",
    "2026-10-10T09:25:00Z",
    25,
  ),
  deletedComment("c5", null, "2026-10-10T08:55:00Z", 3),
  c(
    "c9",
    "c8",
    "frank",
    "Yes. Every invoice was computed by both, and any mismatch paged us.",
    "2026-10-10T10:00:00Z",
    14,
  ),
  c(
    "c1",
    null,
    "alice",
    "Congrats on the launch! How long did the migration take?",
    "2026-10-10T09:00:00Z",
    42,
  ),
  c("c16", "c15", "ivan", "Sometimes the refactor IS the rewrite.", "2026-10-10T10:05:00Z", 7),
  c(
    "c12",
    "c11",
    "you",
    "Rounding bugs are the worst. Half-even or half-up?",
    "2026-10-10T11:20:00Z",
    2,
    1,
  ),
  c(
    "c3",
    null,
    "you",
    "We did something similar last year. Happy to share notes.",
    "2026-10-10T09:30:00Z",
    12,
  ),
  c(
    "c20",
    "c5",
    "judy",
    "Not sure why this was removed, it was a good point about testing.",
    "2026-10-10T09:10:00Z",
    6,
  ),
  c(
    "c8",
    "c7",
    "alice",
    "Parallel runs are underrated. Did you diff the outputs automatically?",
    "2026-10-10T09:40:00Z",
    9,
  ),
  c("c13", "c1", "hank", "Same question, and how big was the team?", "2026-10-10T09:50:00Z", 1),
  c("c6", null, "eve", "First!", "2026-10-10T08:45:00Z", -4),
  c("c18", "c4", "frank", "Postgres with sqlx.", "2026-10-10T10:20:00Z", 8),
  c("c15", "c14", "bob", "That's a refactor, not a rewrite.", "2026-10-10T09:45:00Z", 18, -1),
  c("c10", "c9", "grace", "How many mismatches did you see at first?", "2026-10-10T10:30:00Z", 3),
  c(
    "c21",
    "c5",
    "you",
    "Agreed, the testing point was the best part.",
    "2026-10-10T09:12:00Z",
    1,
    1,
  ),
  c("c26", "c25", "you", "Which language did you rewrite it from?", "2026-10-10T10:50:00Z", 1, 1),
  deletedComment("c24", "c2", "2026-10-10T10:10:00Z", 0),
  c(
    "c17",
    "c2",
    "you",
    "I think Joel Spolsky wants his blog post back 🙂",
    "2026-10-10T10:40:00Z",
    4,
  ),
  c("c23", "c3", "frank", "Would love that, can I DM you?", "2026-10-10T09:55:00Z", 3),
  deletedComment("c25", "c24", "2026-10-10T10:25:00Z", 2),
];

function deepFreeze(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.values(value).forEach(deepFreeze);
    Object.freeze(value);
  }
  return value;
}

export const COMMENTS = deepFreeze(RAW);

/**
 * Fake API for the optimistic-voting stretch goal. Resolves after 400–1200ms,
 * or rejects `failRate` of the time. Responses can arrive out of order.
 */
export function saveVote(commentId, vote, { failRate = 0.3 } = {}) {
  const delay = 400 + Math.random() * 800;
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < failRate) reject(new Error(`Couldn't save your vote on ${commentId}`));
      else resolve({ commentId, vote });
    }, delay);
  });
}

# Bug Squash practice

Three practice runs for a "debug an unfamiliar codebase" interview. Each
folder is a small, self-contained Node library with its own tests. Some tests
fail; **the tests are correct and the bugs are in `src/`**.

| # | Folder | Library | What it tests |
|---|---|---|---|
| 1 | `01-billing/` | Invoice and proration engine | Following a wrong *number* back through a calculation pipeline; grouping many failures by root cause |
| 2 | `02-webhooks/` | Webhook delivery with retries | *Async* control flow, fake timers, and symptoms that show up far from their cause |
| 3 | `03-search/` | Query language (lexer → parser → evaluator) | Finding which *layer* is wrong when the error is reported in another, plus a test that fails only when run with the others |

They get harder roughly in that order. Give each one **45 minutes**, out loud
as if someone were listening, before opening its `SOLUTIONS.md`.

## Setup

These need **Node 20+** (they use the built-in `node:test` runner and have no
dependencies, so no `npm install`).

```bash
node --version
```

If that prints `v12...`, your terminal is picking up the old Node in
`C:\Program Files\nodejs`. Use Git Bash (which finds your nvm Node 24), or
uninstall Node 12.

Then, inside an exercise folder:

```bash
npm test
```

## Debugging in VS Code

Open the **`react-playground`** folder in VS Code (not its parent), then use
**Run and Debug**:

- **Debug current test file:** open any `*.test.js` file, set a breakpoint
  (in the test or anywhere in `src/`), then press F5. The file runs directly,
  so breakpoints work without extra setup.
- **Debug all tests in this exercise:** runs the whole suite of the exercise
  that the open file belongs to.
- **Debug search CLI:** prompts for a query and runs `03-search/bin/search.js` on it.

## A strategy to practise

The interview grades *how* you debug, not only whether you finish. Narrate
each step.

1. **Orient (5 min).** Read the README. What does the library do? What are
   the main modules and how does data flow between them? Are there tools
   provided (a CLI, debug printers, fakes)?
2. **Run everything and triage.** Read *every* failure before fixing any.
   Group them: which ones probably share a cause? Which is the smallest
   reproduction?
3. **Form a hypothesis and say it.** For example: "JPY totals are exactly 100×
   too big and USD's are fine, so I think something treats JPY as having
   2 decimals."
4. **Test the hypothesis cheaply.** Use a breakpoint, a `console.log`, a REPL
   call or a single-test run. Confirm or refute it, then say which.
5. **Bisect the pipeline.** Find the first point where a value goes from right
   to wrong. Use Step Into to go down a layer and Step Out once you've ruled
   one out.
6. **Fix minimally, then rerun the whole suite.** Watch for new failures and
   for tests that only fail when run together.
7. **Explain the fix**, why it's correct, and what else could have the same
   bug.

Habits worth showing: reading docstrings and comments for intended
behaviour, checking which *related* tests pass (it narrows things a lot),
running one test in isolation, and not editing tests to make them pass.

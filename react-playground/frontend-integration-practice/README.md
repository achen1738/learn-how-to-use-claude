# Frontend Integration practice: Support Inbox

A mock "Frontend Integration" interview: an existing React + TypeScript codebase,
a spec, docs for the existing code, and a test suite you must not break.

## Setup

```bash
npm install
npm run dev        # app at http://localhost:5174
npm test           # existing unit tests (all pass at the start)
npm run typecheck
```

## How to practice

1. Set a **75-minute** timer.
2. Read **`SPEC.md`**, then `docs/API.md` and `docs/COMPONENTS.md`, then skim the code.
   Reading first is part of the exercise.
3. Build it. Talk out loud. Write tests as you go. Run `npm test` often.
4. When the timer ends, run `npm run test:acceptance` to see what you missed.
5. Read `_solution/SOLUTION.md` and compare. Reference code is in `_solution/src/`
   (it mirrors `src/`).

**No peeking:** don't open `acceptance/` or `_solution/` until you're done.

### Want a mock interviewer?
Ask Claude: *"Act as my interviewer for the Support Inbox exercise. Don't give me
answers. Ask me about my approach and trade-offs, and review my code at the end."*

## Project tour

```
src/
  api/          fake tickets API (read-only for you; see docs/API.md)
  auth/         useCurrentUser
  components/
    ui/         shared components: TextInput, Select, Pagination, Button, Badge, Feedback
    TicketTable.tsx
  hooks/        useTickets, useDebouncedValue, useUrlState
  constants.ts  labels, select options, type guards
  App.tsx       the page you'll be extending
  test/setup.ts runs before every test (resets DB, 0ms latency, clears URL)
acceptance/     spec-level tests (npm run test:acceptance)
_solution/      reference solution + walkthrough
```

## Resetting

To start over, restore `src/` from a copy you made before you began (e.g. copy the
folder first, or `git init && git add -A && git commit -m start` before starting).

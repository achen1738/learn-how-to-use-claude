# React Interview Playground

A minimal Vite + React app for practicing component-building interview exercises.

## Usage

```
npm install
npm run dev
```

Open the printed localhost URL. The sidebar lists every exercise; click one to render it.

## Adding a new exercise

1. Drop a new component file into `src/exercises/` (e.g. `Autocomplete.jsx`).
2. Register it in `src/App.jsx`'s `EXERCISES` array: import the component and add
   `{ id: "autocomplete", label: "Autocomplete", Component: Autocomplete }`.

## Exercises

- **Typeahead Search** (`src/exercises/TypeaheadSearch.jsx`) — debouncing, race
  conditions, cancellation, loading/error state, caching, and combobox
  accessibility.
- **Cipher Workbench** (`src/exercises/CipherWorkbench/`) — encode/decode forms
  practicing derived vs. stored state, two-way synced inputs, and immutable list
  updates. Full prompt in that folder's `README.md`.
- **Team Directory (Bug Bash)** (`src/exercises/TeamDirectory/`) — a sortable,
  paginated table with 9 planted bugs filed as symptom-only bug reports: stale
  closures, state mutation, index keys, prop-to-state copying, and missing effect
  cleanup. Answer key in that folder's `SOLUTIONS.md`.

## Styling Drills (HTML/CSS interview practice)

`src/exercises/Styling/` holds 12 exercises for interviews where HTML and
plain CSS are graded: a profile card, navbar, button variants, product grid,
holy grail layout, modal, sliding tabs, accordion, tooltip, toasts, Kanban
board and data table. Each folder has a `README.md` prompt, a starter
component, an empty `.css` file to write in, and a `SOLUTIONS.md` with the
approach and common mistakes. They're in the sidebar as "Styling 01–12".
Start with `src/exercises/Styling/README.md` for the rules and a CSS
checklist.

## Bug Squash (debugging interview practice)

`bug-squash/` holds three standalone Node libraries with failing tests, for
practising "find and fix the bug in an unfamiliar codebase" interviews. They
aren't part of the React app; see `bug-squash/README.md` for setup, the VS Code
debug configs and a debugging strategy.

- **01-billing**: invoices, currencies, tax and proration (tracing wrong numbers).
- **02-webhooks**: signed webhook delivery with retries (async bugs).
- **03-search**: a query language with lexer, parser and evaluator (finding the faulty layer; a test-order bug).

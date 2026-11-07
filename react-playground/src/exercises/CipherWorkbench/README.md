# Cipher Workbench

**Time:** ~60–75 min · function components + hooks only, no form/state libraries.

## The algorithm (implement in `cipher.js`)

Keyword shift (Vigenère) cipher:

- The **key** is a word of letters only (e.g. `lemon`). Each key letter is a shift: `a`=0 … `z`=25, case-insensitive.
- **Encode:** walk the text; shift each letter forward by the current key letter (wrapping `z`→`a`), then advance to the next key letter, cycling.
- **Decode:** shift backward instead.
- Letters keep their case.
- Non-letters pass through unchanged and **do not consume a key letter**.
- A key is valid only if it is non-empty and contains only letters.

| Text | Key | Encoded |
|---|---|---|
| `attack at dawn` | `lemon` | `lxfopv ef rnhr` |
| `Hello, World!` | `key` | `Rijvs, Uyvjn!` |

Check your implementation with:

```
node src/exercises/CipherWorkbench/cipher.check.js
```

## Part 1 — One-way form (`OneWayForm.jsx`)

- Input textarea, key field, Encode/Decode toggle, read-only output that updates as you type.
- Invalid key → inline error, output empty.
- **Constraint:** the output must not be stored in state.

## Part 2 — Two-way sync (`TwoWaySync.jsx`)

- Two editable textareas side by side: **Plaintext** and **Ciphertext**, sharing one key field.
- Typing in Plaintext updates Ciphertext (encoded); typing in Ciphertext updates Plaintext (decoded).
- Changing the key keeps the **most recently edited** side exactly as-is and recomputes the other.
- Invalid key → error shown; neither textarea loses what the user typed. Fixing the key makes everything catch up.

## Part 3 — History (`History.jsx`)

- **Save** stores a snapshot (key, plaintext, ciphertext) in a list below the form.
- Each entry has **Load** (restores it, including which side was last edited) and **Delete**.
- Save is disabled when the key is invalid or both sides are empty.
- Saving the same snapshot twice in a row does not create a duplicate.

## Part 4 — Stretch

- **Swap** button that exchanges the roles of the two textareas.
- **Copy** button per textarea showing "Copied!" for 2s; rapid repeated clicks must not leave it stuck or flickering.
- Persist history to `localStorage` across reloads.

## What's being evaluated

- Derived vs. stored state (the Part 2 trap is keeping both panes in state).
- Controlled inputs throughout.
- Immutable updates and stable `key`s for the history list.
- No `useEffect` that just syncs one piece of state into another.
- Cipher logic as pure, separately testable functions.
- Timer cleanup on repeat clicks and unmount (Part 4).

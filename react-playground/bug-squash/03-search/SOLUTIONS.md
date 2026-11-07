# customer-search: Answer Key

**Spoilers.** There are three bugs and four failing tests.

**What this exercise tests:** finding which layer of a pipeline is at fault
when the error surfaces in a different layer, and spotting a failure that
depends on test order.

| Failing test | Bug |
|---|---|
| `inclusive numeric bounds` | 1 (lexer) |
| `excluding canceled customers from a plan` | 2 (parser) |
| `limit keeps the first matches in their original order` | 3 (search) |
| `an empty query returns every customer` | 3 (search) |

## Bug 1: `>=` and `<=` are read as `>` and `<`

**Where:** `src/lexer.js`, the `OPERATORS` list.

`operatorAt()` returns the *first* operator in the list that matches. `">"`
comes before `">="`, so `amount>=149` lexes as `FIELD(amount) OP(>) WORD(=149)`.
`=` isn't a delimiter, so it ends up inside the value.

**The trap:** the error message, `Expected a number for amount, got "=149"`,
comes from `evaluate.js`. Candidates who start there end up "fixing" number
parsing to strip a leading `=`.

**Fix:** list the longer operators first, `[">=", "<=", "!=", ":", ">", "<"]`,
or sort by length so the longest match always wins.

**Narrowing it down:** the stray `=` in `"=149"` is the clue: where did it come
from? `node bin/search.js --tokens "amount>=149"` shows the bad token in one
command. That's the payoff for reading the README and finding the provided
tools first.

**Senior signal:** names "longest match first" (maximal munch) as the general
rule for tokenizers. Adds a lexer test for `>=`, `<=` and `!=`.

## Bug 2: NOT swallows everything after it

**Where:** `src/parser.js`, `parseUnary()`

`ast.not(this.parseAnd())` should be `ast.not(this.parseUnary())`, as the
grammar comment at the top of the file says
(`unary := ( NOT | "-" ) unary | primary`). As written,
`-status:canceled plan:pro` parses as `(not (and (status : "canceled") (plan : "pro")))`,
meaning "not a canceled pro customer". That matches 15 of the 16 customers.

**Why the parser tests pass:** every NOT test in `parser.test.js` negates the
*last* term in the query, where `parseAnd` happens to stop at the same place
`parseUnary` would.

**Narrowing it down:**
1. `node bin/search.js --ast "-status:canceled plan:pro"` shows the wrong
   tree immediately.
2. Compare it with the example in the `printAst` docstring in `ast.js`, which
   shows the expected tree for this exact query.
3. Notice that the second assertion in the failing test (`plan:pro -status:canceled`)
   passes. NOT works when it comes last, which tells you it's about how far
   NOT reaches.

**Senior signal:** reads the grammar comment and checks each `parse*` method
against its rule, rather than single-stepping through recursion. Adds a parser
test with NOT followed by another term.

## Bug 3: sorting with an empty query reorders the caller's array

**Where:** `src/search.js`, `search()`

For the empty-query fast path, `matched` *is* `records` (no `filter()` copy),
so `matched.sort(...)` sorts the shared `customers` fixture in place. The
docstring promises "`records` is never modified".

**Why it's tricky:** the test that causes it (`sorting everyone by signup
date`) **passes**. The two tests that run after it fail, but **both pass when
run alone**:

```bash
node --test --test-name-pattern="limit keeps"
```

**Fix:** sort a copy: `const sorted = sort ? [...matched].sort(...) : matched;`.
Or `matched.toSorted(...)` on Node 20+.

**Narrowing it down:**
- **"Passes alone, fails in the suite"** almost always means shared mutable
  state. State that hypothesis out loud.
- **The failing output shows the order of the bad results:** `cus_010, cus_016,
  cus_014`, the newest active customers. Recognising that as signup order
  points straight at the sort test.
- **Confirm it** by temporarily skipping the sort test (`test.skip`) and
  rerunning, or by logging `customers[0].id` at the start of the failing test.

**Senior signal:** fixes the library rather than the test (for example by
adding `structuredClone(customers)` in the test file). The tests are correct,
and any caller passing their own array would get it reordered too. Also notes
`Array.prototype.sort` mutates while `filter`/`map`/`slice` don't, which is
why only the fast path is affected.

## Suggested debugging flow

1. Run everything, then run each failing test on its own. Bug 3 reveals
   itself at this step.
2. Read the README; spot the `--tokens` and `--ast` tools.
3. For each remaining failure, use the tools to work out which stage
   (lexer, parser or evaluator) first produces something wrong, then read only
   that stage.

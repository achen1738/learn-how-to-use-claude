# customer-search

A small query language for filtering customer records, as used by a support
dashboard's search box:

```
status:active amount>=100 -country:US
(plan:pro OR plan:enterprise) delinquent:true
tag:vip created<2025-01-01
"Grace Hopper"
email:*@nasa.gov
```

- `field:value` matches (case-insensitive for text); `*` is a wildcard
- `>`, `<`, `>=`, `<=`, `!=` compare numbers and dates
- Terms side by side are ANDed; `OR`, `NOT` / `-` and parentheses work as you'd expect
- Bare words and quoted strings search names and emails

## Layout

A query goes through three stages:

```
"amount>=100 -plan:free"
   │  lexer.js      string → tokens
   ▼
FIELD(amount) OP(>=) WORD(100) NOT FIELD(plan) OP(:) WORD(free) EOF
   │  parser.js     tokens → AST (grammar is documented at the top of the file)
   ▼
(and (amount >= "100") (not (plan : "free")))
   │  evaluate.js   AST + schema → predicate(record)
   ▼
search.js           filter, sort, limit
```

| File | What it does |
|---|---|
| `src/lexer.js` | Tokenizer |
| `src/parser.js` | Recursive-descent parser |
| `src/ast.js` | Node constructors and `printAst()` |
| `src/schema.js` | Which fields exist, their types, paths and aliases |
| `src/evaluate.js` | Compiles an AST into a predicate; type checking happens here |
| `src/sort.js` | `"-amount,name"` sort specs |
| `src/search.js` | Public `search()` entry point |
| `fixtures/customers.js` | 16 sample customers used by the tests |
| `bin/search.js` | Command-line tool for trying queries |

## Trying queries by hand

```bash
node bin/search.js "plan:pro country:GB"
```

```bash
node bin/search.js --tokens "amount>100"
```

```bash
node bin/search.js --ast "a:1 OR b:2 c:3"
```

```bash
node bin/search.js --sort=-amount ""
```

## Running the tests

Requires Node 20 or later.

```bash
npm test
```

```bash
node --test test/search.test.js
```

```bash
node --test --test-name-pattern="limit"
```

## Your task

Some tests are failing. The tests and fixtures are correct; the bugs are in
`src/`. Find and fix them, explaining your reasoning as you go. There may be
more than one bug.

Don't open `SOLUTIONS.md` until you're done.

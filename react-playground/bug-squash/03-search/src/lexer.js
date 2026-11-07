import { QueryError } from "./errors.js";

// Turns a query string into tokens.
//
//   status:active amount>=100 -country:US "Grace Hopper"
//
// becomes
//
//   FIELD(status) OP(:) WORD(active)
//   FIELD(amount) OP(>=) WORD(100)
//   NOT FIELD(country) OP(:) WORD(US)
//   STRING(Grace Hopper)
//   EOF
//
// A word directly followed by an operator is a FIELD, and whatever follows the
// operator is always its value, so `state:OR` compares against "OR" rather
// than starting an OR expression. AND, OR and NOT are keywords only in
// uppercase. A "-" at the start of a term means NOT.

export const T = Object.freeze({
  WORD: "WORD",
  STRING: "STRING",
  FIELD: "FIELD",
  OP: "OP",
  LPAREN: "LPAREN",
  RPAREN: "RPAREN",
  AND: "AND",
  OR: "OR",
  NOT: "NOT",
  EOF: "EOF",
});

export const OPERATORS = [":", ">=", "<=", ">", "<", "!="];

const KEYWORDS = new Map([
  ["AND", T.AND],
  ["OR", T.OR],
  ["NOT", T.NOT],
]);

// Characters that end a bare word.
const DELIMITERS = new Set([" ", "\t", "\n", "\r", "(", ")", '"', ":", "<", ">", "!"]);

const isWordChar = (ch) => ch !== undefined && !DELIMITERS.has(ch);

class Lexer {
  constructor(input) {
    this.input = input;
    this.pos = 0;
    this.tokens = [];
  }

  peek(offset = 0) {
    return this.input[this.pos + offset];
  }

  push(type, value, start) {
    this.tokens.push({ type, value, pos: start });
  }

  skipWhitespace() {
    while (/\s/.test(this.peek() ?? "")) this.pos++;
  }

  operatorAt(pos) {
    return OPERATORS.find((op) => this.input.startsWith(op, pos)) ?? null;
  }

  readWord() {
    const start = this.pos;
    while (isWordChar(this.peek())) this.pos++;
    return this.input.slice(start, this.pos);
  }

  readString() {
    const start = this.pos;
    this.pos++; // opening quote
    let value = "";
    while (this.pos < this.input.length && this.peek() !== '"') {
      if (this.peek() === "\\" && this.pos + 1 < this.input.length) this.pos++;
      value += this.peek();
      this.pos++;
    }
    if (this.peek() !== '"') throw new QueryError("Unterminated quoted string", start);
    this.pos++; // closing quote
    return value;
  }

  readValue(field, fieldStart) {
    const start = this.pos;
    if (this.peek() === '"') {
      this.push(T.STRING, this.readString(), start);
      return;
    }
    const word = this.readWord();
    if (word === "") {
      throw new QueryError(
        `Expected a value after "${this.input.slice(fieldStart, start)}"`,
        start,
      );
    }
    this.push(T.WORD, word, start);
  }

  tokenize() {
    for (this.skipWhitespace(); this.pos < this.input.length; this.skipWhitespace()) {
      const start = this.pos;
      const ch = this.peek();

      if (ch === "(" || ch === ")") {
        this.pos++;
        this.push(ch === "(" ? T.LPAREN : T.RPAREN, ch, start);
        continue;
      }

      const next = this.peek(1);
      if (ch === "-" && next !== "-" && (isWordChar(next) || next === "(" || next === '"')) {
        this.pos++;
        this.push(T.NOT, "-", start);
        continue;
      }

      if (ch === '"') {
        this.push(T.STRING, this.readString(), start);
        continue;
      }

      const word = this.readWord();
      if (word === "") {
        throw new QueryError(`Unexpected character "${ch}"`, start);
      }

      let op = this.operatorAt(this.pos);
      if (op) {
        this.push(T.FIELD, word, start);
        this.push(T.OP, op, this.pos);
        this.pos += op.length;
        this.readValue(word, start);
        continue;
      }

      this.push(KEYWORDS.get(word) ?? T.WORD, word, start);
    }

    this.push(T.EOF, null, this.pos);
    return this.tokens;
  }
}

export function tokenize(input) {
  return new Lexer(String(input)).tokenize();
}

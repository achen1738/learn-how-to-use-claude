import * as ast from "./ast.js";
import { QueryError } from "./errors.js";
import { T, tokenize } from "./lexer.js";

// Recursive-descent parser. Grammar, from lowest to highest precedence:
//
//   query    := orExpr EOF | EOF
//   orExpr   := andExpr ( OR andExpr )*
//   andExpr  := unary ( AND? unary )*          two terms side by side mean AND
//   unary    := ( NOT | "-" ) unary | primary
//   primary  := "(" orExpr ")" | term
//   term     := FIELD OP ( WORD | STRING ) | WORD | STRING
//
// So `a b OR c` is (or (and a b) c), and `-a b` is (and (not a) b).

const STARTS_TERM = new Set([T.WORD, T.STRING, T.FIELD, T.LPAREN, T.NOT]);

class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.index = 0;
  }

  get current() {
    return this.tokens[this.index];
  }

  advance() {
    return this.tokens[this.index++];
  }

  match(type) {
    if (this.current.type !== type) return null;
    return this.advance();
  }

  expect(type, what) {
    const token = this.match(type);
    if (!token)
      throw new QueryError(
        `Expected ${what} but found ${describe(this.current)}`,
        this.current.pos,
      );
    return token;
  }

  parseQuery() {
    if (this.current.type === T.EOF) return ast.all();
    const node = this.parseOr();
    if (this.current.type !== T.EOF) {
      throw new QueryError(`Unexpected ${describe(this.current)}`, this.current.pos);
    }
    return node;
  }

  parseOr() {
    const children = [this.parseAnd()];
    while (this.match(T.OR)) children.push(this.parseAnd());
    return ast.or(children);
  }

  parseAnd() {
    const children = [this.parseUnary()];
    for (;;) {
      if (this.match(T.AND)) {
        children.push(this.parseUnary());
      } else if (STARTS_TERM.has(this.current.type)) {
        children.push(this.parseUnary());
      } else {
        break;
      }
    }
    return ast.and(children);
  }

  parseUnary() {
    if (this.match(T.NOT)) {
      return ast.not(this.parseUnary());
    }
    return this.parsePrimary();
  }

  parsePrimary() {
    const open = this.match(T.LPAREN);
    if (open) {
      if (this.current.type === T.RPAREN) throw new QueryError("Empty parentheses", open.pos);
      const node = this.parseOr();
      this.expect(T.RPAREN, '")"');
      return node;
    }
    return this.parseTerm();
  }

  parseTerm() {
    const field = this.match(T.FIELD);
    if (field) {
      const op = this.expect(T.OP, "an operator");
      const value = this.match(T.WORD) ?? this.expect(T.STRING, "a value");
      return ast.compare(field.value, op.value, value.value, field.pos);
    }
    const word = this.match(T.WORD) ?? this.match(T.STRING);
    if (word) return ast.text(word.value, word.pos);
    throw new QueryError(
      `Expected a search term but found ${describe(this.current)}`,
      this.current.pos,
    );
  }
}

function describe(token) {
  if (token.type === T.EOF) return "the end of the query";
  return `"${token.value}"`;
}

export function parse(query) {
  return new Parser(tokenize(query)).parseQuery();
}

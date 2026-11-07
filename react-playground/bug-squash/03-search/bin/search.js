#!/usr/bin/env node
// Try queries from the command line against the sample customers:
//
//   node bin/search.js 'plan:pro country:GB'
//   node bin/search.js --ast '-status:canceled plan:pro'
//   node bin/search.js --sort=-amount ''

import { customers } from "../fixtures/customers.js";
import { parse, printAst, QueryError, search, tokenize } from "../src/index.js";

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith("--") && !a.includes("=")));
const sort = args.find((a) => a.startsWith("--sort="))?.slice("--sort=".length);
const query = args.filter((a) => !a.startsWith("--")).join(" ");

try {
  if (flags.has("--tokens")) {
    for (const token of tokenize(query))
      console.log(`${String(token.pos).padStart(3)}  ${token.type.padEnd(6)} ${token.value ?? ""}`);
  } else if (flags.has("--ast")) {
    console.log(printAst(parse(query)));
  } else {
    const results = search(customers, query, { sort });
    for (const c of results) {
      console.log(
        `${c.id}  ${c.name.padEnd(20)} ${c.status.padEnd(9)} ${c.subscription.plan.padEnd(10)} ${String(c.subscription.amount).padStart(5)}  ${c.address.country}`,
      );
    }
    console.log(`${results.length} result(s)`);
  }
} catch (error) {
  if (!(error instanceof QueryError)) throw error;
  console.error(query);
  if (error.position != null) console.error(`${" ".repeat(error.position)}^`);
  console.error(error.message);
  process.exitCode = 1;
}

// Quick sanity checks for cipher.js. Run with:
//   node src/exercises/CipherWorkbench/cipher.check.js
import { isValidKey, encode, decode } from "./cipher.js";

const cases = [
  { plain: "attack at dawn", key: "lemon", cipher: "lxfopv ef rnhr" },
  { plain: "Hello, World!", key: "key", cipher: "Rijvs, Uyvjn!" },
  { plain: "Hello, World!", key: "KEY", cipher: "Rijvs, Uyvjn!" },
  { plain: "zzz", key: "b", cipher: "aaa" },
  { plain: "123 !?", key: "abc", cipher: "123 !?" },
  { plain: "", key: "abc", cipher: "" },
];

const keyCases = [
  { key: "lemon", valid: true },
  { key: "LeMoN", valid: true },
  { key: "", valid: false },
  { key: "abc1", valid: false },
  { key: "two words", valid: false },
];

let failures = 0;
const check = (label, actual, expected) => {
  if (actual !== expected) {
    failures++;
    console.log(`FAIL ${label}\n  expected: ${JSON.stringify(expected)}\n  actual:   ${JSON.stringify(actual)}`);
  }
};

for (const { plain, key, cipher } of cases) {
  check(`encode(${JSON.stringify(plain)}, ${JSON.stringify(key)})`, encode(plain, key), cipher);
  check(`decode(${JSON.stringify(cipher)}, ${JSON.stringify(key)})`, decode(cipher, key), plain);
}
for (const { key, valid } of keyCases) {
  check(`isValidKey(${JSON.stringify(key)})`, isValidKey(key), valid);
}

const total = cases.length * 2 + keyCases.length;
console.log(failures === 0 ? `All ${total} checks passed.` : `${failures}/${total} checks failed.`);
process.exitCode = failures === 0 ? 0 : 1;

import { useState } from "react";
import { isValidKey, encode, decode } from "./cipher";
import { History } from "./History";

// Part 2: two editable panes (Plaintext / Ciphertext) sharing one key.
// - Typing in either pane recomputes the other.
// - Changing the key keeps the most recently edited pane as-is and recomputes the other.
// - Invalid key -> error shown, neither pane loses what the user typed.
//
// Part 3: Save button + <History /> list (load / delete, no consecutive duplicates,
// disabled when the key is invalid or both panes are empty).
//
// Part 4 (stretch): Swap button, Copy buttons with a 2s "Copied!" label,
// history persisted to localStorage.
export const TwoWaySync = () => {
  const [form, setForm] = useState({ text: "", source: "plain", key: "" });

  const [savedCiphers, setSavedCiphers] = useState([]);
  const { text, source, key } = form;
  const other = source === "plain" ? encode(text, key) : decode(text, key);
  const plainText = source === "plain" ? text : other;
  const cipherText = source === "cipher" ? text : other;

  const handleKeyChange = (e) => {
    setForm((f) => ({ ...f, key: e.target.value }));
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    setSavedCiphers((prev) => [...prev, { plainText, cipherText, cipherKey: key }]);
    setForm({ text: "", source: "plain", key: "" });
  };

  const handleDelete = (indexToRemove) => {
    setSavedCiphers((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleLoad = (cipher) => {
    setEncodedText(cipher.encodedText);
    setKey(cipher.cipherKey);
    setPlainText(cipher.plainText);
  };

  return (
    <section>
      <h3>Part 2-4: Two-way</h3>
      <form onSubmit={handleSubmit}>
        <textarea
          onFocus={() => setPlainTextLastFocued(true)}
          name="plainText"
          value={plainText}
          onChange={(e) => setForm((f) => ({ ...f, text: e.target.value, source: "plain" }))}
        />
        <textarea
          onFocus={() => setPlainTextLastFocued(false)}
          name="cipherText"
          onChange={(e) => setForm((f) => ({ ...f, text: e.target.value, source: "cipher" }))}
          value={cipherText}
        />

        <input type="text" name="cipher" onChange={handleKeyChange} value={key} />

        <button type="submit">Save</button>
      </form>
      <section>
        <h4>History</h4>
        {savedCiphers.map((cipher, index) => {
          return (
            <History
              key={index}
              {...cipher}
              onDelete={() => handleDelete(index)}
              onLoad={() => handleLoad(cipher)}
            />
          );
        })}
      </section>
    </section>
  );
};

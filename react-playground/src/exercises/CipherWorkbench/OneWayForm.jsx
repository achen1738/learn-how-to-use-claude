import { useState } from "react";
import { isValidKey, encode, decode } from "./cipher";

// Part 1: one-way form.
// - Text input, key input, Encode/Decode toggle, read-only live output.
// - Invalid key -> inline error, empty output.
// - Constraint: the output must NOT be stored in state.
export const OneWayForm = () => {
  const [encodedString, setEncodedString] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e?.preventDefault();
    const actionType = e.nativeEvent.submitter?.name;
    const formData = new FormData(e.currentTarget);
    const formValues = Object.fromEntries(formData.entries());
    const { plainText, cipherText, cipher } = formValues;

    if (!isValidKey(cipher)) {
      setError("invalid key, letters only");
      return;
    }

    if (actionType === "encode") {
      setEncodedString(`encoded: ${encode(plainText, cipher)}`);
    } else {
      setEncodedString(`decoded: ${decode(cipherText, cipher)}`);
    }
    setError("");
  };

  return (
    <section>
      <h3>Part 1: One-way</h3>
      <form onSubmit={handleSubmit}>
        <input type="textarea" name="plainText" />
        <input type="textarea" name="cipherText" />

        <input type="text" name="cipher" />
        <button type="submit" name="encode">
          Encode
        </button>
        <button type="submit" name="decode">
          Decode
        </button>
      </form>
      {encodedString}
      {error && <div>{error}</div>}
    </section>
  );
};

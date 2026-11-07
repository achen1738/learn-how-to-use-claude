import { useState } from "react";

const encode = (text, key) => {
  return applyCipher(text, key, shiftForwards);
};

const decode = (text, key) => {
  return applyCipher(text, key, shiftBackwards);
};

const applyCipher = (text, key, cipherAlgo) => {
  const lowercase = key.toLowerCase();
  let keyPosition = 0;
  let keyLength = key.length;
  let encodedString = "";
  for (let char of text) {
    let code = char.charCodeAt(0); // num

    if ((code >= 65 && code <= 90) || (code >= 97 && code <= 122)) {
      keyPosition = keyPosition % keyLength;
      const shiftAmount = lowercase.charAt(keyPosition).charCodeAt(0) - "a".charCodeAt(0);
      const shifted = cipherAlgo(code, shiftAmount);
      let [min, max] = code <= 90 ? [65, 90] : [97, 122];
      const newCode = moduloWrapRange(shifted, min, max);
      const newEncodedChar = String.fromCharCode(newCode);
      encodedString += newEncodedChar;
      keyPosition++;
    } else {
      encodedString += char;
    }
  }

  return encodedString;
};

const moduloWrapRange = (num, min, max) => {
  const range = max - min + 1;
  return ((((num - min) % range) + range) % range) + min;
};

const shiftForwards = (num, shiftAmount) => {
  return num + shiftAmount;
};

const shiftBackwards = (num, shiftAmount) => {
  return num - shiftAmount;
};

const isValidKey = (key) => {
  return key.match(/^[A-Za-z]+$/);
};

export const TwoWayRedo = () => {
  const [form, setForm] = useState({ text: "", cipherKey: "", cipher: "encode" });
  const [error, setError] = useState("");

  const handlePlainTextChange = (e) => {
    setForm((prev) => ({ ...prev, text: e.target.value, cipher: "encode" }));
  };
  const handleCipherTextChange = (e) => {
    setForm((prev) => ({ ...prev, text: e.target.value, cipher: "decode" }));
  };
  const handleCipherKeyChange = (e) => {
    if (e.target.value && !isValidKey(e.target.value)) {
      setError("Invalid key");
    } else if (e.target.value && isValidKey(e.target.value)) {
      setError("");
    }

    setForm((prev) => ({ ...prev, cipherKey: e.target.value }));
  };

  const otherText =
    form.cipher === "encode"
      ? encode(form.text, form.cipherKey)
      : decode(form.text, form.cipherKey);
  const plainText = form.cipher === "encode" ? form.text : otherText;
  const cipherText = form.cipher === "decode" ? form.text : otherText;
  return (
    <div>
      <textarea name="plainText" value={plainText} onChange={handlePlainTextChange} />
      <textarea name="cipherText" value={cipherText} onChange={handleCipherTextChange} />
      <input type="text" name="cipherKey" onChange={handleCipherKeyChange} value={form.cipherKey} />
      {error && <div>{`Error: ${error}`}</div>}
    </div>
  );
};

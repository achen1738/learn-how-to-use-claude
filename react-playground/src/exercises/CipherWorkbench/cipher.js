// Pure cipher functions. No React in this file.
//
// Keyword shift (Vigenère) cipher:
// - Each key letter is a shift: a=0, b=1, ... z=25 (key is case-insensitive).
// - Encode shifts letters forward, decode shifts them backward, wrapping z -> a.
// - Letters keep their case.
// - Non-letters pass through unchanged and do NOT consume a key letter.
// - A key is valid only if it is non-empty and contains only letters.

export const isValidKey = (key) => {
  return key && /^[a-zA-Z]+$/.test(key);
};

export const encode = (text, key) => {
  return applyCipher(text, key, wrapForwards, shiftForwards);
};

export const decode = (text, key) => {
  return applyCipher(text, key, wrapBackwards, shiftBackwards);
};

const applyCipher = (text, key, cipherAlgo, cipherShift) => {
  const lowercase = key.toLowerCase();
  let encodedString = "";
  let position = 0;

  for (let char of text) {
    let code = char.charCodeAt(0);

    if ((code >= 65 && code <= 90) || (code >= 97 && code <= 122)) {
      position = position % key.length;
      const shiftAmount = lowercase.charAt(position).charCodeAt(0) - "a".charCodeAt(0);

      let [lower, higher] = code <= 90 ? [65, 90] : [97, 122];

      let encodedCharCode = cipherAlgo(cipherShift(code, shiftAmount), lower, higher);
      const encodedChar = String.fromCharCode(encodedCharCode);
      encodedString += encodedChar;
      position++;
    } else {
      encodedString += char;
    }
  }

  return encodedString;
};

const shiftForwards = (num, shift) => {
  return num + shift;
};

const shiftBackwards = (num, shift) => {
  return num - shift;
};

function wrapBackwards(num, min, max) {
  const range = max - min + 1;
  // Normalize, apply true modulo, and shift back
  return min + ((((num - min) % range) + range) % range);
}

function wrapForwards(num, min, max) {
  const range = max - min + 1;
  return min + ((((num - min) % range) + range) % range);
}

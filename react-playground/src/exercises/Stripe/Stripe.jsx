import { Helper } from "./Helper";
import { useState } from "react";

const passportFormats = {
  USA: "LDDDDDDDD",
  Canada: "LLDDDDDD",
  Ireland: "AADDDDDDD",
  Japan: "LLDDDDDDD",
};

const isAlphanumeric = (char) => /^[a-zA-Z0-9]$/.test(char);
const isLetterOnly = (char) => /^[a-zA-Z]$/.test(char);
const isNumberOnly = (char) => /^[0-9]$/.test(char);

export const Stripe = () => {
  const [error, setError] = useState("");
  const [validPassport, setValidPassport] = useState("");
  const handleSubmit = (e) => {
    e.preventDefault();
    // 2. Capture all form data
    const formData = new FormData(e.currentTarget);

    // 3. Convert it into a clean, readable JavaScript object
    const formValues = Object.fromEntries(formData.entries());

    const { countries, passport } = formValues;
    const format = passportFormats[countries];

    if (passport.length !== format.length) {
      setError("Invalid passport number");
      return;
    }

    for (let i = 0; i < passport.length; i++) {
      const passportChar = passport.charAt(i);
      const formatChar = format.charAt(i);
      if (formatChar === "L") {
        if (!isLetterOnly(passportChar)) {
          setError("Invalid passport number");
          return;
        }
      } else if (formatChar === "D") {
        if (!isNumberOnly(passportChar)) {
          setError("Invalid passport number");
          return;
        }
      } else if (formatChar === "A") {
        if (!isAlphanumeric(passportChar)) {
          setError("Invalid passport number");
          return;
        }
      }
    }

    setError("");
    setValidPassport(passport);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>
          Country
          <select name="countries">
            {Object.keys(passportFormats).map((countryName) => (
              <option key={countryName} value={countryName}>
                {countryName}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div>
        <label>
          Passport number
          <input
            type="text"
            name="passport"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "passport-number-error" : undefined}
          />
        </label>
        {error && (
          <div>
            <span id="passport-number-error" style={{ color: "red" }}>
              {error}
            </span>
          </div>
        )}
      </div>
      <button type="submit">Validate</button>
      {!error && validPassport}
    </form>
  );
};

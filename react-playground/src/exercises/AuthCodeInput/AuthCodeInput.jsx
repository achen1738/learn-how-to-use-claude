import { useState, useEffect } from "react";
import { Cell } from "./Cell";

export const AuthCodeInput = () => {
  const [lastAlphanumericKey, setLastAlphanumericKey] = useState(["", "", "", "", "", ""]);
  const [focusedIndex, setFocusedIndex] = useState(0);

  const handleKeyDown = (event) => {
    const isAlphanumeric = /^[a-zA-Z0-9]$/.test(event.key);
    if (isAlphanumeric && focusedIndex < 6) {
      setLastAlphanumericKey((prev) =>
        prev.map((letter, i) => (i === focusedIndex ? event.key : letter)),
      );

      setFocusedIndex((prev) => {
        if (prev < 5) {
          return prev + 1;
        }
        return prev;
      });
    } else if (event.key === "Backspace") {
      setLastAlphanumericKey((prev) => prev.map((letter, i) => (i === focusedIndex ? "" : letter)));
      setFocusedIndex((prev) => {
        if (prev > 0) {
          return prev - 1;
        }
        return prev;
      });
    }
  };

  return (
    <div
      style={{
        display: "flex",
        gap: "8px",
      }}
    >
      {[0, 1, 2, 3, 4, 5].map((index) => (
        <Cell
          key={index}
          focusIndex={index}
          setFocusedIndex={setFocusedIndex}
          isFocused={focusedIndex === index}
          letter={lastAlphanumericKey[index]}
          handleKeyDown={handleKeyDown}
        />
      ))}
    </div>
  );
};

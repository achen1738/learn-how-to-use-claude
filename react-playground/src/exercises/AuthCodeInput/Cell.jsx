import { useRef, useEffect } from "react";

export const Cell = ({ letter, isFocused, setFocusedIndex, focusIndex, handleKeyDown }) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (isFocused) {
      inputRef.current?.focus();
    }
  }, [isFocused]);

  const handleClick = () => {
    setFocusedIndex(focusIndex);
  };

  return (
    <input
      ref={inputRef}
      onClick={handleClick}
      style={{
        padding: "16px",
        border: "1px solid grey",
        borderRadius: "4px",
        boxSizing: "border-box",
      }}
      value={letter}
      onKeyDown={handleKeyDown}
    />
  );
};

import { useEffect, useState } from "react";

const ANSWER = "SPEND";
const WORD_LENGTH = 5;
const MAX_GUESSES = 6;

const KEYBOARD_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACKSPACE"],
];

// Two-pass evaluation so duplicate letters are scored the way real Wordle
// does: exact-position matches are claimed first, then remaining letters
// are matched against whatever's left of the answer's letter pool.
function evaluateGuess(guess) {
  const result = new Array(WORD_LENGTH).fill("absent");
  const answerLetters = ANSWER.split("");
  const pool = {};

  answerLetters.forEach((letter, i) => {
    if (guess[i] === letter) {
      result[i] = "correct";
    } else {
      pool[letter] = (pool[letter] || 0) + 1;
    }
  });

  guess.split("").forEach((letter, i) => {
    if (result[i] === "correct") return;
    if (pool[letter] > 0) {
      result[i] = "present";
      pool[letter] -= 1;
    }
  });

  return result;
}

function bestStatus(a, b) {
  const rank = { absent: 0, present: 1, correct: 2 };
  if (!a) return b;
  return rank[b] > rank[a] ? b : a;
}

export default function Wordle() {
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [message, setMessage] = useState("");
  const [gameOver, setGameOver] = useState(false);

  const won = guesses.some((g) => g === ANSWER);

  const submitGuess = () => {
    if (gameOver) return;
    if (currentGuess.length !== WORD_LENGTH) {
      setMessage(`Word must be ${WORD_LENGTH} letters`);
      return;
    }
    const nextGuesses = [...guesses, currentGuess];
    setGuesses(nextGuesses);
    setCurrentGuess("");
    setMessage("");

    if (currentGuess === ANSWER) {
      setMessage("You win!");
      setGameOver(true);
    } else if (nextGuesses.length >= MAX_GUESSES) {
      setMessage(`Out of guesses — the word was ${ANSWER}`);
      setGameOver(true);
    }
  };

  const pressKey = (key) => {
    if (gameOver) return;
    if (key === "ENTER") {
      submitGuess();
    } else if (key === "BACKSPACE") {
      setCurrentGuess((prev) => prev.slice(0, -1));
    } else if (/^[A-Z]$/.test(key) && currentGuess.length < WORD_LENGTH) {
      setCurrentGuess((prev) => prev + key);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "Enter") {
        pressKey("ENTER");
      } else if (e.key === "Backspace") {
        pressKey("BACKSPACE");
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        pressKey(e.key.toUpperCase());
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const keyStatuses = {};
  guesses.forEach((guess) => {
    evaluateGuess(guess).forEach((status, i) => {
      const letter = guess[i];
      keyStatuses[letter] = bestStatus(keyStatuses[letter], status);
    });
  });

  const rows = [];
  for (let i = 0; i < MAX_GUESSES; i++) {
    if (i < guesses.length) {
      rows.push({ letters: guesses[i].split(""), statuses: evaluateGuess(guesses[i]) });
    } else if (i === guesses.length && !gameOver) {
      const letters = currentGuess.padEnd(WORD_LENGTH, " ").split("");
      rows.push({ letters, statuses: null });
    } else {
      rows.push({ letters: new Array(WORD_LENGTH).fill(" "), statuses: null });
    }
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Wordle</h2>

      <div style={styles.board}>
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} style={styles.row}>
            {row.letters.map((letter, colIndex) => (
              <div
                key={colIndex}
                style={{
                  ...styles.cell,
                  ...(row.statuses ? styles.cellStatus[row.statuses[colIndex]] : {}),
                }}
              >
                {letter.trim()}
              </div>
            ))}
          </div>
        ))}
      </div>

      <p style={styles.message} aria-live="polite">
        {message || " "}
      </p>

      <div style={styles.keyboard}>
        {KEYBOARD_ROWS.map((row, i) => (
          <div key={i} style={styles.keyboardRow}>
            {row.map((key) => (
              <button
                key={key}
                onClick={() => pressKey(key)}
                style={{
                  ...styles.key,
                  ...(key === "ENTER" || key === "BACKSPACE" ? styles.keyWide : {}),
                  ...(keyStatuses[key] ? styles.cellStatus[keyStatuses[key]] : {}),
                }}
              >
                {key === "BACKSPACE" ? "⌫" : key}
              </button>
            ))}
          </div>
        ))}
      </div>

      {gameOver && (
        <button style={styles.newGameButton} onClick={() => window.location.reload()}>
          Play again
        </button>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 420,
    margin: "40px auto",
    fontFamily: "system-ui, sans-serif",
    textAlign: "center",
  },
  heading: {
    fontSize: 16,
    marginBottom: 16,
  },
  board: {
    display: "inline-flex",
    flexDirection: "column",
    gap: 6,
    marginBottom: 12,
  },
  row: {
    display: "flex",
    gap: 6,
  },
  cell: {
    width: 48,
    height: 48,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 22,
    fontWeight: 700,
    border: "2px solid #d3d6da",
    borderRadius: 4,
    textTransform: "uppercase",
    color: "#111",
  },
  cellStatus: {
    correct: { background: "#6aaa64", borderColor: "#6aaa64", color: "#fff" },
    present: { background: "#c9b458", borderColor: "#c9b458", color: "#fff" },
    absent: { background: "#787c7e", borderColor: "#787c7e", color: "#fff" },
  },
  message: {
    minHeight: 20,
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 12,
  },
  keyboard: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    alignItems: "center",
  },
  keyboardRow: {
    display: "flex",
    gap: 4,
  },
  key: {
    minWidth: 32,
    height: 42,
    padding: "0 8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#d3d6da",
    border: "none",
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
    color: "#111",
  },
  keyWide: {
    minWidth: 50,
    fontSize: 10,
  },
  newGameButton: {
    marginTop: 16,
    padding: "8px 16px",
    fontSize: 13,
    fontWeight: 600,
    border: "none",
    borderRadius: 4,
    background: "#111",
    color: "#fff",
    cursor: "pointer",
  },
};

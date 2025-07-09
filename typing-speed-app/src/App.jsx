import { useState, useEffect } from "react";

const SENTENCES = [
  "The quick brown fox jumps over the lazy dog.",
  "React makes it painless to create interactive UIs with reusable components.",
  "The journey of a thousand miles begins with a single step, typed one word at a time.",
  "Typing tests are a great way to improve your speed and accuracy with consistent practice.",
  "In a world driven by technology, the ability to code is becoming an essential skill.",
  "Software development is not just about code, but about solving real-world problems efficiently.",
  "Every bug you encounter is an opportunity to learn something new and become a better developer.",
  "The key to mastering any skill is repetition, reflection, and real-world application.",
  "When debugging, the problem is almost always between the chair and the keyboard.",
  "A clean UI and responsive design are core to providing a seamless user experience.",
];

function App() {
  const [textToType, setTextToType] = useState("");
  const [userInput, setUserInput] = useState("");
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [countdown, setCountdown] = useState(null);
  const [canType, setCanType] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const [username, setUsername] = useState("");
  const [isNameSet, setIsNameSet] = useState(false);
  const [highScores, setHighScores] = useState([]);

  // Load sentence + high scores
  useEffect(() => {
    restart();
    const savedScores = JSON.parse(localStorage.getItem("typing-highscores")) || [];
    setHighScores(savedScores);
  }, []);

  // Countdown effect
  useEffect(() => {
    if (countdown === null) return;

    if (countdown === 0) {
      setCanType(true);
      setCountdown(null);
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  function handleInputChange(e) {
    if (!canType || endTime !== null) return;

    const value = e.target.value;

    if (startTime === null) {
      setStartTime(new Date().getTime());
    }

    setUserInput(value);
    updateLiveStats(value);

    if (value === textToType) {
      setEndTime(new Date().getTime());
      calculateResults(value);
    }
  }

  function updateLiveStats(input) {
    const now = new Date().getTime();
    const timeTaken = (now - startTime) / 60000;
    if (timeTaken === 0) return;

    const wordsTyped = input.trim().split(" ").length;
    const wpmResult = Math.round(wordsTyped / timeTaken);
    setWpm(wpmResult);

    const correctChars = input.split("").filter((char, i) => char === textToType[i]).length;
    const acc = Math.round((correctChars / textToType.length) * 100);
    setAccuracy(acc);
  }

  function calculateResults(input) {
    const timeTaken = (new Date().getTime() - startTime) / 60000;
    const wordsTyped = input.trim().split(" ").length;
    const wpmResult = Math.round(wordsTyped / timeTaken);
    setWpm(wpmResult);

    const correctChars = input.split("").filter((char, i) => char === textToType[i]).length;
    const acc = Math.round((correctChars / textToType.length) * 100);
    setAccuracy(acc);

    // Save to high scores
    const newScore = {
      name: username,
      wpm: wpmResult,
      accuracy: acc,
      date: new Date().toLocaleString(),
    };

    const updatedScores = [...highScores, newScore]
      .sort((a, b) => b.wpm - a.wpm)
      .slice(0, 5);

    setHighScores(updatedScores);
    localStorage.setItem("typing-highscores", JSON.stringify(updatedScores));
  }

  function restart() {
    const randomIndex = Math.floor(Math.random() * SENTENCES.length);
    setTextToType(SENTENCES[randomIndex]);
    setUserInput("");
    setStartTime(null);
    setEndTime(null);
    setWpm(0);
    setAccuracy(0);
    setCountdown(3);
    setCanType(false);
  }

  function renderColoredText() {
    return (
      <span>
        {textToType.split("").map((char, i) => {
          let color = "";
          if (i < userInput.length) {
            color = char === userInput[i] ? "green" : "red";
          }
          return (
            <span key={i} style={{ color }}>
              {char}
            </span>
          );
        })}
      </span>
    );
  }

  return (
    <div
      style={{
        backgroundColor: darkMode ? "#121212" : "#f0f4f8",
        color: darkMode ? "#f5f5f5" : "#333",
        minHeight: "100vh",
        padding: "2rem",
        transition: "background 0.3s, color 0.3s",
      }}
    >
      {/* Dark mode toggle */}
      <div style={{ position: "absolute", top: 20, right: 20 }}>
        <button
          onClick={() => setDarkMode((prev) => !prev)}
          style={{
            background: darkMode ? "#f5f5f5" : "#333",
            color: darkMode ? "#333" : "#fff",
            padding: "8px 16px",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>

      {/* Ask for username before starting */}
      {!isNameSet && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0, 0, 0, 0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 10,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "2rem",
              borderRadius: "10px",
              textAlign: "center",
              width: "90%",
              maxWidth: "400px",
              color: "#000",
            }}
          >
            <h2>Welcome to the Typing Test!</h2>
            <p>Please enter your name to begin:</p>
            <input
              type="text"
              placeholder="Your Name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                padding: "10px",
                fontSize: "16px",
                marginTop: "1rem",
                width: "80%",
              }}
            />
            <br />
            <button
              onClick={() => {
                if (username.trim() !== "") {
                  setIsNameSet(true);
                  setCountdown(3);
                }
              }}
              style={{
                marginTop: "1rem",
                padding: "10px 20px",
                backgroundColor: "#007bff",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Start
            </button>
          </div>
        </div>
      )}

      <div
        style={{
          maxWidth: "700px",
          margin: "auto",
          backgroundColor: darkMode ? "#1e1e1e" : "#fff",
          padding: "2rem",
          borderRadius: "12px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
          textAlign: "center",
        }}
      >
        <h1>Typing Speed Test</h1>

        <p>
          <strong>Type this:</strong>
        </p>
        <div
          style={{
            border: "1px solid #ccc",
            padding: "1rem",
            borderRadius: "8px",
            backgroundColor: darkMode ? "#222" : "#f1f1f1",
            color: darkMode ? "#fff" : "#000",
            marginBottom: "1rem",
            fontFamily: "monospace",
            whiteSpace: "pre-wrap",
            textAlign: "left",
          }}
        >
          {renderColoredText()}
        </div>

        {countdown !== null ? (
          <div
            style={{
              fontSize: "2.5rem",
              fontWeight: "bold",
              color: "#007bff",
              marginBottom: "1rem",
              transition: "transform 0.3s ease-in-out",
              transform: `scale(${countdown === 0 ? 1.2 : 1})`,
            }}
          >
            {countdown === 0 ? "Go!" : countdown}
          </div>
        ) : (
          <textarea
            rows="5"
            placeholder="Start typing here..."
            value={userInput}
            onChange={handleInputChange}
            disabled={endTime !== null}
            style={{
              width: "100%",
              maxWidth: "600px",
              padding: "12px",
              fontSize: "16px",
              fontFamily: "monospace",
              border: `2px solid ${darkMode ? "#888" : "#90caf9"}`,
              borderRadius: "8px",
              resize: "none",
              backgroundColor: darkMode ? "#222" : "#fff",
              color: darkMode ? "#fff" : "#000",
            }}
          />
        )}

        <div style={{ marginTop: "2rem" }}>
          <p>WPM: {wpm}</p>
          <p>Accuracy: {accuracy}%</p>
          {endTime && (
            <>
              <p>
                Time Taken: {((endTime - startTime) / 1000).toFixed(2)} sec
              </p>
              <button
                onClick={restart}
                style={{
                  marginTop: "1rem",
                  padding: "10px 20px",
                  fontSize: "16px",
                  backgroundColor: "#42a5f5",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Restart
              </button>
            </>
          )}
        </div>

        {/* Leaderboard */}
        {highScores.length > 0 && (
          <div style={{ marginTop: "2rem", textAlign: "left" }}>
            <h2>🏆 Top 5 High Scores</h2>
            <ol style={{ paddingLeft: "1.5rem" }}>
              {highScores.map((score, index) => (
                <li key={index}>
                  <strong>{score.name}</strong> - {score.wpm} WPM, {score.accuracy}% ({score.date})
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

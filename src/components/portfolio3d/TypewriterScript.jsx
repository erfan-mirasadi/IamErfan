import { useEffect, useState, useRef } from "react";

const BASE_TYPING_SPEED = 15; // سرعت پایه تایپ (میلی‌ثانیه)
const TYPING_SPEED_VARIANCE = 40; // نوسان سرعت تایپ (±میلی‌ثانیه)

const BASE_ERASE_SPEED = 60; // سرعت پایه پاک کردن (میلی‌ثانیه)
const ERASE_SPEED_VARIANCE = 25; // نوسان سرعت پاک کردن (±میلی‌ثانیه)

function randomSpeed(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getTypingSpeed(char) {
  if (
    char === " " ||
    char === "," ||
    char === "." ||
    char === ";" ||
    char === ":"
  ) {
    return randomSpeed(
      BASE_TYPING_SPEED + 50,
      BASE_TYPING_SPEED + 50 + TYPING_SPEED_VARIANCE
    );
  }
  return randomSpeed(
    BASE_TYPING_SPEED - TYPING_SPEED_VARIANCE / 2,
    BASE_TYPING_SPEED + TYPING_SPEED_VARIANCE / 2
  );
}

function getEraseSpeed() {
  return randomSpeed(
    BASE_ERASE_SPEED - ERASE_SPEED_VARIANCE / 2,
    BASE_ERASE_SPEED + ERASE_SPEED_VARIANCE / 2
  );
}

export default function TypewriterScript({ script, className = "" }) {
  const [lines, setLines] = useState([]);
  const [currentLine, setCurrentLine] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const currentLineRef = useRef("");
  const timeoutRef = useRef(null);

  useEffect(() => {
    currentLineRef.current = currentLine;
  }, [currentLine]);

  useEffect(() => {
    if (!Array.isArray(script)) return;

    let part = 0;
    setLines([]);
    setCurrentLine("");
    clearTimeout(timeoutRef.current);

    function appendChar(char, cb) {
      setCurrentLine((prev) => (prev ?? "") + (char ?? ""));
      timeoutRef.current = setTimeout(cb, getTypingSpeed(char));
    }

    function flushLine(cb) {
      setLines((prev) => [...prev, currentLineRef.current ?? ""]);
      setCurrentLine("");
      timeoutRef.current = setTimeout(cb, 300);
    }

    function eraseChar(cb) {
      setCurrentLine((prev) => (prev ? prev.slice(0, -1) : ""));
      timeoutRef.current = setTimeout(cb, getEraseSpeed());
    }

    function typeNormal(text, cb) {
      if (typeof text !== "string") text = "";
      let idx = 0;

      function next() {
        if (idx >= text.length) {
          flushLine(() => {
            timeoutRef.current = setTimeout(cb, randomSpeed(300, 600));
          });
          return;
        }
        appendChar(text[idx], () => {
          idx++;
          next();
        });
      }
      next();
    }

    function typeError(wrong, correct, cb) {
      if (typeof wrong !== "string") wrong = "";
      if (typeof correct !== "string") correct = "";

      let idx = 0;

      function typeWrong() {
        if (idx >= wrong.length) {
          timeoutRef.current = setTimeout(eraseWrong, randomSpeed(500, 800));
          return;
        }
        appendChar(wrong[idx], () => {
          idx++;
          typeWrong();
        });
      }

      function eraseWrong() {
        if (!currentLineRef.current || currentLineRef.current.length === 0) {
          timeoutRef.current = setTimeout(typeCorrect, randomSpeed(300, 500));
          return;
        }
        eraseChar(() => {
          eraseWrong();
        });
      }

      let idx2 = 0;
      function typeCorrect() {
        if (idx2 >= correct.length) {
          flushLine(() => {
            timeoutRef.current = setTimeout(cb, randomSpeed(300, 600));
          });
          return;
        }
        appendChar(correct[idx2], () => {
          idx2++;
          typeCorrect();
        });
      }

      typeWrong();
    }

    function runScript() {
      if (part >= script.length) {
        setShowCursor(true);
        return;
      }
      const item = script[part];
      if (!item) {
        part++;
        runScript();
        return;
      }
      if (item.type === "normal") {
        typeNormal(item.text, () => {
          part++;
          runScript();
        });
      } else if (item.type === "error") {
        typeError(item.wrong, item.correct, () => {
          part++;
          runScript();
        });
      } else {
        part++;
        runScript();
      }
    }

    runScript();

    return () => clearTimeout(timeoutRef.current);
  }, [script]);

  useEffect(() => {
    const interval = setInterval(() => setShowCursor((v) => !v), 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={className}
      style={{
        whiteSpace: "pre-wrap",
        fontFamily: "",
        userSelect: "none",
      }}
    >
      {lines.map((line, i) => (
        <div key={i}>{line}</div>
      ))}
      <div>
        {currentLine}
        <span className="animate-pulse">{showCursor ? "█" : " "}</span>
      </div>
    </div>
  );
}

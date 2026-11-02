"use client";

import { useEffect, useState } from "react";

// One-time tip about the glowing markers. It shows up where the old green hint used
// to open (2s after reaching these steps), closes itself after 10s or on click,
// and never comes back on this browser.
const SHOW_AT_STEPS = ["Key", "Workshop"];
const SHOW_DELAY = 2000; // ms after arriving at the step
const VISIBLE_SECONDS = 10;
const SEEN_KEY = "iamerfan:glow-tip-seen";

const LINES = ["> see something glowing?", "> yep. click it."];

let seenThisVisit = false; // backup when storage is blocked (private mode etc.)

function alreadySeen() {
  if (seenThisVisit) return true;
  try {
    return window.localStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

function markSeen() {
  seenThisVisit = true;
  try {
    window.localStorage.setItem(SEEN_KEY, "1");
  } catch {
    // nothing to do, seenThisVisit still keeps it to once
  }
}

// mini version of the glowing markers in the scene
function MarkerGlyph() {
  return (
    <svg className="glow-tip-marker" viewBox="0 0 48 48" aria-hidden>
      <circle className="glow-tip-ring-outer" cx="24" cy="24" r="19" />
      <circle className="glow-tip-ring-inner" cx="24" cy="24" r="11" />
      <circle className="glow-tip-core" cx="24" cy="24" r="3" />
    </svg>
  );
}

export default function Hint({ activeStep = "intro" }) {
  // hidden -> open -> closing -> gone
  const [phase, setPhase] = useState("hidden");

  // wait a moment on a step with glowing markers, then show it once
  useEffect(() => {
    if (phase !== "hidden" || !SHOW_AT_STEPS.includes(activeStep)) return;
    const timer = setTimeout(() => {
      if (alreadySeen()) return;
      // a terminal is already open: try again on the next step
      if (document.body.classList.contains("modal-open")) return;
      markSeen();
      setPhase("open");
    }, SHOW_DELAY);
    return () => clearTimeout(timer);
  }, [activeStep, phase]);

  // close after 10s, with Escape, or when a marker was clicked (terminal opened)
  useEffect(() => {
    if (phase !== "open") return;
    const close = () => setPhase("closing");
    const timer = setTimeout(close, VISIBLE_SECONDS * 1000);
    const onKeyDown = (e) => {
      if (e.key === "Escape") close();
    };
    const observer = new MutationObserver(() => {
      if (document.body.classList.contains("modal-open")) close();
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    window.addEventListener("keydown", onKeyDown);
    return () => {
      clearTimeout(timer);
      observer.disconnect();
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [phase]);

  // let the CRT switch-off animation play, then unmount
  useEffect(() => {
    if (phase !== "closing") return;
    const timer = setTimeout(() => setPhase("gone"), 420);
    return () => clearTimeout(timer);
  }, [phase]);

  if (phase === "hidden" || phase === "gone") return null;

  return (
    <div className="glow-tip-anchor">
      <div
        className={`glow-tip ${phase === "closing" ? "is-closing" : ""}`}
        role="status"
        aria-live="polite"
        data-cursor="link"
        onClick={() => setPhase("closing")}
      >
        <div className="glow-tip-titlebar">
          <span className="glow-tip-led" aria-hidden />
          <span>hint.exe</span>
          <button type="button" className="glow-tip-close" aria-label="Close hint">
            ×
          </button>
        </div>

        <div className="glow-tip-body">
          <MarkerGlyph />
          <div className="glow-tip-text">
            <p className="glow-tip-line" style={{ "--chars": LINES[0].length }}>
              {LINES[0]}
            </p>
            <p
              className="glow-tip-line glow-tip-line-2"
              style={{ "--chars": LINES[1].length + 1 }}
            >
              {LINES[1]}
              <span className="loader-caret">_</span>
            </p>
          </div>
        </div>

        {/* one block per second, like the loading bar, draining until it closes */}
        <div className="glow-tip-timer" aria-hidden>
          <div className="glow-tip-blocks">
            {Array.from({ length: VISIBLE_SECONDS }, (_, i) => (
              <span key={i} style={{ animationDelay: `${VISIBLE_SECONDS - i - 0.5}s` }} />
            ))}
          </div>
          <span className="glow-tip-note">click to close</span>
        </div>
      </div>
    </div>
  );
}

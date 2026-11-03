"use client";

import { useEffect, useSyncExternalStore } from "react";
import { getMode, getServerMode, subscribe, toggleMode } from "../daylight/daylight";

// The visitor's local clock, as "HH:MM" (refreshed a few times a minute)
let clockText = null;
let clockTimer = 0;
const clockListeners = new Set();
const formatClock = () => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
};
const getClock = () => (clockText ??= formatClock());
const getServerClock = () => "--:--";
function subscribeClock(listener) {
  clockListeners.add(listener);
  if (!clockTimer) {
    clockTimer = window.setInterval(() => {
      const next = formatClock();
      if (next === clockText) return;
      clockText = next;
      clockListeners.forEach((l) => l());
    }, 5000);
  }
  return () => {
    clockListeners.delete(listener);
    if (clockListeners.size === 0) {
      window.clearInterval(clockTimer);
      clockTimer = 0;
    }
  };
}

function SunIcon() {
  return (
    <svg className="daynight-icon is-sun" viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="4.2" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
        <rect key={angle} x="11" y="1.5" width="2" height="4" rx="1" transform={`rotate(${angle} 12 12)`} />
      ))}
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg className="daynight-icon is-moon" viewBox="0 0 24 24" aria-hidden>
      <path d="M15.5 3.2a8.8 8.8 0 1 0 5.3 15.2A7.3 7.3 0 0 1 15.5 3.2z" />
      <circle className="daynight-star" cx="5.2" cy="5.4" r="1" />
      <circle className="daynight-star" cx="8.6" cy="2.6" r="0.7" />
    </svg>
  );
}

// Day / night switch. Starts on the visitor's own time (night from 19:00 to 06:00)
// and flips the 3D scene right away, without reloading anything.
export default function DayNightToggle() {
  const mode = useSyncExternalStore(subscribe, getMode, getServerMode);
  const clock = useSyncExternalStore(subscribeClock, getClock, getServerClock);
  const night = mode === "night";

  // lets the CSS overlays follow the mode too
  useEffect(() => {
    document.documentElement.dataset.daylight = mode;
  }, [mode]);

  return (
    <div className="daynight" data-mode={mode}>
      <button
        type="button"
        role="switch"
        aria-checked={night}
        aria-label={night ? "Switch to day" : "Switch to night"}
        className="daynight-switch"
        onClick={toggleMode}
      >
        <span className="daynight-thumb" aria-hidden />
        <SunIcon />
        <MoonIcon />
      </button>
      <span className="daynight-label" aria-hidden>
        <span className="daynight-mode">{night ? "night" : "day"}</span>
        <span className="daynight-clock">{clock}</span>
      </span>
    </div>
  );
}

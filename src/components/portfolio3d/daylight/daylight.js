// Day / night mode.
// It follows the visitor's own clock (their time zone) until they flip the switch.
// The 3D scene never re-renders React for it: components read `daylight.night`
// (0 = day .. 1 = night, eased by DayNightController) in their frame loops and only
// change uniforms (light colors, intensities, opacities), so no shader recompiles.

const NIGHT_FROM = 19; // local hour the house switches to night
const NIGHT_UNTIL = 6; // local hour the morning comes back

export const daylight = { night: 0 };

const listeners = new Set();
let manual = null; // "day" | "night" after the visitor picked one (this visit only)
let clockMode = null;
let timer = 0;

const fromClock = () => {
  const hour = new Date().getHours(); // local time of the visitor
  return hour >= NIGHT_FROM || hour < NIGHT_UNTIL ? "night" : "day";
};

const emit = () => listeners.forEach((listener) => listener());

export function getMode() {
  if (manual) return manual;
  if (clockMode === null) clockMode = fromClock();
  return clockMode;
}

// static export: the HTML is always rendered as day, the client corrects it right away
export const getServerMode = () => "day";

export function toggleMode() {
  manual = getMode() === "night" ? "day" : "night";
  emit();
}

export function subscribe(listener) {
  listeners.add(listener);
  if (!timer) {
    // the clock can cross 19:00 / 06:00 while the page is open
    timer = window.setInterval(() => {
      const next = fromClock();
      if (next === clockMode) return;
      clockMode = next;
      if (!manual) emit();
    }, 60 * 1000);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      window.clearInterval(timer);
      timer = 0;
    }
  };
}

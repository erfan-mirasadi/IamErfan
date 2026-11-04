import { Color } from "three";

// What every light / effect becomes at night. The day values are never written here:
// they are read from the scene itself the first time, so day stays exactly the
// original look. Everything below is a uniform, so blending costs nothing.
export const NIGHT = {
  // the sun becomes the moon: cooler and softer, same direction (static shadow map)
  sun: ["#9db2ff", 1.5],
  // light at the round window: warm glow spilling out of the house
  window: ["#ffb26a", 3.5],
  fill: ["#555a80", 2.1],
  // small lamp inside the garden plants: only warmer, about as bright as by day
  lamp: ["#ffd08c", 0.3],
  // the sun shaft through the window turns into a moon beam
  shaft: ["#86a2ff", 0.05],
  sunGlow: 0, // the sun sphere's emissive intensity
  bloom: 0.16, // a touch more than by day (0.1): screens and lamps glow, nothing blows out
  vignette: 0.97,
  background: 0.12, // the sunset sky, covered by the night sky dome anyway
  environment: 0.32, // reflections and ambient light from the sky
};

export const mix = (a, b, t) => a + (b - a) * t;

const nightColors = new Map();
const nightColor = (hex) => {
  if (!nightColors.has(hex)) nightColors.set(hex, new Color(hex));
  return nightColors.get(hex);
};

// remember an object's day color + amount, then blend it toward [nightHex, nightAmount]
export function captureDay(color, amount) {
  return { color: color.clone(), amount };
}

export function blendInto(target, day, [hex, amount], t) {
  target.copy(day.color).lerp(nightColor(hex), t);
  return mix(day.amount, amount, t);
}

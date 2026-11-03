import { daylight, getMode } from "./daylight";
import { EMISSIVE_MATERIALS, NIGHT, mix } from "./lighting";
import { createNightSky } from "./createNightSky";

const SMOOTHING = 0.35; // seconds: the switch starts at once and settles in about a second

// Drives `daylight.night` toward the current mode and applies the parts of the night
// look that belong to the whole scene: sky dome, sky light, glowing screens.
// (The house lights and post effects are blended in HouseScene, where they live.)
export function createDaylightRig(house) {
  const sky = createNightSky();

  const emissive = [];
  const seen = new Set();
  house.traverse((object) => {
    const material = object.material;
    if (!object.isMesh || !material || seen.has(material)) return;
    seen.add(material);
    if (EMISSIVE_MATERIALS.test(material.name)) emissive.push([material, material.emissiveIntensity]);
  });

  // open the page straight in the right mode, no fade on load
  daylight.night = getMode() === "night" ? 1 : 0;
  let applied = -1;
  let expectedBackground = 1;

  return {
    object: sky.object,
    update(state, delta) {
      const target = getMode() === "night" ? 1 : 0;
      const k = 1 - Math.exp(-Math.min(delta, 0.1) / SMOOTHING);
      let night = daylight.night + (target - daylight.night) * k;
      if (Math.abs(night - target) < 0.002) night = target;
      daylight.night = night;

      sky.update(state.camera, state.gl, state.clock.elapsedTime, night);

      const { scene } = state;
      // also re-apply if something else (e.g. <Environment>) reset the scene values
      if (night === applied && scene.backgroundIntensity === expectedBackground) return;
      applied = night;
      expectedBackground = mix(1, NIGHT.background, night);
      scene.backgroundIntensity = expectedBackground;
      scene.environmentIntensity = mix(1, NIGHT.environment, night);
      for (const [material, base] of emissive) {
        material.emissiveIntensity = base * mix(1, NIGHT.emissiveBoost, night);
      }
    },
    dispose() {
      sky.dispose();
    },
  };
}

// Static URLs of the heavy 3D assets.
// No three.js imports here, so Server Components (app/page.js) can import it too.

export const MODEL_URL = "/models/main-draco.glb";
export const DRACO_DECODER_PATH = "/draco/";
// Self-hosted copy of drei's "sunset" preset (was fetched from raw.githack.com at runtime)
export const ENV_MAP_URL = "/hdri/venice_sunset_1k.hdr";
// leaf cards of the hanging vines on the house front (scene/outdoor/createHangingVines.js)
export const VINE_LEAVES_URL = "/textures/vine-leaves.webp";

// <link rel="preload"> hints: the browser starts downloading these together with the
// HTML instead of waiting for the JS bundle to boot. three's FileLoader uses fetch()
// (cors + same-origin credentials), so they must be `as="fetch"` + crossOrigin="anonymous"
// or the browser would download everything twice.
export const SCENE_PRELOADS = [
  MODEL_URL,
  ENV_MAP_URL,
  `${DRACO_DECODER_PATH}draco_wasm_wrapper.js`,
  `${DRACO_DECODER_PATH}draco_decoder.wasm`,
].map((href) => ({ href, as: "fetch", crossOrigin: "anonymous" }));
// three's TextureLoader reads this one through an <img crossorigin="anonymous">
SCENE_PRELOADS.push({ href: VINE_LEAVES_URL, as: "image", crossOrigin: "anonymous" });

// Files whose download progress drives the real part of the loading bar
export const TRACKED_ASSETS = {
  model: MODEL_URL,
  env: ENV_MAP_URL,
};

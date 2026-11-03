import { EquirectangularReflectionMapping } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { HDRLoader } from "three/examples/jsm/loaders/HDRLoader.js";
import { MODEL_URL, DRACO_DECODER_PATH, ENV_MAP_URL } from "./sceneAssets";
import { mergeStaticMeshes } from "./mergeStaticMeshes";
import { KEEP_SEPARATE } from "../scene/model/houseNodes";

// ---------------------------------------------------------------------------
// Raw loading facts. A plain mutable object on purpose: the Loader reads it once
// per animation frame, so hundreds of download events never re-render React.
// ---------------------------------------------------------------------------
export const loadingProgress = {
  assets: {
    model: { loaded: 0, total: 0, parsed: false },
    env: { loaded: 0, total: 0, parsed: false },
  },
  warmup: 0, // 0..1 shaders compiled + textures uploaded to the GPU
  ready: false, // first frames are on screen (behind the loader)
};

const trackDownload = (key) => (event) => {
  const asset = loadingProgress.assets[key];
  asset.loaded = event.loaded;
  if (event.lengthComputable && event.total) asset.total = event.total;
};

const markParsed = (key) => {
  loadingProgress.assets[key].parsed = true;
};

// React's use() reads status/value straight from the promise, so once it is
// resolved every component gets the result synchronously (no extra suspend).
function trackPromise(promise) {
  promise.status = "pending";
  promise.then(
    (value) => {
      promise.status = "fulfilled";
      promise.value = value;
    },
    (reason) => {
      promise.status = "rejected";
      promise.reason = reason;
    }
  );
  return promise;
}

let dracoLoader = null;
let modelPromise = null;
let envPromise = null;

// The house GLB (Draco geometry + WebP/JPEG textures), loaded once and cached
export function loadHouseModel() {
  if (!modelPromise) {
    dracoLoader = new DRACOLoader().setDecoderPath(DRACO_DECODER_PATH);
    // fetch + compile the decoder while the GLB is still downloading (used to wait for it)
    dracoLoader.preload();
    const loader = new GLTFLoader().setDRACOLoader(dracoLoader);
    modelPromise = trackPromise(
      loader.loadAsync(MODEL_URL, trackDownload("model")).then((gltf) => {
        // ~540 meshes -> one per material (draw calls are the main cost per frame)
        mergeStaticMeshes(gltf.scene, KEEP_SEPARATE);
        // the parser keeps every original mesh referenced, let those go
        gltf.parser?.cache?.removeAll();
        gltf.parser?.associations?.clear();
        markParsed("model");
        return gltf;
      })
    );
  }
  return modelPromise;
}

// The sunset HDR used for lighting + background, loaded once and cached.
// It never rejects: without it the house still renders with the direct lights.
export function loadEnvironmentMap() {
  if (!envPromise) {
    envPromise = trackPromise(
      new HDRLoader().loadAsync(ENV_MAP_URL, trackDownload("env")).then(
        (texture) => {
          texture.mapping = EquirectangularReflectionMapping;
          markParsed("env");
          return texture;
        },
        (error) => {
          console.warn("[Loader] environment map failed, continuing without it", error);
          markParsed("env");
          return null;
        }
      )
    );
  }
  return envPromise;
}

// Start every download as soon as the JS runs (the <link rel="preload"> tags
// already started them with the HTML, these fetches just pick them up).
export function preloadSceneAssets() {
  if (typeof window === "undefined") return;
  loadHouseModel();
  loadEnvironmentMap();
}

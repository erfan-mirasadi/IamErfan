#!/usr/bin/env node
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, copyFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(process.cwd());
const modelsDir = resolve(root, "public/models");
const input = resolve(modelsDir, "main.glb");
const outDraco = resolve(modelsDir, "main-draco.glb");
const outDracoQ = resolve(modelsDir, "main-draco-q.glb");
const dracoPublic = resolve(root, "public/draco");
const dracoSrc = resolve(
  root,
  "node_modules/three/examples/jsm/libs/draco/gltf"
);

function run(cmd) {
  console.log(`$ ${cmd}`);
  execSync(cmd, { stdio: "inherit" });
}

if (!existsSync(input)) {
  console.error(`❌ Not found: ${input}`);
  process.exit(1);
}

// Ensure decoder files available
if (!existsSync(dracoPublic)) mkdirSync(dracoPublic, { recursive: true });
[
  "draco_decoder.js",
  "draco_decoder.wasm",
  "draco_encoder.js",
  "draco_wasm_wrapper.js",
].forEach((f) => {
  const src = resolve(dracoSrc, f);
  if (existsSync(src)) copyFileSync(src, resolve(dracoPublic, f));
});

// Basic Draco (-d) binary GLB
run(`npx -y gltf-pipeline -i "${input}" -o "${outDraco}" -d -b`);

// High quality quantized Draco with weld
run(
  `npx -y gltf-pipeline -i "${input}" -o "${outDracoQ}" -d -b ` +
    `--draco.compressionLevel 10 ` +
    `--draco.quantizePositionsBits 14 ` +
    `--draco.quantizeNormalsBits 8 ` +
    `--draco.quantizeTextureCoordinatesBits 12 ` +
    `--draco.quantizeColorsBits 8 ` +
    `--weld`
);

// Re-encode the heavy PNG textures (WebP / JPEG) so the GLB downloads ~3x faster.
// Geometry stays untouched, see scripts/compress-textures.mjs for details.
const compressScript = resolve(root, "scripts/compress-textures.mjs");
run(`node "${compressScript}" "${outDraco}"`);
run(`node "${compressScript}" "${outDracoQ}"`);

console.log("\n✅ Draco builds ready:");
console.log(" -", outDraco);
console.log(" -", outDracoQ);

// # Usage (Draco build script)
// # 1) Replace base model:
// #    public/models/main.glb
// #
// # 2) Run the build:
// #    yarn model:draco
// #
// # 3) Outputs:
// #    public/models/main-draco.glb
// #    public/models/main-draco-q.glb  (higher quality quantization + weld)
// #
// # 4) App default:
// #    Loads main-draco.glb by default.
// #    To use the “-q” variant, edit:
// #    src/components/portfolio3d/scene/model/HouseModel.jsx
// #    and change the path to /models/main-draco-q.glb
// #
// # Notes:
// # - Draco decoders are served from /public/draco automatically.
// # - Textures are re-encoded to WebP/JPEG after the Draco step
// #   (yarn model:textures runs only that step on main-draco.glb).
// # - Re-run this script whenever you update main.glb.

#!/usr/bin/env node
/**
 * Re-encodes the heavy PNG textures embedded in a GLB so the model downloads much faster.
 *
 * - Geometry (Draco buffers) is copied byte-for-byte, only image buffers are replaced.
 * - Every PNG gets a few candidate encodings and the smallest one that still keeps
 *   the channels its material actually reads above MIN_PSNR (dB) wins:
 *     - lossy WebP (EXT_texture_webp, alpha kept lossless when it's needed)
 *     - JPEG 4:4:4 (no chroma subsampling, safe for packed metallic/roughness maps)
 *     - near-lossless WebP (fallback for textures lossy formats would damage)
 * - JPEG textures are left untouched (re-encoding them only adds generation loss).
 *
 * Usage:
 *   node scripts/compress-textures.mjs <input.glb> [output.glb]
 *   (output defaults to overwriting the input)
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const MIN_PSNR = 40; // dB, minimum quality for every channel the material samples

const [inputArg, outputArg] = process.argv.slice(2);
if (!inputArg) {
  console.error("Usage: node scripts/compress-textures.mjs <input.glb> [output.glb]");
  process.exit(1);
}
const input = resolve(inputArg);
const output = resolve(outputArg || inputArg);

let sharp;
try {
  ({ default: sharp } = await import("sharp"));
} catch {
  console.error("❌ `sharp` is required (it ships with Next.js). Install it with: yarn add -D sharp");
  process.exit(1);
}

// ---------- GLB parsing ----------
const GLB_MAGIC = 0x46546c67; // "glTF"
const CHUNK_JSON = 0x4e4f534a;
const CHUNK_BIN = 0x004e4942;

const glb = readFileSync(input);
if (glb.readUInt32LE(0) !== GLB_MAGIC || glb.readUInt32LE(4) !== 2) {
  console.error("❌ Not a glTF 2.0 binary file:", input);
  process.exit(1);
}
let offset = 12;
let json = null;
let bin = null;
while (offset < glb.length) {
  const length = glb.readUInt32LE(offset);
  const type = glb.readUInt32LE(offset + 4);
  const data = glb.subarray(offset + 8, offset + 8 + length);
  if (type === CHUNK_JSON) json = JSON.parse(data.toString("utf8"));
  else if (type === CHUNK_BIN) bin = data;
  offset += 8 + length;
}
if (!json || !bin) {
  console.error("❌ GLB is missing its JSON or BIN chunk");
  process.exit(1);
}

const viewBytes = (index) => {
  const view = json.bufferViews[index];
  const start = view.byteOffset || 0;
  return bin.subarray(start, start + view.byteLength);
};

// ---------- which channels does each image feed? ----------
const imageUsage = new Map(); // imageIndex -> { channels:Set<0..3>, needsAlpha:boolean, slots:Set }
const textureSource = (textureIndex) => {
  const texture = json.textures[textureIndex];
  return texture.source ?? texture.extensions?.EXT_texture_webp?.source;
};
const use = (info, channels, slot, needsAlpha = false) => {
  if (!info) return;
  const image = textureSource(info.index);
  if (image === undefined) return;
  const entry = imageUsage.get(image) || { channels: new Set(), needsAlpha: false, slots: new Set() };
  channels.forEach((c) => entry.channels.add(c));
  entry.needsAlpha ||= needsAlpha;
  entry.slots.add(slot);
  imageUsage.set(image, entry);
};
const RGB = [0, 1, 2];
for (const material of json.materials || []) {
  const pbr = material.pbrMetallicRoughness || {};
  const blended = (material.alphaMode || "OPAQUE") !== "OPAQUE";
  use(pbr.baseColorTexture, blended ? [0, 1, 2, 3] : RGB, "baseColor", blended);
  use(pbr.metallicRoughnessTexture, [1, 2], "metallicRoughness");
  use(material.normalTexture, RGB, "normal");
  use(material.emissiveTexture, RGB, "emissive");
  use(material.occlusionTexture, [0], "occlusion");
  const ext = material.extensions || {};
  use(ext.KHR_materials_transmission?.transmissionTexture, [0], "transmission");
  use(ext.KHR_materials_specular?.specularTexture, [3], "specular", true);
  use(ext.KHR_materials_specular?.specularColorTexture, RGB, "specularColor");
  // any other extension texture: keep every channel to stay on the safe side
  for (const [name, def] of Object.entries(ext)) {
    if (name === "KHR_materials_transmission" || name === "KHR_materials_specular") continue;
    for (const [key, value] of Object.entries(def || {})) {
      if (value && typeof value === "object" && "index" in value) use(value, [0, 1, 2, 3], `${name}.${key}`, true);
    }
  }
}

// ---------- quality helpers ----------
const decodeRGBA = async (bytes) =>
  (await sharp(bytes).ensureAlpha().raw().toBuffer({ resolveWithObject: true })).data;

function minPsnr(reference, candidate, channels, maskByAlpha) {
  let worst = Infinity;
  for (const channel of channels) {
    let squaredError = 0;
    let count = 0;
    for (let i = 0; i < reference.length; i += 4) {
      if (maskByAlpha && channel !== 3 && reference[i + 3] === 0) continue; // invisible pixel
      const diff = reference[i + channel] - candidate[i + channel];
      squaredError += diff * diff;
      count++;
    }
    const mse = count ? squaredError / count : 0;
    const psnr = mse === 0 ? Infinity : 10 * Math.log10((255 * 255) / mse);
    worst = Math.min(worst, psnr);
  }
  return worst;
}

async function compressImage(bytes, usage) {
  const meta = await sharp(bytes).metadata();
  const keepAlpha = Boolean(meta.hasAlpha && usage.needsAlpha);
  const channels = [...usage.channels].filter((c) => c < 3 || keepAlpha);
  const reference = await decodeRGBA(bytes);
  const base = () => (keepAlpha ? sharp(bytes) : sharp(bytes).removeAlpha());

  const candidates = [
    {
      label: "webp",
      mimeType: "image/webp",
      encode: () => base().webp({ quality: 90, alphaQuality: 100, smartSubsample: true, effort: 6, exact: keepAlpha }),
    },
    ...(keepAlpha
      ? []
      : [
          {
            label: "jpeg-444",
            mimeType: "image/jpeg",
            encode: () => base().jpeg({ quality: 92, chromaSubsampling: "4:4:4", mozjpeg: true }),
          },
        ]),
    {
      label: "webp-near-lossless",
      mimeType: "image/webp",
      encode: () => base().webp({ nearLossless: true, quality: 60, effort: 6, exact: keepAlpha }),
    },
  ];

  let best = null;
  for (const candidate of candidates) {
    const data = await candidate.encode().toBuffer();
    if (data.length >= bytes.length || (best && data.length >= best.data.length)) continue;
    const decoded = await decodeRGBA(data);
    // without alpha the decoded copy is opaque, so only compare colour channels
    const psnr = minPsnr(reference, decoded, channels, keepAlpha);
    if (psnr >= MIN_PSNR) best = { ...candidate, data, psnr };
  }
  return best;
}

// ---------- compress ----------
const replacements = new Map(); // bufferViewIndex -> Buffer
const webpImages = new Set();
let before = 0;
let after = 0;

for (const [index, image] of json.images.entries()) {
  if (image.bufferView === undefined) continue;
  const bytes = viewBytes(image.bufferView);
  before += bytes.length;
  const usage = imageUsage.get(index);
  if (image.mimeType !== "image/png" || !usage) {
    after += bytes.length;
    continue;
  }
  const result = await compressImage(bytes, usage);
  if (!result) {
    after += bytes.length;
    console.log(`  #${index} ${image.name || ""}: kept original PNG`);
    continue;
  }
  replacements.set(image.bufferView, result.data);
  image.mimeType = result.mimeType;
  if (result.mimeType === "image/webp") webpImages.add(index);
  after += result.data.length;
  console.log(
    `  #${index} ${image.name || ""} [${[...usage.slots].join(", ")}]: ` +
      `${(bytes.length / 1024).toFixed(0)}KB -> ${(result.data.length / 1024).toFixed(0)}KB ` +
      `(${result.label}, ${result.psnr === Infinity ? "lossless" : result.psnr.toFixed(1) + "dB"})`
  );
}

// WebP images must be referenced through EXT_texture_webp
if (webpImages.size) {
  for (const texture of json.textures) {
    if (texture.source !== undefined && webpImages.has(texture.source)) {
      texture.extensions = { ...texture.extensions, EXT_texture_webp: { source: texture.source } };
      delete texture.source;
    }
  }
  json.extensionsUsed = [...new Set([...(json.extensionsUsed || []), "EXT_texture_webp"])];
  json.extensionsRequired = [...new Set([...(json.extensionsRequired || []), "EXT_texture_webp"])];
}

// ---------- rebuild BIN chunk (4-byte aligned views) ----------
const align4 = (n) => (n + 3) & ~3;
const parts = [];
let cursor = 0;
for (const [index, view] of json.bufferViews.entries()) {
  const data = replacements.get(index) || viewBytes(index);
  const padded = align4(cursor);
  if (padded > cursor) parts.push(Buffer.alloc(padded - cursor));
  view.byteOffset = padded;
  view.byteLength = data.length;
  parts.push(data);
  cursor = padded + data.length;
}
const binChunk = Buffer.concat([...parts, Buffer.alloc(align4(cursor) - cursor)]);
json.buffers[0].byteLength = cursor;

// ---------- write GLB ----------
let jsonText = JSON.stringify(json);
jsonText += " ".repeat(align4(Buffer.byteLength(jsonText)) - Buffer.byteLength(jsonText));
const jsonChunk = Buffer.from(jsonText, "utf8");
const header = Buffer.alloc(12);
const chunkHeader = (length, type) => {
  const b = Buffer.alloc(8);
  b.writeUInt32LE(length, 0);
  b.writeUInt32LE(type, 4);
  return b;
};
const total = 12 + 8 + jsonChunk.length + 8 + binChunk.length;
header.writeUInt32LE(GLB_MAGIC, 0);
header.writeUInt32LE(2, 4);
header.writeUInt32LE(total, 8);
writeFileSync(
  output,
  Buffer.concat([header, chunkHeader(jsonChunk.length, CHUNK_JSON), jsonChunk, chunkHeader(binChunk.length, CHUNK_BIN), binChunk])
);

const mb = (n) => (n / 1024 / 1024).toFixed(2) + "MB";
console.log(`\n✅ Textures: ${mb(before)} -> ${mb(after)}`);
console.log(`✅ GLB: ${mb(glb.length)} -> ${mb(total)}  (${output})`);

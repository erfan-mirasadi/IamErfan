import { BufferGeometry, Matrix4, Mesh } from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

// The house arrives as ~540 separate meshes but only uses ~80 opaque materials.
// Every mesh is its own draw call in every pass, so the static, opaque ones are merged
// into one mesh per material right after loading: same vertices in the same places,
// same materials, roughly 4x fewer draw calls. Nodes that code looks up by name and
// anything transparent (needs per-object sorting) are left exactly as they are.

const textureChannels = (material) => {
  const channels = new Set();
  for (const value of Object.values(material)) {
    if (value?.isTexture) channels.add(value.channel);
  }
  return channels;
};

// attributes this material really reads; anything else is dropped so meshes match
function neededAttributes(material) {
  const names = ["position", "normal"];
  for (const channel of textureChannels(material)) names.push(channel === 0 ? "uv" : `uv${channel}`);
  if (material.vertexColors) names.push("color");
  return names;
}

function canMerge(mesh, keep) {
  if (!mesh.isMesh || mesh.isInstancedMesh || mesh.isSkinnedMesh || keep.has(mesh)) return false;
  // hidden or specially ordered objects would lose that in a merged mesh
  let visible = mesh.visible;
  mesh.traverseAncestors((parent) => {
    if (!parent.visible) visible = false;
  });
  if (!visible || mesh.renderOrder !== 0 || mesh.layers.mask !== 1) return false;
  const { material, geometry } = mesh;
  if (Array.isArray(material) || geometry.groups.length > 0) return false;
  if (Object.keys(geometry.morphAttributes).length > 0) return false;
  // blended / cut-out / refractive surfaces keep their own object (sorting, transmission)
  if (material.transparent || material.alphaTest > 0 || material.transmission > 0) return false;
  return true;
}

/**
 * Merges the static opaque meshes under `root` per material, in `root`'s space.
 * `keepNames`: nodes (and everything under them) that must stay untouched.
 * Returns how many meshes were merged into how many.
 */
export function mergeStaticMeshes(root, keepNames) {
  root.updateMatrixWorld(true);
  const toRoot = new Matrix4().copy(root.matrixWorld).invert();

  const keep = new Set();
  for (const name of keepNames) root.getObjectByName(name)?.traverse((o) => keep.add(o));

  const byMaterial = new Map();
  root.traverse((object) => {
    if (!canMerge(object, keep)) return;
    const list = byMaterial.get(object.material) ?? [];
    list.push(object);
    byMaterial.set(object.material, list);
  });

  let before = 0;
  let after = 0;
  const matrix = new Matrix4();
  for (const [material, meshes] of byMaterial) {
    const attributes = neededAttributes(material);
    const usable = meshes.filter((mesh) =>
      attributes.every((name) => mesh.geometry.attributes[name]),
    );
    // mergeGeometries needs all of them indexed or all of them not
    for (const indexed of [true, false]) {
      const group = usable.filter((mesh) => Boolean(mesh.geometry.index) === indexed);
      if (group.length < 2) continue;

      // work on copies in root space, the originals stay valid if merging fails
      const copies = group.map((mesh) => {
        const copy = new BufferGeometry();
        for (const name of attributes) copy.setAttribute(name, mesh.geometry.attributes[name].clone());
        if (indexed) copy.setIndex(mesh.geometry.index.clone());
        return copy.applyMatrix4(matrix.multiplyMatrices(toRoot, mesh.matrixWorld));
      });
      const merged = mergeGeometries(copies, false);
      copies.forEach((copy) => copy.dispose());
      if (!merged) continue; // incompatible attribute types: leave these alone

      const mesh = new Mesh(merged, material);
      mesh.name = `merged:${material.name}`;
      mesh.castShadow = group.some((m) => m.castShadow);
      mesh.receiveShadow = group.some((m) => m.receiveShadow);
      root.add(mesh);
      for (const original of group) {
        original.removeFromParent();
        original.geometry.dispose();
      }
      before += group.length;
      after += 1;
    }
  }
  return { before, after };
}

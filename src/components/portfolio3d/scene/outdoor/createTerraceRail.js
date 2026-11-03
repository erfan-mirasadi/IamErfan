import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

// A low concrete curb along the terrace's sea edges, so the floor no longer ends in a
// paper-thin cut, with a slim metal railing on top. Static merged geometry that reuses
// the house's own wall concrete and window-frame metal: two draw calls, no new
// textures or shaders and no work per frame.
const CURB_MATERIAL = "KB3D_CPI_ConcreteWhiteTrim";
const RAIL_MATERIAL = "KB3D_CPI_MetalsTrimA";
const TEXTURE_REPEAT = 5.77; // world units per texture repeat on the house walls

// house model coordinates (same space as the GLB)
const FLOOR_Y = -1.021;
const EDGE_X = 8.733; // right edge of the terrace (sea side)
const EDGE_Z = 15.716; // front edge
const START_Z = 10.84; // the house's front wall, where the right edge begins
const END_X = -10.887; // left end of the front edge
const RAIL_END_X = -2.5; // the railing stops before it passes next to the intro camera

// curb cross-section: o = outward from the floor edge, y = up from the floor
// (a slightly wider cap on a body, like a small cornice)
const CURB_PROFILE = [
  [-0.31, 0],
  [0.03, 0],
  [0.03, 0.18],
  [0.07, 0.18],
  [0.07, 0.25],
  [0.03, 0.29],
  [-0.31, 0.29],
  [-0.35, 0.25],
  [-0.35, 0.18],
  [-0.31, 0.18],
];
const CURB_INNER = -0.35;
const CURB_OUTER = 0.07;
const CURB_TOP = 0.29;

const RAIL_INSET = 0.14; // railing line, measured from the floor edge (middle of the curb)
const RAIL_HEIGHT = 1.75;
const MID_RAILS = [0.85, 1.3];
const POST_SPACING = 1.45;

function scaleUv(geometry, u, v = u) {
  const uv = geometry.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * u, uv.getY(i) * v);
  return geometry;
}

// extrude the curb profile along `length`, starting at the origin and running along +Z
function curb(length) {
  const shape = new THREE.Shape(CURB_PROFILE.map(([o, y]) => new THREE.Vector2(o, y)));
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: length, bevelEnabled: false });
  // the default UVs are in world units already
  return scaleUv(geometry, 1 / TEXTURE_REPEAT);
}

// round bar from a to b
function bar(a, b, radius, segments) {
  const direction = new THREE.Vector3().subVectors(b, a);
  const length = direction.length();
  const geometry = new THREE.CylinderGeometry(radius, radius, length, segments, 1);
  scaleUv(geometry, (2 * Math.PI * radius) / TEXTURE_REPEAT, length / TEXTURE_REPEAT);
  geometry.applyQuaternion(
    new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize()),
  );
  geometry.translate((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2);
  return geometry;
}

// posts evenly spread from a to b (both ends included), at floor height
function postsAlong(a, b) {
  const count = Math.max(1, Math.round(a.distanceTo(b) / POST_SPACING));
  return Array.from({ length: count + 1 }, (_, i) => new THREE.Vector3().lerpVectors(a, b, i / count));
}

function findMaterial(house, name) {
  let found = null;
  house.traverse((object) => {
    if (!found && object.isMesh && object.material?.name === name) found = object.material;
  });
  return found;
}

export function createTerraceRail(house) {
  // right edge runs from just behind the house corner to the front curb's inner face,
  // the front edge covers the whole width of the terrace
  const rightCurb = curb(EDGE_Z + CURB_INNER - (START_Z - 0.6));
  rightCurb.translate(EDGE_X, FLOOR_Y, START_Z - 0.6);
  const frontCurb = curb(EDGE_X + CURB_OUTER - END_X);
  frontCurb.rotateY(-Math.PI / 2); // profile faces the sea (+Z), runs toward -X
  frontCurb.translate(EDGE_X + CURB_OUTER, FLOOR_Y, EDGE_Z);
  const curbGeometry = mergeGeometries([rightCurb, frontCurb]);
  rightCurb.dispose();
  frontCurb.dispose();

  // railing: posts on the curb, a hand rail and two thin rails between them
  const x = EDGE_X - RAIL_INSET;
  const z = EDGE_Z - RAIL_INSET;
  const houseEnd = new THREE.Vector3(x, 0, START_Z + 0.06);
  const corner = new THREE.Vector3(x, 0, z);
  const frontEnd = new THREE.Vector3(RAIL_END_X, 0, z);
  const at = (point, height) => point.clone().setY(FLOOR_Y + height);

  const posts = [...postsAlong(houseEnd, corner), ...postsAlong(corner, frontEnd).slice(1)];
  const parts = posts.map((p) => bar(at(p, CURB_TOP), at(p, RAIL_HEIGHT + 0.02), 0.03, 8));
  for (const [from, to] of [
    [houseEnd, corner],
    [corner, frontEnd],
  ]) {
    parts.push(bar(at(from, RAIL_HEIGHT), at(to, RAIL_HEIGHT), 0.04, 10));
    for (const height of MID_RAILS) parts.push(bar(at(from, height), at(to, height), 0.016, 6));
  }
  const railGeometry = mergeGeometries(parts);
  parts.forEach((part) => part.dispose());

  // the house's own materials; plain stand-ins only if the model ever changes
  const ownMaterials = [];
  const standIn = (params) => {
    const material = new THREE.MeshStandardMaterial(params);
    ownMaterials.push(material);
    return material;
  };
  const curbMaterial =
    findMaterial(house, CURB_MATERIAL) ?? standIn({ color: "#e4dccf", roughness: 0.9 });
  const railMaterial =
    findMaterial(house, RAIL_MATERIAL) ??
    standIn({ color: "#c9cdd1", metalness: 1, roughness: 0.3 });

  const group = new THREE.Group();
  group.name = "TerraceRail";
  for (const [geometry, material, name] of [
    [curbGeometry, curbMaterial, "TerraceCurb"],
    [railGeometry, railMaterial, "TerraceRailing"],
  ]) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = name;
    // out of the sun's shadow camera anyway, so skip the shadow pass
    mesh.castShadow = false;
    // same as the house meshes (it is only a uniform, so the house shaders are reused)
    mesh.receiveShadow = true;
    group.add(mesh);
  }

  return {
    object: group,
    dispose() {
      curbGeometry.dispose();
      railGeometry.dispose();
      ownMaterials.forEach((material) => material.dispose());
    },
  };
}

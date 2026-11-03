import * as THREE from "three";
import { PALM_LEAVES as PALM, PALM_PLANTER as PLANTER } from "../model/houseNodes";

// Potted fan palms along the sea edges of the front terrace, so the empty side of the
// intro view gets some life. They are the palm + planter from the kitchen counter:
// same geometry and materials (nothing new to download or upload), drawn as instanced
// meshes, so all of them together cost two draw calls.

// house model coordinates (same space as the GLB): spot on the terrace floor,
// planter [width, height] (a bit taller than the kitchen one, like a tree tub),
// palm size (bigger than the planter = grown into a small tree), turn.
// They stand just inside the curb (see createTerraceRail).
const FLOOR_Y = -1.021;
export const TERRACE_FLOOR_Y = FLOOR_Y;
const SPOTS = [
  // right edge, from the house corner to the front corner
  { x: 7.75, z: 12.45, pot: [1.15, 1.6], palm: 1.55, turn: 0.4 },
  { x: 7.8, z: 13.8, pot: [0.95, 1.25], palm: 1.1, turn: 2.2 },
  { x: 7.6, z: 14.95, pot: [1.3, 1.9], palm: 2.05, turn: 4.1 },
  // front edge, coming toward the camera (only seen when looking to the right)
  { x: 6.2, z: 14.9, pot: [1.0, 1.35], palm: 1.2, turn: 1.3 },
  { x: 4.55, z: 14.8, pot: [1.15, 1.6], palm: 1.5, turn: 5.3 },
  { x: 2.8, z: 14.8, pot: [0.95, 1.25], palm: 1.05, turn: 3.0 },
  { x: 1.05, z: 14.82, pot: [1.05, 1.45], palm: 1.3, turn: 0.9 },
];
export const PLANT_SPOTS = SPOTS.map(({ x, z }) => ({ x, z }));

// sea breeze on the leaves (vertex shader only): the higher a leaf, the more it moves
const WIND = new THREE.Vector2(0.07, 0.035); // house units at the top of a palm
const PALM_HEIGHT = 3.4;

function windyLeaves(material) {
  const leaves = material.clone(); // same textures, only the vertex shader differs
  const time = { value: 0 };
  leaves.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = time;
    shader.uniforms.uWind = { value: WIND };
    shader.uniforms.uFloorY = { value: FLOOR_Y };
    shader.uniforms.uPalmHeight = { value: PALM_HEIGHT };
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        "#include <common>\nuniform float uTime;\nuniform vec2 uWind;\nuniform float uFloorY;\nuniform float uPalmHeight;",
      )
      .replace(
        "#include <project_vertex>",
        /* glsl */ `
        vec4 mvPosition = vec4( transformed, 1.0 );
        #ifdef USE_INSTANCING
          mvPosition = instanceMatrix * mvPosition;
          float lift = clamp( ( mvPosition.y - uFloorY ) / uPalmHeight, 0.0, 1.6 );
          vec3 root = instanceMatrix[ 3 ].xyz; // every palm keeps its own rhythm
          float phase = root.x * 0.9 + root.z * 1.7;
          float gust = sin( uTime * 1.1 + phase ) * 0.65 + sin( uTime * 2.3 + phase * 1.3 ) * 0.35;
          float flutter = sin( uTime * 6.5 + dot( mvPosition.xyz, vec3( 4.1, 3.3, 2.7 ) ) ) * 0.22;
          mvPosition.xz += uWind * ( gust + flutter ) * lift * lift;
        #endif
        mvPosition = modelViewMatrix * mvPosition;
        gl_Position = projectionMatrix * mvPosition;
        `,
      );
  };
  leaves.customProgramCacheKey = () => "terrace-palm-wind";
  return { material: leaves, time };
}

const _matrix = new THREE.Matrix4();

// transform of `object` in the space of `root`, without touching anyone's matrices
function matrixInRoot(object, root) {
  const result = new THREE.Matrix4();
  for (let o = object; o && o !== root; o = o.parent) {
    result.premultiply(_matrix.compose(o.position, o.quaternion, o.scale));
  }
  return result;
}

// move `anchor` to (x, y, z) of the spot, turned and scaled around it
function place(spot, anchor, y, width, height = width) {
  return new THREE.Matrix4()
    .makeTranslation(spot.x, y, spot.z)
    .multiply(new THREE.Matrix4().makeRotationY(spot.turn))
    .multiply(new THREE.Matrix4().makeScale(width, height, width))
    .multiply(new THREE.Matrix4().makeTranslation(-anchor.x, -anchor.y, -anchor.z));
}

export function createPierPlants(house) {
  const planter = house.getObjectByName(PLANTER);
  const palm = house.getObjectByName(PALM);
  if (!planter?.isMesh || !palm?.isMesh) return null; // the model changed

  const planterInHouse = matrixInRoot(planter, house);
  const palmInHouse = matrixInRoot(palm, house);

  // the planter stands on its bottom center, the palm grows from the middle of its rim
  if (!planter.geometry.boundingBox) planter.geometry.computeBoundingBox();
  const box = planter.geometry.boundingBox.clone().applyMatrix4(planterInHouse);
  const center = box.getCenter(new THREE.Vector3());
  const bottom = new THREE.Vector3(center.x, box.min.y, center.z);
  const rim = new THREE.Vector3(center.x, box.max.y, center.z);
  const height = box.max.y - box.min.y;

  const parts = [
    {
      source: planter,
      placements: SPOTS.map(({ pot: [width, tall], ...spot }) =>
        place(spot, bottom, FLOOR_Y, width, tall).multiply(planterInHouse),
      ),
    },
    {
      source: palm,
      placements: SPOTS.map((spot) =>
        place(spot, rim, FLOOR_Y + height * spot.pot[1], spot.palm).multiply(palmInHouse),
      ),
    },
  ];

  const group = new THREE.Group();
  group.name = "PierPlants";

  // the terrace palms move in the wind (the kitchen one indoors stays still)
  const wind = windyLeaves(palm.material);
  const materials = [planter.material, wind.material];

  const meshes = parts.map(({ source }, part) => {
    const mesh = new THREE.InstancedMesh(source.geometry, materials[part], SPOTS.length);
    mesh.name = `PierPlants_${source.name}`;
    // out of the sun's shadow camera anyway, so skip the shadow passes
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    group.add(mesh);
    return mesh;
  });

  // the leaves are alpha blended: draw the copies back to front, or a far palm
  // would paint over a nearer one
  let order = [];
  const writeOrder = (next) => {
    order = next;
    meshes.forEach((mesh, part) => {
      next.forEach((spotIndex, i) => mesh.setMatrixAt(i, parts[part].placements[spotIndex]));
      mesh.instanceMatrix.needsUpdate = true;
    });
  };
  writeOrder(SPOTS.map((_, i) => i));

  let camera = null;
  const distance = (i) => (SPOTS[i].x - camera.x) ** 2 + (SPOTS[i].z - camera.z) ** 2;

  return {
    object: group,
    // cameraInHouse: camera position in house model coordinates, time: seconds
    update(cameraInHouse, time) {
      wind.time.value = time;
      camera = cameraInHouse;
      for (let i = 1; i < order.length; i++) {
        if (distance(order[i - 1]) < distance(order[i])) {
          writeOrder([...order].sort((a, b) => distance(b) - distance(a)));
          break;
        }
      }
    },
    dispose() {
      // geometry and the planter material belong to the house model
      meshes.forEach((mesh) => mesh.dispose());
      wind.material.dispose();
    },
  };
}

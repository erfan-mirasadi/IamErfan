import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

// Trailing plants spilling over the roof edges of the house front, so the bare upper
// wall of the intro view gets some life: green pothos-like vines on the main wall,
// bougainvillea (green leaves + magenta bracts) on the lower block to the right.
// Fully procedural and light: one instanced leaf mesh (leaves and bracts share it,
// colored per instance), one merged mesh of thin stems. Two draw calls, no textures,
// nothing per frame but a time uniform: the breeze lives in the vertex shader.
// (The sun lights this facade from the front and its shadow camera does not reach
// it, so the vines do not cast shadows: they would cost passes and show nothing.)

// house model coordinates (same space as the GLB, see createTerraceRail)
const EDGES = [
  // main wall: cornice front at z 12.22, wall face 12.10, roof top 5.29.
  // From the right of the round window to the corner of the block.
  {
    top: 5.29,
    edge: 12.24,
    flowers: false,
    clusters: [
      { x: -1.85, strands: 4, length: [0.8, 1.45] }, // stays above the round window
      { x: -0.95, strands: 6, length: [1.1, 2.5] },
      { x: 0.05, strands: 5, length: [0.7, 1.9] },
      { x: 0.92, strands: 7, length: [1.5, 3.2] }, // the long fall at the corner
    ],
  },
  // lower block on the right: upper band front at z 11.27, roof top 5.12
  {
    top: 5.12,
    edge: 11.29,
    flowers: true,
    clusters: [
      { x: 2.05, strands: 5, length: [1.0, 2.4] },
      { x: 3.45, strands: 4, length: [0.7, 1.6] },
      { x: 4.95, strands: 6, length: [1.2, 2.8] },
      { x: 6.55, strands: 4, length: [0.8, 1.8] },
    ],
  },
];

const OVER_EDGE = 0.06; // where a strand drops over the edge, below the roof top
const LEAF_SPACING = 0.075; // along a strand
const LEAF_SIZE = [0.12, 0.19];
const BRACT_SIZE = [0.07, 0.1];
const STEM_RADIUS = 0.007;

// breeze: sideways swing that grows down the strand, a slow outward breath and a
// small flutter of every leaf tip (in house units)
const SWAY_GLSL = /* glsl */ `
  attribute float aHang; // distance below the roof edge
  attribute float aPhase; // one per strand
  uniform float uTime;
  uniform float uFlutter;
  vec3 vineSway( float hang, float phase, float tip ) {
    float bend = pow( max( hang, 0.0 ), 1.35 );
    float swing = sin( uTime * 1.25 + phase + hang * 1.6 ) * 0.7
      + sin( uTime * 2.6 + phase * 1.7 + hang * 3.1 ) * 0.3;
    float breath = 0.5 + 0.5 * sin( uTime * 0.8 + phase * 2.3 );
    float flutter = sin( uTime * 5.3 + phase * 3.1 + hang * 7.0 ) * uFlutter * tip;
    return vec3( swing * 0.02 * bend, 0.0, breath * 0.012 * bend + flutter );
  }
`;

function swayMaterial(params, time, flutter, key) {
  const material = new THREE.MeshStandardMaterial(params);
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = time;
    shader.uniforms.uFlutter = { value: flutter };
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>\n${SWAY_GLSL}`)
      .replace(
        "#include <project_vertex>",
        /* glsl */ `
        vec4 mvPosition = vec4( transformed, 1.0 );
        #ifdef USE_INSTANCING
          mvPosition = instanceMatrix * mvPosition;
        #endif
        mvPosition.xyz += vineSway( aHang, aPhase, position.y );
        mvPosition = modelViewMatrix * mvPosition;
        gl_Position = projectionMatrix * mvPosition;
        `,
      );
  };
  material.customProgramCacheKey = () => key;
  return material;
}

// heart-shaped leaf: petiole at the origin, tip at +y 1, facing +z, folded a little
// along the midrib so light runs across it. 11 vertices, 10 triangles.
function leafGeometry() {
  const points = [
    [0, 0.06, 0.03], // 0 petiole
    [0, 0.5, 0.045], // 1 middle of the midrib
    [0, 1, 0], // 2 tip
    [-0.36, 0, -0.02], // 3..6 left edge, lobe to tip
    [-0.5, 0.3, -0.04],
    [-0.4, 0.62, -0.03],
    [-0.18, 0.88, -0.01],
    [0.36, 0, -0.02], // 7..10 right edge
    [0.5, 0.3, -0.04],
    [0.4, 0.62, -0.03],
    [0.18, 0.88, -0.01],
  ];
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(points.flat(), 3));
  // counter-clockwise seen from +z
  geometry.setIndex([
    0, 4, 3, 0, 1, 4, 1, 5, 4, 1, 6, 5, 1, 2, 6, //
    0, 7, 8, 0, 8, 1, 1, 8, 9, 1, 9, 10, 1, 10, 2,
  ]);
  geometry.computeVertexNormals();
  return geometry;
}

// small seeded random, the same plants on every visit
function random(seed) {
  let state = seed;
  return (min = 0, max = 1) => {
    state = (state * 16807) % 2147483647;
    return min + ((state - 1) / 2147483646) * (max - min);
  };
}

const _x = new THREE.Vector3();
const _y = new THREE.Vector3();
const _z = new THREE.Vector3();
const _roll = new THREE.Quaternion();

// leaf matrix: base at `at`, pointing along `direction`, facing about `facing`
function leafMatrix(at, direction, facing, roll, size) {
  _y.copy(direction).normalize();
  _z.copy(facing).addScaledVector(_y, -facing.dot(_y)).normalize();
  _roll.setFromAxisAngle(_y, roll);
  _z.applyQuaternion(_roll);
  _x.crossVectors(_y, _z);
  return new THREE.Matrix4()
    .makeBasis(_x, _y, _z)
    .scale(new THREE.Vector3(size, size, size))
    .setPosition(at);
}

export function createHangingVines() {
  const rand = random(20251107);
  const leaves = []; // { matrix, color, hang, phase }
  const stems = [];

  const green = new THREE.Color();
  const leafColor = (young) =>
    green
      .setHSL(rand(0.24, 0.34), rand(0.38, 0.62), young ? rand(0.27, 0.36) : rand(0.13, 0.28))
      .clone();
  const bractColor = () =>
    new THREE.Color().setHSL(rand(0.9, 0.955), rand(0.62, 0.8), rand(0.42, 0.55));

  const addLeaf = (at, direction, facing, size, color, hang, phase) =>
    leaves.push({
      matrix: leafMatrix(at, direction, facing, rand(-0.45, 0.45), size),
      color,
      hang,
      phase,
    });

  // three papery bracts around a point, like a bougainvillea flower
  const addBracts = (at, hang, phase) => {
    const turn = rand(0, Math.PI * 2);
    for (let k = 0; k < 3; k++) {
      const angle = turn + (k * Math.PI * 2) / 3;
      addLeaf(
        at,
        new THREE.Vector3(Math.cos(angle), Math.sin(angle) * 0.8 - 0.15, 0.55),
        new THREE.Vector3(0, 0.2, 1),
        rand(...BRACT_SIZE),
        bractColor(),
        hang,
        phase,
      );
    }
  };

  for (const edge of EDGES) {
    const edgeY = edge.top - OVER_EDGE;
    for (const cluster of edge.clusters) {
      // a mound of leaves on the edge, as if from a planter on the roof
      const crown = 12 + Math.round(rand(0, 5));
      for (let i = 0; i < crown; i++) {
        const at = new THREE.Vector3(
          cluster.x + rand(-0.42, 0.42),
          edge.top + rand(-0.03, 0.1),
          edge.edge + rand(-0.2, 0.02),
        );
        const direction = new THREE.Vector3(rand(-0.9, 0.9), rand(0.3, 0.95), rand(0.45, 1));
        if (edge.flowers && rand() < 0.45) addBracts(at, 0, cluster.x);
        else
          addLeaf(at, direction, new THREE.Vector3(0, 0.8, 0.6), rand(0.15, 0.22), leafColor(false), 0, cluster.x);
      }

      // the strands falling from it
      for (let s = 0; s < cluster.strands; s++) {
        const length = rand(...cluster.length);
        const phase = rand(0, Math.PI * 2);
        const startX = cluster.x + rand(-0.36, 0.36);
        const wander = [rand(0.02, 0.06), rand(1.5, 3.2), rand(0, 6.28)];
        const drift = rand(-0.08, 0.08);
        const bow = rand(0.03, 0.09);
        const pointAt = (t) => {
          // t: 0 on the roof just behind the edge, then over the edge and down
          if (t < 0) return new THREE.Vector3(startX, edge.top + 0.03, edge.edge - 0.12);
          const u = t / length;
          return new THREE.Vector3(
            startX + Math.sin(t * wander[1] + wander[2]) * wander[0] * Math.min(1, t / 0.5) + drift * t,
            edgeY - t,
            edge.edge + 0.03 + Math.sin(Math.PI * u) * bow,
          );
        };

        const points = [pointAt(-1)];
        for (let t = 0; t <= length; t += 0.08) points.push(pointAt(t));
        const tube = new THREE.TubeGeometry(
          new THREE.CatmullRomCurve3(points),
          points.length,
          STEM_RADIUS,
          3,
          false,
        );
        const count = tube.attributes.position.count;
        const hang = new Float32Array(count);
        for (let i = 0; i < count; i++) hang[i] = Math.max(0, edgeY - tube.attributes.position.getY(i));
        tube.setAttribute("aHang", new THREE.BufferAttribute(hang, 1));
        tube.setAttribute("aPhase", new THREE.BufferAttribute(new Float32Array(count).fill(phase), 1));
        tube.deleteAttribute("uv");
        stems.push(tube);

        // leaves alternate left and right down the stem, smaller toward the young tip
        let side = rand() < 0.5 ? -1 : 1;
        for (let t = 0.04; t < length; t += LEAF_SPACING * rand(0.8, 1.2)) {
          const at = pointAt(t);
          const taper = 1 - 0.45 * (t / length) ** 2;
          const young = t > length - 0.35;
          if (edge.flowers && rand() < 0.22) {
            addBracts(at, t, phase);
          } else {
            addLeaf(
              at,
              new THREE.Vector3(side * rand(0.4, 0.8), rand(-0.85, -0.45), rand(0.3, 0.6)),
              new THREE.Vector3(0, 0.25, 1),
              rand(...LEAF_SIZE) * taper,
              leafColor(young),
              t,
              phase,
            );
          }
          // fuller right under the edge, thinning out down the strand like a real vine
          if (t < 0.55) {
            addLeaf(
              at,
              new THREE.Vector3(-side * rand(0.4, 0.8), rand(-0.7, -0.2), rand(0.4, 0.7)),
              new THREE.Vector3(0, 0.3, 1),
              rand(...LEAF_SIZE),
              leafColor(false),
              t,
              phase,
            );
          }
          side = -side;
        }
      }
    }
  }

  const time = { value: 0 };

  // leaves and bracts: one instanced mesh
  const leafMaterial = swayMaterial(
    { color: "#ffffff", roughness: 0.6, metalness: 0, side: THREE.DoubleSide },
    time,
    0.012,
    "hanging-vine-leaves",
  );
  const geometry = leafGeometry();
  const hangs = new Float32Array(leaves.length);
  const phases = new Float32Array(leaves.length);
  const leafMesh = new THREE.InstancedMesh(geometry, leafMaterial, leaves.length);
  leaves.forEach((leaf, i) => {
    leafMesh.setMatrixAt(i, leaf.matrix);
    leafMesh.setColorAt(i, leaf.color);
    hangs[i] = leaf.hang;
    phases[i] = leaf.phase;
  });
  geometry.setAttribute("aHang", new THREE.InstancedBufferAttribute(hangs, 1));
  geometry.setAttribute("aPhase", new THREE.InstancedBufferAttribute(phases, 1));
  leafMesh.name = "HangingVineLeaves";
  leafMesh.castShadow = false;
  leafMesh.receiveShadow = false;
  leafMesh.computeBoundingSphere();
  leafMesh.boundingSphere.radius += 0.2; // room for the sway

  // stems: one static merged mesh
  const stemGeometry = mergeGeometries(stems);
  stems.forEach((tube) => tube.dispose());
  const stemMaterial = swayMaterial(
    { color: "#46562f", roughness: 0.8, metalness: 0 },
    time,
    0,
    "hanging-vine-stems",
  );
  const stemMesh = new THREE.Mesh(stemGeometry, stemMaterial);
  stemMesh.name = "HangingVineStems";
  stemMesh.castShadow = false;
  stemMesh.receiveShadow = false;
  stemGeometry.computeBoundingSphere();
  stemGeometry.boundingSphere.radius += 0.2;

  const group = new THREE.Group();
  group.name = "HangingVines";
  group.add(stemMesh, leafMesh);

  return {
    object: group,
    update(seconds) {
      time.value = seconds;
    },
    dispose() {
      geometry.dispose();
      leafMaterial.dispose();
      leafMesh.dispose();
      stemGeometry.dispose();
      stemMaterial.dispose();
    },
  };
}

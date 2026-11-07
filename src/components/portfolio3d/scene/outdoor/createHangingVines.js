import * as THREE from "three";
import { VINE_LEAVES_URL } from "../../loading/sceneAssets";

// Trailing plants spilling over the roof edges of the house front, so the bare upper
// wall of the intro view gets some life. Real leaf photos (ez-tree's ash and oak leaf
// cards, MIT, see public/textures/NOTICE.txt) hang from the edges as bent cards that
// chain into long strands, in a darker back layer and a brighter front one.
// One instanced mesh, one 640x512 texture: one draw call, and alpha-tested, so no
// sorting. The breeze lives in the vertex shader. (The sun lights this facade from the
// front and its shadow camera does not reach it, so they cast no shadows.)

// house model coordinates (same space as the GLB, see createTerraceRail)
const EDGES = [
  // main wall: cornice front at z 12.22, wall face 12.10, roof top 5.29. From the
  // right of the round window to the block's corner, longer toward the corner.
  {
    top: 5.29,
    edge: 12.22,
    clusters: [
      { x: -2.05, strands: 2, length: [0.6, 1.1] },
      { x: -1.25, strands: 3, length: [0.9, 1.7] },
      { x: -0.35, strands: 2, length: [0.8, 1.4] },
      { x: 0.45, strands: 3, length: [1.2, 2.2] },
      { x: 1.05, strands: 4, length: [1.6, 2.8] },
    ],
  },
  // lower block on the right: upper band front at z 11.27, roof top 5.12
  {
    top: 5.12,
    edge: 11.27,
    clusters: [
      { x: 2.0, strands: 3, length: [0.9, 1.8] },
      { x: 2.95, strands: 2, length: [0.6, 1.2] },
      { x: 3.9, strands: 3, length: [1.0, 2.0] },
      { x: 4.9, strands: 2, length: [0.7, 1.3] },
      { x: 5.85, strands: 3, length: [1.1, 2.2] },
      { x: 6.8, strands: 2, length: [0.7, 1.4] },
      { x: 7.5, strands: 2, length: [0.6, 1.1] },
    ],
  },
];

const OVER_EDGE = 0.07; // where a strand drops over the edge, below the roof top
// leaf cards: [width / height] of an atlas cell, real-size ranges (house units = m)
const CARD_ASPECT = (330 / 524) * 0.85; // a little narrower than the photo: slimmer strands
const ASH_HEIGHT = [0.7, 1.15]; // fine leaflets of ~8-12 cm
const OAK_HEIGHT = [0.45, 0.7]; // broad lobed leaves, ivy-like
const YAW = -0.42; // cards turn a little toward where the intro camera looks from

// bent card: hangs from the origin down to y -1, x -0.5..0.5; the top bends back over
// the edge onto the roof (z < 0) like a stem coming out of a planter up there
function cardGeometry() {
  const geometry = new THREE.PlaneGeometry(1, 1, 1, 6);
  const position = geometry.attributes.position;
  const uv = geometry.attributes.uv;
  for (let i = 0; i < position.count; i++) {
    const down = 0.5 - position.getY(i); // 0 top .. 1 bottom
    const back = Math.max(0, 1 - down / 0.22);
    position.setXYZ(i, position.getX(i), -down + back * back * 0.05, -back * back * 0.18);
    // the photo's stem end (bottom row) at the top of the card, its tip hanging down
    uv.setY(i, down);
  }
  geometry.computeVertexNormals();
  return geometry;
}

// breeze: sideways swing growing down the strand, a slow outward breath, and every
// leaf tip fluttering a little (house units)
const VERTEX_HEAD = /* glsl */ `
  attribute float aEdge; // height of the roof edge this strand hangs from
  attribute float aPhase; // one per strand
  attribute float aCell; // atlas cell: 0 ash, 1 oak
  attribute float aFlip; // 1 = mirrored
  uniform float uTime;
  vec3 vineSway( float hang, float phase, float tip ) {
    float bend = pow( max( hang, 0.0 ), 1.35 );
    float swing = sin( uTime * 1.25 + phase + hang * 1.6 ) * 0.7
      + sin( uTime * 2.6 + phase * 1.7 + hang * 3.1 ) * 0.3;
    float breath = 0.5 + 0.5 * sin( uTime * 0.8 + phase * 2.3 );
    float flutter = sin( uTime * 5.3 + phase * 3.1 + hang * 7.0 ) * 0.012 * tip;
    return vec3( swing * 0.02 * bend, 0.0, breath * 0.012 * bend + flutter );
  }
`;

const FRAGMENT_COVERAGE = /* glsl */ `
  #include <map_fragment>
  // alpha averages away in small mip levels and thin leaves would vanish with
  // distance: scale it back up with the mip level (keeps the leaf cover)
  vec2 texel = vMapUv * vec2( textureSize( map, 0 ) );
  vec2 duvx = dFdx( texel );
  vec2 duvy = dFdy( texel );
  float mip = max( 0.0, 0.5 * log2( max( dot( duvx, duvx ), dot( duvy, duvy ) ) ) );
  diffuseColor.a *= 1.0 + mip * 0.25;
`;

function leafMaterial(map, time) {
  const material = new THREE.MeshStandardMaterial({
    map,
    alphaTest: 0.5,
    side: THREE.DoubleSide,
    roughness: 0.62,
    metalness: 0,
  });
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = time;
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>\n${VERTEX_HEAD}`)
      .replace(
        "#include <uv_vertex>",
        /* glsl */ `#include <uv_vertex>
        vMapUv.x = ( aCell + mix( vMapUv.x, 1.0 - vMapUv.x, aFlip ) ) * 0.5;`,
      )
      .replace(
        "#include <project_vertex>",
        /* glsl */ `
        vec4 mvPosition = instanceMatrix * vec4( transformed, 1.0 );
        mvPosition.xyz += vineSway( aEdge - mvPosition.y, aPhase, uv.y );
        mvPosition = modelViewMatrix * mvPosition;
        gl_Position = projectionMatrix * mvPosition;
        `,
      );
    shader.fragmentShader = shader.fragmentShader.replace("#include <map_fragment>", FRAGMENT_COVERAGE);
  };
  material.customProgramCacheKey = () => "hanging-vine-cards";
  return material;
}

// small seeded random, the same plants on every visit
function random(seed) {
  let state = seed;
  return (min = 0, max = 1) => {
    state = (state * 16807) % 2147483647;
    return min + ((state - 1) / 2147483646) * (max - min);
  };
}

const _position = new THREE.Vector3();
const _rotation = new THREE.Quaternion();
const _euler = new THREE.Euler();
const _scale = new THREE.Vector3();

export function createHangingVines() {
  const rand = random(20251107);
  const cards = []; // { matrix, tint, edge, phase, cell, flip }

  const addCard = (x, y, z, height, cell, { yaw, lean = 0, tint, edge, phase, up = false, bend = 1 }) => {
    _position.set(x, y, z);
    // up: crown cards pointing up and out over the edge instead of hanging
    // (lean > 0 tips a hanging card's bottom out, a crown card's tip out)
    _euler.set(up ? Math.PI + lean : -lean, yaw, 0, "YXZ");
    _rotation.setFromEuler(_euler);
    // z scales the bend over the edge: a chained card hangs straight
    _scale.set(height * CARD_ASPECT, height, height * CARD_ASPECT * bend);
    cards.push({
      matrix: new THREE.Matrix4().compose(_position, _rotation, _scale),
      tint,
      edge,
      phase,
      cell,
      flip: rand() < 0.5 ? 1 : 0,
    });
  };

  const shade = (layer) => {
    // deep green like the palms, back strands in the shade of the front ones
    const light = layer === 0 ? rand(0.42, 0.52) : rand(0.6, 0.78);
    return new THREE.Color(light * rand(0.78, 0.9), light * rand(0.92, 1), light * rand(0.7, 0.82));
  };

  for (const edge of EDGES) {
    const edgeY = edge.top - OVER_EDGE;
    for (const cluster of edge.clusters) {
      const strands = [];
      for (let i = 0; i < cluster.strands; i++) strands.push(1);
      if (rand() < 0.6) strands.push(0); // a darker strand behind, now and then
      for (const layer of strands) {
        const x = cluster.x + rand(-0.24, 0.24);
        const length = rand(...cluster.length) * (layer === 0 ? 0.8 : 1);
        const phase = rand(0, Math.PI * 2);
        const out = layer === 0 ? rand(0.03, 0.06) : rand(0.1, 0.18);
        const yaw = YAW + rand(-0.32, 0.32);
        const tint = shade(layer);
        // a strand: one card, or a few chained down (each starts on its upper one)
        let y = edge.top + 0.03;
        let hung = 0;
        while (hung < length) {
          const oak = rand() < 0.12;
          const height = oak ? rand(...OAK_HEIGHT) : rand(...ASH_HEIGHT);
          const cardYaw = yaw + rand(-0.12, 0.12);
          // turned cards reach back by half their width: keep that off the wall
          const reach = 0.5 * height * CARD_ASPECT * Math.abs(Math.sin(cardYaw));
          addCard(x + rand(-0.03, 0.03), y, edge.edge + reach + out, height, oak ? 1 : 0, {
            yaw: cardYaw,
            lean: rand(-0.02, 0.08),
            tint,
            edge: edgeY,
            phase,
            bend: hung === 0 ? 1 : 0.05,
          });
          const step = height * rand(0.82, 0.92);
          y -= step;
          hung += step;
        }
      }

      // a few leafy tufts on the edge, as if from a planter up on the roof
      const tufts = 3 + Math.round(rand(0, 2));
      for (let i = 0; i < tufts; i++) {
        addCard(
          cluster.x + rand(-0.38, 0.38),
          edge.top - 0.02,
          edge.edge - rand(0.02, 0.1),
          rand(0.3, 0.46),
          rand() < 0.5 ? 1 : 0,
          {
            yaw: YAW + rand(-0.5, 0.5),
            lean: rand(0.5, 1.0),
            tint: shade(rand() < 0.4 ? 0 : 1),
            edge: edgeY,
            phase: rand(0, Math.PI * 2),
            up: true,
          },
        );
      }
    }
  }

  const time = { value: 0 };
  const geometry = cardGeometry();
  const edges = new Float32Array(cards.length);
  const phases = new Float32Array(cards.length);
  const cells = new Float32Array(cards.length);
  const flips = new Float32Array(cards.length);

  const texture = new THREE.TextureLoader().load(VINE_LEAVES_URL, () => {
    mesh.visible = true; // never show bare cards before the leaves are in
  });
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  const material = leafMaterial(texture, time);

  const mesh = new THREE.InstancedMesh(geometry, material, cards.length);
  cards.forEach((card, i) => {
    mesh.setMatrixAt(i, card.matrix);
    mesh.setColorAt(i, card.tint);
    edges[i] = card.edge;
    phases[i] = card.phase;
    cells[i] = card.cell;
    flips[i] = card.flip;
  });
  geometry.setAttribute("aEdge", new THREE.InstancedBufferAttribute(edges, 1));
  geometry.setAttribute("aPhase", new THREE.InstancedBufferAttribute(phases, 1));
  geometry.setAttribute("aCell", new THREE.InstancedBufferAttribute(cells, 1));
  geometry.setAttribute("aFlip", new THREE.InstancedBufferAttribute(flips, 1));
  mesh.name = "HangingVines";
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  mesh.visible = false;
  mesh.computeBoundingSphere();
  mesh.boundingSphere.radius += 0.2; // room for the sway

  return {
    object: mesh,
    update(seconds) {
      time.value = seconds;
    },
    dispose() {
      geometry.dispose();
      material.dispose();
      texture.dispose();
      mesh.dispose();
    },
  };
}

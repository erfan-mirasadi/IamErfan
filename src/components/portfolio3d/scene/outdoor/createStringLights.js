import * as THREE from "three";

// Warm string lights hanging between the railing posts. Bulbs are one instanced mesh,
// the wire is one line, the night glow around the bulbs one set of points: three draw
// calls. By day they are plain glass bulbs, at night they shine. They sway in the wind.
const SAG = 0.2; // how far a string hangs down in the middle of a span
const BULB_SPACING = 0.32;
const BULB_RADIUS = 0.042;
const WIRE_SEGMENTS = 12; // per span
const GLOW = 9; // emissive intensity of a bulb at night
const HALO_SIZE = 0.6; // world size of the soft light around each bulb
const HALO_LIFT = 0.3; // meters the halo is depth-tested toward the camera
const SWAY = 0.035; // meters at the middle of a span

// point on a span: straight line from a to b, hanging down as a parabola
function hang(a, b, s, out) {
  return out.lerpVectors(a, b, s).setY(out.y - SAG * 4 * s * (1 - s));
}

export function createStringLights(anchors) {
  const spans = [];
  for (let i = 1; i < anchors.length; i++) {
    const a = anchors[i - 1];
    const b = anchors[i];
    const side = new THREE.Vector3().subVectors(b, a).cross(new THREE.Vector3(0, 1, 0)).normalize();
    spans.push({ a, b, side, phase: i * 1.7 });
  }

  // bulbs: evenly spaced along every span, never right on a post
  const bulbs = [];
  spans.forEach((span, index) => {
    const count = Math.max(1, Math.round(span.a.distanceTo(span.b) / BULB_SPACING));
    for (let j = 0; j < count; j++) bulbs.push({ span: index, s: (j + 0.5) / count });
  });

  const material = new THREE.MeshStandardMaterial({
    color: "#f4efe6",
    roughness: 0.25,
    metalness: 0,
    emissive: "#ffb257",
    emissiveIntensity: 0,
  });
  const mesh = new THREE.InstancedMesh(
    new THREE.SphereGeometry(BULB_RADIUS, 10, 8),
    material,
    bulbs.length,
  );
  mesh.name = "StringLightBulbs";
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  mesh.frustumCulled = false; // bounds move with the sway, the whole set is small

  const wirePoints = new Float32Array(spans.length * (WIRE_SEGMENTS + 1) * 3);
  const wireGeometry = new THREE.BufferGeometry();
  wireGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(wirePoints, 3).setUsage(THREE.DynamicDrawUsage),
  );
  // one line strip per span, without connecting the spans through the posts
  const index = [];
  spans.forEach((_, i) => {
    const first = i * (WIRE_SEGMENTS + 1);
    for (let j = 0; j < WIRE_SEGMENTS; j++) index.push(first + j, first + j + 1);
  });
  wireGeometry.setIndex(index);
  const wireMaterial = new THREE.LineBasicMaterial({ color: "#2b2724" });
  const wire = new THREE.LineSegments(wireGeometry, wireMaterial);
  wire.name = "StringLightWire";
  wire.frustumCulled = false;

  // soft warm light around every bulb (night only), sized in world units so near bulbs
  // get bigger halos, additive so overlapping ones add up like real lights
  const haloPositions = new Float32Array(bulbs.length * 3);
  const haloGeometry = new THREE.BufferGeometry();
  haloGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(haloPositions, 3).setUsage(THREE.DynamicDrawUsage),
  );
  const haloMaterial = new THREE.ShaderMaterial({
    uniforms: { uOpacity: { value: 0 }, uSize: { value: 1 } },
    vertexShader: /* glsl */ `
      uniform float uSize;
      void main() {
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = uSize / max(-mvPosition.z, 0.1);
        // depth-test the halo a bit in front of its bulb, so the bulb and the wire
        // right at its center never cut a dark hole into the glow
        float dist = length(mvPosition.xyz);
        mvPosition.xyz *= max(dist - ${HALO_LIFT.toFixed(2)}, 0.05) / dist;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uOpacity;
      void main() {
        vec2 p = gl_PointCoord * 2.0 - 1.0;
        float d = dot(p, p);
        float glow = exp(-d * 5.0) * 0.7 + exp(-d * 22.0) * 1.4;
        gl_FragColor = vec4(vec3(1.0, 0.68, 0.32) * glow * uOpacity, 1.0);
        #include <colorspace_fragment>
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const halos = new THREE.Points(haloGeometry, haloMaterial);
  halos.name = "StringLightHalos";
  halos.frustumCulled = false;
  halos.visible = false;
  // point size in pixels: world size x focal length of this draw's camera and target
  const _size = new THREE.Vector2();
  halos.onBeforeRender = (renderer, scene, camera) => {
    const target = renderer.getRenderTarget();
    const height = target ? target.height : renderer.getDrawingBufferSize(_size).y;
    haloMaterial.uniforms.uSize.value = HALO_SIZE * camera.projectionMatrix.elements[5] * height * 0.5;
  };

  const group = new THREE.Group();
  group.name = "StringLights";
  group.add(wire, mesh, halos);

  const point = new THREE.Vector3();
  const matrix = new THREE.Matrix4();
  const offset = (span, s, time) =>
    Math.sin(Math.PI * s) * SWAY * Math.sin(time * 1.3 + span.phase + s * 2.0);

  function update(time, night) {
    spans.forEach((span, i) => {
      for (let j = 0; j <= WIRE_SEGMENTS; j++) {
        const s = j / WIRE_SEGMENTS;
        hang(span.a, span.b, s, point).addScaledVector(span.side, offset(span, s, time));
        point.toArray(wirePoints, (i * (WIRE_SEGMENTS + 1) + j) * 3);
      }
    });
    wireGeometry.attributes.position.needsUpdate = true;

    bulbs.forEach((bulb, i) => {
      const span = spans[bulb.span];
      hang(span.a, span.b, bulb.s, point)
        .addScaledVector(span.side, offset(span, bulb.s, time))
        .setY(point.y - BULB_RADIUS * 0.9); // hangs under the wire
      mesh.setMatrixAt(i, matrix.makeTranslation(point.x, point.y, point.z));
      point.toArray(haloPositions, i * 3);
    });
    mesh.instanceMatrix.needsUpdate = true;
    halos.visible = night > 0.002;
    if (halos.visible) haloGeometry.attributes.position.needsUpdate = true;
    haloMaterial.uniforms.uOpacity.value = night;

    // a soft, slow breathing so they feel like real filaments
    material.emissiveIntensity = night * GLOW * (0.94 + 0.06 * Math.sin(time * 2.1));
  }

  update(0, 0);

  return {
    object: group,
    update,
    dispose() {
      mesh.geometry.dispose();
      material.dispose();
      mesh.dispose();
      wireGeometry.dispose();
      wireMaterial.dispose();
      haloGeometry.dispose();
      haloMaterial.dispose();
    },
  };
}

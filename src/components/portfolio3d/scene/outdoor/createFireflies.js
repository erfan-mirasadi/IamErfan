import * as THREE from "three";

// Fireflies drifting around the terrace palms at night. One Points draw call, the
// whole motion and blinking happen in the shader; hidden by day.
const COUNT = 34;

const vertexShader = /* glsl */ `
  attribute float aPhase;
  uniform float uTime;
  uniform float uPixelRatio;
  varying float vGlow;
  void main() {
    float t = uTime * (0.35 + aPhase * 0.25);
    vec3 p = position + vec3(
      sin(t * 1.3 + aPhase * 17.0) * 0.45,
      sin(t * 0.9 + aPhase * 29.0) * 0.28,
      cos(t * 1.1 + aPhase * 11.0) * 0.45
    );
    // short soft blinks, every firefly on its own rhythm
    vGlow = pow(max(sin(uTime * (0.9 + aPhase) + aPhase * 50.0), 0.0), 6.0);
    vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = (3.0 + 7.0 * vGlow) * uPixelRatio;
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uOpacity;
  varying float vGlow;
  void main() {
    float r = length(gl_PointCoord - 0.5) * 2.0;
    float a = smoothstep(1.0, 0.0, r);
    vec3 color = vec3(0.85, 1.0, 0.35) * (0.15 + 2.8 * vGlow);
    gl_FragColor = vec4(color * a * a * uOpacity, 1.0);
    #include <colorspace_fragment>
  }
`;

// spots: [{ x, z }] in house coordinates, floorY: height of the terrace floor
export function createFireflies(spots, floorY) {
  let seed = 11;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  const positions = new Float32Array(COUNT * 3);
  const phases = new Float32Array(COUNT);
  for (let i = 0; i < COUNT; i++) {
    const spot = spots[i % spots.length];
    const angle = random() * Math.PI * 2;
    const distance = 0.3 + random() * 1.3;
    positions[i * 3] = spot.x + Math.cos(angle) * distance;
    positions[i * 3 + 1] = floorY + 0.4 + random() * 2.4;
    positions[i * 3 + 2] = spot.z + Math.sin(angle) * distance;
    phases[i] = random();
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: { uTime: { value: 0 }, uOpacity: { value: 0 }, uPixelRatio: { value: 1 } },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const points = new THREE.Points(geometry, material);
  points.name = "Fireflies";
  points.frustumCulled = false;
  points.visible = false;

  return {
    object: points,
    update(time, night, pixelRatio) {
      points.visible = night > 0.002;
      if (!points.visible) return;
      material.uniforms.uTime.value = time;
      material.uniforms.uOpacity.value = night;
      material.uniforms.uPixelRatio.value = pixelRatio;
    },
    dispose() {
      geometry.dispose();
      material.dispose();
    },
  };
}

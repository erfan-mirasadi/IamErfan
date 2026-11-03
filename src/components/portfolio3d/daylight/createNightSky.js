import * as THREE from "three";

// Night sky: a dome around the camera painted in one shader (deep blue gradient, a big
// moon, the moon's glitter on a moving sea, a shooting star now and then) plus a
// field of twinkling stars. Two draw calls, only drawn at night. It follows the camera
// (the sky is "at infinity") and stays inside the camera's far plane (60).

// where the moon hangs: in the open sky right of the house in the intro view
export const MOON_DIR = new THREE.Vector3(0.905, 0.423, -0.032).normalize();
const MOON_SIZE = 0.042; // radius as a share of the screen height (round on any lens)
const DOME_RADIUS = 50;
const STAR_RADIUS = 45;
const STAR_COUNT = 1400;

const common = /* glsl */ `
  float hash1(float n) { return fract(sin(n) * 43758.5453123); }
  float hash2(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash2(i), hash2(i + vec2(1.0, 0.0)), u.x),
               mix(hash2(i + vec2(0.0, 1.0)), hash2(i + vec2(1.0, 1.0)), u.x), u.y);
  }
`;

const domeVertex = /* glsl */ `
  uniform vec3 uMoonDir;
  varying vec3 vDir;
  varying vec3 vMoon; // moon center in NDC (xy) and whether it is in front (z)
  void main() {
    vDir = position;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    // same matrices as this draw, so the moon never lags behind the camera
    vec4 moon = projectionMatrix * viewMatrix * vec4(cameraPosition + uMoonDir * 40.0, 1.0);
    vMoon = vec3(moon.xy / max(moon.w, 1e-4), step(0.0, moon.w));
  }
`;

const domeFragment = /* glsl */ `
  uniform float uTime;
  uniform float uOpacity;
  uniform vec3 uMoonDir;
  uniform vec2 uResolution;
  uniform float uMoonSize;
  varying vec3 vDir;
  varying vec3 vMoon;
  ${common}

  vec3 skyColor(vec3 d) {
    float h = max(d.y, 0.0);
    vec3 horizon = vec3(0.019, 0.023, 0.085);
    vec3 mid = vec3(0.004, 0.007, 0.029);
    vec3 zenith = vec3(0.0016, 0.0025, 0.007);
    vec3 c = mix(horizon, mid, smoothstep(0.0, 0.2, h));
    c = mix(c, zenith, smoothstep(0.2, 0.8, h));
    // moonlit haze around the moon
    float m = max(dot(d, uMoonDir), 0.0);
    c += vec3(0.05, 0.065, 0.12) * pow(m, 14.0) + vec3(0.012, 0.016, 0.03) * pow(m, 3.0);
    // faint teal / violet city glow far away on the horizon
    c += vec3(0.012, 0.03, 0.045) * exp(-h * 30.0);
    return c;
  }

  vec3 dirFrom(float azimuth, float elevation) {
    return vec3(sin(azimuth) * cos(elevation), sin(elevation), -cos(azimuth) * cos(elevation));
  }

  // one shooting star every few seconds, in the sky the intro camera looks at
  vec3 shootingStar(vec3 d) {
    float period = 9.0;
    float cycle = floor(uTime / period);
    float age = uTime - cycle * period;
    float life = 0.85;
    if (age > life || hash1(cycle * 7.13) < 0.35) return vec3(0.0);
    float azimuth = mix(1.1, 1.9, hash1(cycle * 1.37));
    float elevation = mix(0.42, 0.8, hash1(cycle * 2.71 + 4.0));
    vec3 a = dirFrom(azimuth, elevation);
    vec3 b = dirFrom(azimuth + mix(0.28, 0.5, hash1(cycle * 0.53 + 9.0)), elevation - 0.26);
    float k = age / life;
    vec3 head = normalize(mix(a, b, k));
    vec3 back = normalize(a - b);
    float len = 0.16 * k + 0.02;
    vec3 e = d - head;
    float s = clamp(dot(e, back), 0.0, len);
    float dist = length(e - back * s);
    float glow = exp(-pow(dist / 0.0016, 2.0)) * (1.0 - s / len);
    return vec3(0.85, 0.9, 1.0) * glow * sin(k * 3.14159) * 4.0;
  }

  vec3 moon() {
    if (vMoon.z < 0.5) return vec3(0.0);
    vec2 center = (vMoon.xy * 0.5 + 0.5) * uResolution;
    float radius = uMoonSize * uResolution.y;
    vec2 q = (gl_FragCoord.xy - center) / radius;
    float r = length(q);
    float disc = smoothstep(1.0, 0.93, r);
    float maria = noise(q * 2.6 + 3.1) * 0.65 + noise(q * 6.5 + 1.3) * 0.35;
    vec3 surface = vec3(1.0, 0.96, 0.88) * (0.78 + 0.22 * maria) * (1.0 - 0.22 * r * r);
    vec3 halo = vec3(0.22, 0.28, 0.45) * exp(-max(r - 1.0, 0.0) * 1.8) * (1.0 - disc);
    return surface * disc * 3.0 + halo * 0.6;
  }

  vec3 sea(vec3 d) {
    float down = max(-d.y, 0.0012);
    float dist = 1.0 / down; // the eye is one unit above the water
    vec2 p = d.xz * dist;
    float fade = exp(-dist * 0.018); // calmer far away, no shimmering noise at the horizon
    float t = uTime;
    vec2 w = vec2(
      sin(p.x * 1.3 + t * 0.9) + 0.6 * sin(p.y * 2.1 - t * 1.2 + p.x * 0.4) + 0.3 * sin((p.x + p.y) * 4.7 + t * 2.3),
      sin(p.y * 1.1 - t * 0.7) + 0.6 * sin(p.x * 1.9 + t * 1.1 - p.y * 0.3) + 0.3 * sin((p.x - p.y) * 5.3 - t * 1.9)
    );
    vec3 n = normalize(vec3(w * (0.035 + 0.045 * fade), 1.0).xzy);
    vec3 r = reflect(d, n);
    r.y = abs(r.y);
    float fresnel = 0.02 + 0.98 * pow(1.0 - max(dot(n, -d), 0.0), 5.0);
    vec3 c = mix(vec3(0.0015, 0.003, 0.009), skyColor(r), fresnel);
    // the moon's glitter path on the waves
    float glint = pow(max(dot(r, uMoonDir), 0.0), 420.0);
    c += vec3(1.0, 0.94, 0.82) * glint * 7.0;
    return c;
  }

  void main() {
    vec3 d = normalize(vDir);
    vec3 color = d.y >= 0.0 ? skyColor(d) + shootingStar(d) + moon() : sea(d);
    gl_FragColor = vec4(color, uOpacity);
    #include <colorspace_fragment>
  }
`;

const starVertex = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  attribute vec3 aColor;
  uniform float uTime;
  uniform float uPixelRatio;
  varying vec3 vColor;
  void main() {
    float twinkle = 0.7 + 0.3 * sin(uTime * (0.8 + aPhase * 1.7) + aPhase * 40.0);
    vColor = aColor * twinkle;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = aSize * uPixelRatio;
  }
`;

const starFragment = /* glsl */ `
  uniform float uOpacity;
  varying vec3 vColor;
  void main() {
    float r = length(gl_PointCoord - 0.5) * 2.0;
    float a = smoothstep(1.0, 0.0, r);
    gl_FragColor = vec4(vColor * a * a * uOpacity, 1.0);
    #include <colorspace_fragment>
  }
`;

function starField() {
  let seed = 42;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  const positions = new Float32Array(STAR_COUNT * 3);
  const sizes = new Float32Array(STAR_COUNT);
  const phases = new Float32Array(STAR_COUNT);
  const tints = new Float32Array(STAR_COUNT * 3);
  const warm = new THREE.Color("#ffd9b0");
  const cold = new THREE.Color("#b9ccff");
  const tint = new THREE.Color();
  for (let i = 0; i < STAR_COUNT; i++) {
    // upper hemisphere, a bit denser toward the horizon like a real sky photo
    const azimuth = random() * Math.PI * 2;
    const elevation = Math.asin(0.03 + 0.97 * Math.pow(random(), 1.3));
    positions[i * 3] = Math.sin(azimuth) * Math.cos(elevation) * STAR_RADIUS;
    positions[i * 3 + 1] = Math.sin(elevation) * STAR_RADIUS;
    positions[i * 3 + 2] = -Math.cos(azimuth) * Math.cos(elevation) * STAR_RADIUS;
    const bright = Math.pow(random(), 5); // few bright ones, many faint
    sizes[i] = 1.6 + bright * 3.6;
    phases[i] = random();
    tint.copy(cold).lerp(warm, random() * 0.6).multiplyScalar(0.7 + bright * 3.2);
    tint.toArray(tints, i * 3);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
  geometry.setAttribute("aColor", new THREE.BufferAttribute(tints, 3));
  return geometry;
}

export function createNightSky() {
  const domeMaterial = new THREE.ShaderMaterial({
    vertexShader: domeVertex,
    fragmentShader: domeFragment,
    uniforms: {
      uTime: { value: 0 },
      uOpacity: { value: 0 },
      uMoonDir: { value: MOON_DIR },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uMoonSize: { value: MOON_SIZE },
    },
    side: THREE.BackSide,
    transparent: true,
    depthWrite: false,
  });
  const dome = new THREE.Mesh(new THREE.SphereGeometry(DOME_RADIUS, 48, 24), domeMaterial);
  dome.name = "NightSkyDome";
  // first of the transparent things (palm leaves, glass...), behind everything else
  dome.renderOrder = -10;
  dome.frustumCulled = false;
  // the moon is drawn in pixels of whatever target this draw goes to (the composer's
  // buffer, which can differ from the canvas for a frame when the resolution changes)
  dome.onBeforeRender = (renderer) => {
    const target = renderer.getRenderTarget();
    if (target) domeMaterial.uniforms.uResolution.value.set(target.width, target.height);
    else renderer.getDrawingBufferSize(domeMaterial.uniforms.uResolution.value);
  };

  const starMaterial = new THREE.ShaderMaterial({
    vertexShader: starVertex,
    fragmentShader: starFragment,
    uniforms: { uTime: { value: 0 }, uOpacity: { value: 0 }, uPixelRatio: { value: 1 } },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const stars = new THREE.Points(starField(), starMaterial);
  stars.name = "NightSkyStars";
  stars.renderOrder = -9;
  stars.frustumCulled = false;

  const group = new THREE.Group();
  group.name = "NightSky";
  group.add(dome, stars);

  return {
    object: group,
    update(camera, gl, time, night) {
      group.visible = night > 0.002;
      if (!group.visible) return;
      group.position.setFromMatrixPosition(camera.matrixWorld);
      domeMaterial.uniforms.uTime.value = time;
      domeMaterial.uniforms.uOpacity.value = night;
      starMaterial.uniforms.uTime.value = time;
      starMaterial.uniforms.uOpacity.value = night * night;
      starMaterial.uniforms.uPixelRatio.value = gl.getPixelRatio();
    },
    dispose() {
      dome.geometry.dispose();
      domeMaterial.dispose();
      stars.geometry.dispose();
      starMaterial.dispose();
    },
  };
}

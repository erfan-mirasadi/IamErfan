import * as THREE from "three";

// A few gulls soaring in wide, slow circles over the sea, right of the house (world
// space). Part of each circle is behind the house, so they come and go instead of
// always being on screen. One instanced mesh = one draw call; wings flap in the shader.
const FLOCKS = [{ center: [22, 4.4, 8.5], radius: [6, 8.5], count: 3, speed: 0.12 }];
const WINGSPAN_SCALE = 0.85;

function gullGeometry() {
  // body along +Z (forward), wings along X; aWeight: 0 body, 0.5 wrist, 1 wing tip
  const v = [
    // body
    [0, 0, 0.42, 0], [-0.07, 0.02, 0.05, 0], [0, 0, -0.38, 0],
    [0, 0, 0.42, 0], [0, 0, -0.38, 0], [0.07, 0.02, 0.05, 0],
  ];
  for (const side of [-1, 1]) {
    const bodyFront = [side * 0.07, 0.02, 0.14, 0];
    const bodyBack = [side * 0.07, 0.02, -0.1, 0];
    const wristFront = [side * 0.5, 0.06, 0.06, 0.5];
    const wristBack = [side * 0.5, 0.05, -0.12, 0.5];
    const tip = [side * 1.0, -0.04, -0.26, 1];
    v.push(bodyFront, wristFront, bodyBack);
    v.push(bodyBack, wristFront, wristBack);
    v.push(wristFront, tip, wristBack);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(v.flatMap(([x, y, z]) => [x, y, z]), 3));
  geometry.setAttribute("aWeight", new THREE.Float32BufferAttribute(v.map((p) => p[3]), 1));
  return geometry;
}

const vertexShader = /* glsl */ `
  attribute float aWeight;
  attribute float aPhase;
  attribute float aFlap;
  uniform float uTime;
  varying float vShade;
  void main() {
    vec3 p = position;
    // gulls flap for a while, then glide with the wings slightly raised
    float glide = smoothstep(-0.2, 0.6, sin(uTime * 0.37 + aPhase * 2.3));
    float flap = sin(uTime * aFlap + aPhase) * mix(0.7, 0.07, glide) + mix(0.0, 0.14, glide);
    float side = sign(p.x);
    float angle = side * flap * mix(0.8, 1.45, aWeight) * step(0.01, aWeight);
    float c = cos(angle);
    float s = sin(angle);
    p.xy = vec2(p.x * c - p.y * s, p.x * s + p.y * c);
    vShade = aWeight;
    gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(p, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  varying float vShade;
  void main() {
    // dark silhouette against the sunset, wing tips a touch darker
    gl_FragColor = vec4(uColor * (1.0 - vShade * 0.35), 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export function createSeagulls() {
  const birds = [];
  let seed = 7;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  for (const flock of FLOCKS) {
    for (let i = 0; i < flock.count; i++) {
      birds.push({
        center: new THREE.Vector3(...flock.center),
        radius: flock.radius[0] + random() * (flock.radius[1] - flock.radius[0]),
        speed: flock.speed * (0.85 + random() * 0.3),
        angle: random() * Math.PI * 2,
        lift: 0.6 + random() * 1.4,
        liftSpeed: 0.2 + random() * 0.3,
      });
    }
  }

  const geometry = gullGeometry();
  geometry.setAttribute(
    "aPhase",
    new THREE.InstancedBufferAttribute(new Float32Array(birds.map(() => random() * 10)), 1),
  );
  geometry.setAttribute(
    "aFlap",
    new THREE.InstancedBufferAttribute(new Float32Array(birds.map(() => 7 + random() * 3)), 1),
  );

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    side: THREE.DoubleSide,
    uniforms: { uTime: { value: 0 }, uColor: { value: new THREE.Color("#2b2522") } },
  });

  const mesh = new THREE.InstancedMesh(geometry, material, birds.length);
  mesh.name = "Seagulls";
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  // fixed bounds around every flight circle, so the birds are skipped whenever
  // they are out of view (e.g. inside the house) without recomputing each frame
  const bounds = new THREE.Box3();
  for (const flock of FLOCKS) {
    const reach = flock.radius[1] + 2.5; // circle + lift + wings
    const center = new THREE.Vector3(...flock.center);
    bounds.expandByPoint(center.clone().addScalar(reach));
    bounds.expandByPoint(center.clone().addScalar(-reach));
  }
  mesh.boundingSphere = bounds.getBoundingSphere(new THREE.Sphere());

  const position = new THREE.Vector3();
  const ahead = new THREE.Vector3();
  const matrix = new THREE.Matrix4();
  const bank = new THREE.Quaternion();
  const scale = new THREE.Vector3().setScalar(WINGSPAN_SCALE);
  const up = new THREE.Vector3(0, 1, 0);
  // all birds circle the same way, so they always bank toward the inside of the turn
  const roll = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), 0.32);

  const pathPoint = (bird, angle, time, out) =>
    out.set(
      bird.center.x + Math.cos(angle) * bird.radius,
      bird.center.y + Math.sin(time * bird.liftSpeed + bird.angle) * bird.lift,
      bird.center.z + Math.sin(angle) * bird.radius,
    );

  // night: 0..1, the gulls go to sleep at night
  function update(time, night = 0) {
    mesh.visible = night < 0.5;
    if (!mesh.visible) return;
    material.uniforms.uTime.value = time;
    birds.forEach((bird, i) => {
      const angle = bird.angle + time * bird.speed;
      pathPoint(bird, angle, time, position);
      pathPoint(bird, angle + 0.05, time + 0.05 / bird.speed, ahead);
      // face the flight direction and bank into the circle
      matrix.lookAt(ahead, position, up);
      matrix.makeRotationFromQuaternion(bank.setFromRotationMatrix(matrix).multiply(roll));
      matrix.scale(scale);
      matrix.setPosition(position);
      mesh.setMatrixAt(i, matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }

  update(0);

  return {
    object: mesh,
    update,
    dispose() {
      geometry.dispose();
      material.dispose();
    },
  };
}

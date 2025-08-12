"use client";

import { Suspense, useMemo, useRef, useState, useEffect } from "react";
import AccessCard from "./AccessCard";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import HouseScene from "./scene/HouseScene";

const CAMERA_WAYPOINTS = [
  {
    id: 1,
    name: "",
    position: [-3.55, 0.2, 19.37],
    target: [4.91, -0.04, 1.82],
    distance: 19.49,
  },
  {
    id: 2,
    name: "access",
    position: [-1.44, 0.08, -8.68],
    target: [-3.91, -2.53, -13.79],
    distance: 6.24,
  },
  {
    id: 3,
    name: "nature",
    position: [-0.96, 0.82, -7.72],
    target: [2.1, -1.31, -5.78],
    distance: 4.2,
  },
  {
    id: 4,
    name: "books",
    position: [-3.2, -1.53, 10.26],
    target: [0.91, -5.54, 17.3],
    distance: 9.08,
  },
  {
    id: 5,
    name: "sports",
    position: [-6.44, -0.35, 7.77],
    target: [-9.54, -1.84, 6.16],
    distance: 3.79,
  },
  {
    id: 6,
    name: "Point_6",
    position: [0.08, -1.58, 8.78],
    target: [7.67, -0.2, 9.88],
    distance: 7.79,
  },
  {
    id: 7,
    name: "Point_7",
    position: [0.39, 0.03, 12.71],
    target: [7.8, -0.96, 10.52],
    distance: 7.79,
  },
  {
    id: 8,
    name: "Point_8",
    position: [-4.07, -1.18, 11.77],
    target: [-22.44, -4.46, 27.46],
    distance: 24.38,
  },
];

function CameraController({ controlsRef, targetWaypoint, onTransitionEnd }) {
  const { camera, clock } = useThree();

  const transitionRef = useRef({
    active: false,
    start: null,
    target: null,
    startTime: 0,
    duration: 2.8,
  });

  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (controlsRef.current && !initialized) {
      const controls = controlsRef.current;
      controls.target.set(4.91, -0.04, 1.82);
      controls.update();
      camera.position.set(-3.55, 0.2, 19.37);
      setInitialized(true);

      console.log("🎯 Camera initialized to: Point_1");
    }
  }, [controlsRef, camera, initialized]);

  useEffect(() => {
    if (controlsRef.current) {
      const controls = controlsRef.current;

      // Log camera info on movement
      const logCameraInfo = () => {
        console.log("Camera Info:");
        console.log("Position:", [
          Number(camera.position.x.toFixed(2)),
          Number(camera.position.y.toFixed(2)),
          Number(camera.position.z.toFixed(2)),
        ]);
        console.log("Target:", [
          Number(controls.target.x.toFixed(2)),
          Number(controls.target.y.toFixed(2)),
          Number(controls.target.z.toFixed(2)),
        ]);
        console.log("FOV:", camera.fov);
        console.log(
          "Distance:",
          Number(camera.position.distanceTo(controls.target).toFixed(2))
        );
        console.log("---");
      };

      controls.addEventListener("change", logCameraInfo);

      return () => {
        controls.removeEventListener("change", logCameraInfo);
      };
    }
  }, [camera, controlsRef]);

  useEffect(() => {
    if (targetWaypoint && controlsRef.current) {
      const controls = controlsRef.current;
      const transition = transitionRef.current;

      transition.active = true;
      transition.start = {
        position: camera.position.clone(),
        target: controls.target.clone(),
      };
      transition.target = {
        position: new THREE.Vector3(...targetWaypoint.position),
        target: new THREE.Vector3(...targetWaypoint.target),
      };
      transition.startTime = clock.getElapsedTime();

      console.log(`🚀 Starting smooth transition to ${targetWaypoint.name}`);
      console.log("From:", transition.start.position.toArray());
      console.log("To:", transition.target.position.toArray());
    }
  }, [targetWaypoint, camera, controlsRef, clock]);

  useFrame(() => {
    if (!transitionRef.current.active || !controlsRef.current) return;

    const { start, target, startTime, duration } = transitionRef.current;
    const elapsed = clock.getElapsedTime() - startTime;
    const progress = Math.min(elapsed / duration, 1);

    const t =
      progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

    camera.position.lerpVectors(start.position, target.position, t);
    controlsRef.current.target.lerpVectors(start.target, target.target, t);

    const shakeStrength = 0.03 * (1 - progress);
    if (shakeStrength > 0.001) {
      camera.position.x += (Math.random() - 0.5) * shakeStrength;
      camera.position.y += (Math.random() - 0.5) * shakeStrength;
      camera.position.z += (Math.random() - 0.5) * shakeStrength;
    }

    controlsRef.current.update();

    if (progress >= 1) {
      transitionRef.current.active = false;
      onTransitionEnd?.();
      console.log("✅ Transition completed");
    }
  });

  return null;
}

export default function PortfolioViewer() {
  const dpr = useMemo(() => [1, 2], []);
  const controlsRef = useRef();
  const [currentWaypoint, setCurrentWaypoint] = useState(0);
  const [targetWaypoint, setTargetWaypoint] = useState(null);
  const [transitioning, setTransitioning] = useState(false);

  const goToWaypoint = (index) => {
    if (transitioning) return;

    const waypoint = CAMERA_WAYPOINTS[index];
    if (waypoint) {
      setTransitioning(true);
      setTargetWaypoint(waypoint);
      setCurrentWaypoint(index);

      console.log(`🎯 Navigating to ${waypoint.name}`);
      console.log("Target position:", waypoint.position);
      console.log("Target look-at:", waypoint.target);
      if (waypoint.distance) {
        console.log("Expected distance:", waypoint.distance);
      }
    }
  };

  const handleTransitionEnd = () => {
    setTransitioning(false);
    setTargetWaypoint(null);
  };

  return (
    <div className="fixed inset-0 w-screen h-screen">
      {currentWaypoint === 1 && <AccessCard positionId={2} />}

      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <div className="bg-black/50 text-white px-4 py-2 rounded backdrop-blur">
          <div>
            Current: {CAMERA_WAYPOINTS[currentWaypoint]?.name || "Manual"}
          </div>
          {CAMERA_WAYPOINTS[currentWaypoint]?.distance && (
            <div className="text-sm opacity-75">
              Distance: {CAMERA_WAYPOINTS[currentWaypoint].distance}
            </div>
          )}
          {transitioning && (
            <div className="text-xs text-yellow-300">Transitioning...</div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {CAMERA_WAYPOINTS.map((waypoint, index) => (
            <button
              key={waypoint.id}
              onClick={() => goToWaypoint(index)}
              disabled={transitioning}
              className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                currentWaypoint === index
                  ? "bg-blue-500 text-white"
                  : transitioning
                  ? "bg-gray-500 text-gray-300 cursor-not-allowed"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              <div className="text-center">
                <div>{waypoint.name}</div>
                {waypoint.distance && (
                  <div className="text-xs opacity-75">
                    d: {waypoint.distance}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      <Canvas
        dpr={dpr}
        camera={{
          position: [-3.55, 0.2, 19.37],
          fov: 85,
          near: 0.1,
          far: 1000,
        }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <CameraController
          controlsRef={controlsRef}
          targetWaypoint={targetWaypoint}
          onTransitionEnd={handleTransitionEnd}
        />

        <Suspense fallback={null}>
          <ambientLight intensity={0.6} />
          <directionalLight
            position={[10, 15, 10]}
            intensity={1.2}
            castShadow
          />

          <HouseScene />

          <Environment preset="park" background />
        </Suspense>

        <OrbitControls
          ref={controlsRef}
          makeDefault
          enablePan
          enableRotate
          enableZoom
          minDistance={1}
          maxDistance={50}
          maxPolarAngle={Math.PI * 0.9}
          enableDamping={true}
          dampingFactor={0.05}
        />
      </Canvas>
    </div>
  );
}

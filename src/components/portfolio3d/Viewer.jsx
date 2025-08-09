"use client";

import { Suspense, useMemo, useRef, useState, useEffect } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { Environment, OrbitControls, Bounds } from "@react-three/drei";
import * as THREE from "three";
import HouseScene from "./scene/HouseScene";

// Camera waypoints - 8 predefined positions
const CAMERA_WAYPOINTS = [
  {
    id: 1,
    name: "Point_1",
    position: [-3.55, 0.2, 19.37],
    target: [4.91, -0.04, 1.82],
    distance: 19.49,
  },
  {
    id: 2,
    name: "Point_2",
    position: [-1.44, 0.08, -8.68],
    target: [-3.91, -2.53, -13.79],
    distance: 6.24,
  },
  {
    id: 3,
    name: "Point_3",
    position: [-0.96, 0.82, -7.72],
    target: [2.1, -1.31, -5.78],
    distance: 4.2,
  },
  {
    id: 4,
    name: "Point_4",
    position: [-6.44, -0.35, 7.77],
    target: [-9.54, -1.84, 6.16],
    distance: 3.79,
  },
  {
    id: 5,
    name: "Point_5",
    position: [-3.2, -1.53, 10.26],
    target: [0.91, -5.54, 17.3],
    distance: 9.08,
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

// Camera controller component with smooth transitions
function CameraController({ controlsRef, targetWaypoint, onTransitionEnd }) {
  const { camera } = useThree();
  const transitionRef = useRef({
    active: false,
    start: null,
    target: null,
    duration: 2.8, // slower and smoother
  });
  const [initialized, setInitialized] = useState(false);

  // Initialize camera position once
  useEffect(() => {
    if (controlsRef.current && !initialized) {
      const controls = controlsRef.current;

      // Set initial target to first waypoint
      controls.target.set(4.91, -0.04, 1.82); // Point_1 target
      controls.update();
      setInitialized(true);

      console.log("🎯 Camera initialized to: Point_1");
    }
  }, [controlsRef, initialized]);

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

  // Handle smooth transitions
  useEffect(() => {
    if (targetWaypoint && controlsRef.current) {
      const controls = controlsRef.current;
      const transition = transitionRef.current;

      // Start transition
      transition.active = true;
      transition.start = {
        position: camera.position.clone(),
        target: controls.target.clone(),
      };
      transition.target = {
        position: new THREE.Vector3(...targetWaypoint.position),
        target: new THREE.Vector3(...targetWaypoint.target),
      };
      transition.startTime = Date.now();

      console.log(`🚀 Starting smooth transition to ${targetWaypoint.name}`);
      console.log("From:", transition.start.position.toArray());
      console.log("To:", transition.target.position.toArray());
    }
  }, [targetWaypoint, camera, controlsRef]);

  useFrame(() => {
    if (transitionRef.current.active && controlsRef.current) {
      const transition = transitionRef.current;
      const controls = controlsRef.current;
      const elapsed = (Date.now() - transition.startTime) / 1000;
      const progress = Math.min(elapsed / transition.duration, 1);

      // Smoother cubic ease-in-out
      const t =
        progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      // Interpolate position
      camera.position.lerpVectors(
        transition.start.position,
        transition.target.position,
        t
      );

      // Interpolate target
      controls.target.lerpVectors(
        transition.start.target,
        transition.target.target,
        t
      );

      // Subtle shake effect (only during transition)
      const shakeStrength = 0.03 * (1 - progress); // fade out
      if (shakeStrength > 0.001) {
        camera.position.x += (Math.random() - 0.5) * shakeStrength;
        camera.position.y += (Math.random() - 0.5) * shakeStrength;
        camera.position.z += (Math.random() - 0.5) * shakeStrength;
      }

      controls.update();

      if (progress >= 1) {
        transition.active = false;
        onTransitionEnd?.();
        console.log("✅ Transition completed");
      }
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

  // Navigate to waypoint with smooth transition
  const goToWaypoint = (index) => {
    if (transitioning) return; // Prevent multiple transitions

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
    <div className="fixed inset-0 w-screen h-screen bg-gradient-to-b from-blue-400 to-blue-600">
      {/* Waypoint Navigation UI */}
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
          position: [-3.55, 0.2, 19.37], // Direct array instead of reference
          fov: 85, // Better FOV for wide-angle feel
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

          {/* Remove Bounds - it's making model too small */}
          <HouseScene />

          <Environment preset="park" background />
        </Suspense>

        <OrbitControls
          ref={controlsRef}
          makeDefault
          enablePan
          enableRotate
          enableZoom
          minDistance={1} // Closer minimum
          maxDistance={50} // Prevent going too far
          maxPolarAngle={Math.PI * 0.9} // Prevent going under ground
          enableDamping={true} // Smooth controls
          dampingFactor={0.05} // Smooth damping
        />
      </Canvas>
    </div>
  );
}

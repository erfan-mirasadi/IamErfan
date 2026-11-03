"use client";

import { Suspense, use, useCallback, useState, useMemo, useRef } from "react";
import Image from "next/image";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, ScrollControls, useScroll } from "@react-three/drei";
import * as THREE from "three";
import { setConsoleFunction } from "three";
import HouseScene from "./scene/HouseScene";
import TerraceLife from "./scene/TerraceLife";
import DayNightController from "./daylight/DayNightController";
import DayNightToggle from "./overlays/DayNightToggle";
import { getProject, val } from "@theatre/core";
import { SheetProvider, PerspectiveCamera } from "@theatre/r3f";
import animationState from "../../lib/Portfolio.theatre-project-state.json";
import RoadmapSidebar from "./overlays/RoadmapSidebar";
import { steps } from "./overlays/step";
import Loader from "./Loader";
import IntroScrollWrapper from "./overlays/IntroScrollWrapper";
import Hint from "./overlays/Hint";
import ContactMe from "./overlays/ContactMe";
import DirtyWindowOverlay from "./overlays/DirtyWindowOverlay";
import SmoothKeyboardNavigation from "./SmoothKeyboardNavigation";
import CameraDragOrbit from "./CameraDragOrbit";
import CustomCursor from "./CustomCursor";
import SceneWarmup from "./loading/SceneWarmup";
import SceneErrorBoundary from "./loading/SceneErrorBoundary";
import {
  loadEnvironmentMap,
  preloadSceneAssets,
} from "./loading/sceneLoader";

// Uses the official Three.js setConsoleFunction API.
const suppressedWarnings = [
  "Clock",
  "PCFSoftShadowMap",
  // the loading warm-up just falls back to normal compiling without this extension
  "KHR_parallel_shader_compile",
];
setConsoleFunction((type, message, ...params) => {
  if (
    type === "warn" &&
    typeof message === "string" &&
    suppressedWarnings.some((w) => message.includes(w))
  )
    return;
  console[type](message, ...params);
});

// Start downloading the model, Draco decoder and environment map as soon as
// this module runs in the browser (before React even renders the Canvas)
preloadSceneAssets();

// Initialize Theatre.js project and sheet
const project = getProject("Portfolio", { state: animationState });
const sheet = project.sheet("Scene");

// Scroll feel: the camera glides to the scroll position in ~0.2s instead of jumping
// with every wheel notch, and never rushes through the house faster than ~3 screens/s
const SCROLL_DAMPING = 0.2;
const SCROLL_MAX_SPEED = 0.3;

// drives the module-level `sheet` (the same one SheetProvider hands to the camera)
function AnimatedScene({ onActiveStepUpdate }) {
  const scroll = useScroll();
  const currentActiveStepRef = useRef("intro");
  const lastPositionRef = useRef(-1);
  // self-hosted "sunset" HDR (null if it failed, the scene still works without it)
  const envMap = use(loadEnvironmentMap());

  useFrame(() => {
    if (!sheet) return;
    const sequenceLength = val(sheet.sequence.pointer.length);
    const position = scroll.offset * sequenceLength;
    // the scroll stands still most of the time: nothing to recompute then
    if (position === lastPositionRef.current) return;
    lastPositionRef.current = position;
    sheet.sequence.position = position;

    // Find active step
    let newActiveStep = "intro";
    for (let i = steps.length - 1; i >= 0; i--) {
      if (position >= steps[i].time) {
        newActiveStep = steps[i].id;
        break;
      }
    }

    if (newActiveStep !== currentActiveStepRef.current && onActiveStepUpdate) {
      onActiveStepUpdate(newActiveStep);
      currentActiveStepRef.current = newActiveStep;
    }
  });

  return (
    <>
      <PerspectiveCamera theatreKey="Camera" makeDefault />
      {envMap && <Environment map={envMap} background />}
    </>
  );
}

export default function PortfolioViewer({ assetBytes }) {
  const [activeStep, setActiveStep] = useState("intro");
  // sceneWarm: shaders compiled + textures uploaded -> start the render loop
  // sceneReady: first frames are drawn behind the loader -> loader can leave
  const [sceneWarm, setSceneWarm] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [loadError, setLoadError] = useState(null);

  const canvasProps = useMemo(
    () => ({
      shadows: { enabled: true, type: THREE.PCFShadowMap },
      dpr: [1, 1],
      gl: {
        antialias: false,
        preserveDrawingBuffer: false,
        powerPreference: "high-performance",
      },
    }),
    [],
  );

  const handleSceneWarm = useCallback(() => setSceneWarm(true), []);
  const handleSceneReady = useCallback(() => setSceneReady(true), []);

  return (
    <>
      <CustomCursor />

      {/* stays on top until the house is really on screen (no black gaps) */}
      <Loader ready={sceneReady} error={loadError} assetBytes={assetBytes} />

      {/* The Canvas is mounted once and never unmounted while assets load */}
      <div
        style={{
          width: "100%",
          height: "100vh",
          position: "relative",
        }}
      >
        <SceneErrorBoundary onError={setLoadError}>
          <Canvas
            {...canvasProps}
            // nothing is drawn while loading, rendering starts after the warm-up
            frameloop={sceneWarm ? "always" : "never"}
          >
            {/* <ContextLostHandler onContextLost={() => setSceneReady(false)} /> */}
            {/* lower resolution on slow devices: see PerformanceMonitor in HouseScene */}
            <ScrollControls
              pages={val(sheet.sequence.pointer.length) || 0}
              damping={SCROLL_DAMPING}
              maxSpeed={SCROLL_MAX_SPEED}
            >
              <SheetProvider sheet={sheet}>
                <Suspense fallback={null}>
                  <HouseScene activeStep={activeStep} />
                  {/* before SceneWarmup, so their shaders are compiled behind the loader */}
                  <DayNightController />
                  <TerraceLife />
                  <AnimatedScene onActiveStepUpdate={setActiveStep} />
                  <SmoothKeyboardNavigation />
                  <CameraDragOrbit />
                  <SceneWarmup
                    onWarm={handleSceneWarm}
                    onReady={handleSceneReady}
                  />
                </Suspense>
              </SheetProvider>
            </ScrollControls>
          </Canvas>
        </SceneErrorBoundary>

        {/* Dirty Window Overlay */}
        <Image
          src="/images/dirty-window-6.jpg"
          alt="dirty-window-6"
          fill
          style={{
            objectFit: "cover",
            objectPosition: "center",
            pointerEvents: "none",
            mixBlendMode: "multiply",
            opacity: 0.05,
            zIndex: 0,
            transform: "scale(1.1)",
          }}
          sizes="100vw"
        />
        <Image
          src="/images/dirty-window-3.jpg"
          alt="dirty-window-3"
          fill
          // opacity in CSS: it fades down at night (globals.css)
          className="dirty-glass-glow"
          style={{
            objectFit: "cover",
            objectPosition: "center",
            pointerEvents: "none",
            mixBlendMode: "screen",
            zIndex: 0,
          }}
          sizes="100vw"
        />

        {/* UI Overlays */}
        <DirtyWindowOverlay activeStep={activeStep} />
        <IntroScrollWrapper activeStep={activeStep} />
        <RoadmapSidebar activeStep={activeStep} />
        <Hint activeStep={activeStep} />
        <ContactMe activeStep={activeStep} />
        <DayNightToggle />
      </div>
    </>
  );
}

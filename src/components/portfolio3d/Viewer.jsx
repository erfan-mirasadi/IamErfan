"use client";

import { Suspense, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Environment,
  ScrollControls,
  useScroll,
  AdaptiveDpr,
  AdaptiveEvents,
  useProgress,
} from "@react-three/drei";
import * as THREE from "three";
import HouseScene from "./scene/HouseScene";
import { getProject, val } from "@theatre/core";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import {
  SheetProvider,
  PerspectiveCamera,
  useCurrentSheet,
} from "@theatre/r3f";
import animationState from "../../lib/Portfolio.theatre-project-state.json";
import RoadmapSidebar from "./overlays/RoadmapSidebar";
import { steps } from "./overlays/step";
import Loader from "./Loader";
import IntroScrollWrapper from "./overlays/IntroScrollWrapper";
import Hint from "./overlays/Hint";
import ContactMe from "./overlays/ContactMe";

// Initialize DRACO loader
const draco = new DRACOLoader();
draco.setDecoderPath("/draco/");

// Initialize Theatre.js project and sheet outside component to avoid recreating
const project = getProject("Portfolio", { state: animationState });
const sheet = project.sheet("Scene");

function AnimatedScene({ onActiveStepUpdate }) {
  const sheet = useCurrentSheet();
  const scroll = useScroll();
  let currentActiveStep = "intro";

  useFrame(() => {
    if (!sheet) return;
    const sequenceLength = val(sheet.sequence.pointer.length);
    const position = scroll.offset * sequenceLength;
    sheet.sequence.position = position;

    // Find active step
    let newActiveStep = "intro";
    for (let i = steps.length - 1; i >= 0; i--) {
      if (position >= steps[i].time) {
        newActiveStep = steps[i].id;
        break;
      }
    }

    if (newActiveStep !== currentActiveStep && onActiveStepUpdate) {
      onActiveStepUpdate(newActiveStep);
      currentActiveStep = newActiveStep;
    }
  });

  return (
    <>
      <PerspectiveCamera theatreKey="Camera" makeDefault />
      <Environment preset="sunset" background />
    </>
  );
}

export default function PortfolioViewer() {
  const [activeStep, setActiveStep] = useState("intro");
  const [sceneReady, setSceneReady] = useState(false);
  const { active } = useProgress();

  const isLoaded = !active;
  const isFullyReady = isLoaded && sceneReady;

  const canvasProps = useMemo(
    () => ({
      shadows: true,
      dpr: [1, 1],
      gl: {
        antialias: false,
        preserveDrawingBuffer: false,
        powerPreference: "high-performance",
        shadowMapEnabled: true,
        shadowMapType: THREE.PCFSoftShadowMap,
      },
    }),
    []
  );

  const handleSceneReady = () => setSceneReady(true);

  return (
    <>
      <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
      <Loader />

      {isLoaded && (
        <div
          style={{
            opacity: isFullyReady ? 1 : 0,
            animation: isFullyReady ? "fadeIn 2s ease-out" : "none",
            width: "100%",
            height: "100vh",
            transition: "opacity 0.3s ease-out",
          }}
        >
          <Canvas {...canvasProps}>
            <AdaptiveDpr pixelated />
            <AdaptiveEvents />
            <ScrollControls
              pages={val(sheet.sequence.pointer.length) || 0}
              damping={0}
            >
              <SheetProvider sheet={sheet}>
                <Suspense fallback={null}>
                  <HouseScene
                    activeStep={activeStep}
                    onReady={handleSceneReady}
                  />
                  <AnimatedScene onActiveStepUpdate={setActiveStep} />
                </Suspense>
              </SheetProvider>
            </ScrollControls>
          </Canvas>

          {/* UI Overlays */}
          <IntroScrollWrapper activeStep={activeStep} />
          <RoadmapSidebar activeStep={activeStep} />
          <Hint activeStep={activeStep} />
          <ContactMe activeStep={activeStep} />
        </div>
      )}
    </>
  );
}

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
  // Loader, // Import the official Loader from drei
} from "@react-three/drei";
import * as THREE from "three";
import HouseScene from "./scene/HouseScene"; // Your actual path
import { getProject, val } from "@theatre/core";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import {
  SheetProvider,
  PerspectiveCamera,
  useCurrentSheet,
} from "@theatre/r3f";

// You should import your actual components and data here
import animationState from "../../lib/Portfolio.theatre-project-state.json"; // Your actual path
import KeyframeOverlayManager from "./overlays/KeyframeOverlayManager"; // Your actual path
import RoadmapSidebar from "./overlays/RoadmapSidebar"; // Your actual path
import { steps } from "./overlays/step"; // Your actual path
import Loader from "./Loader";

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
  const { active } = useProgress();
  const isLoaded = !active;

  useMemo(() => {
    const draco = new DRACOLoader();
    draco.setDecoderPath("/draco/");
  }, []);

  const canvasProps = {
    shadows: true,
    dpr: [1, 1],
    gl: {
      antialias: false,
      preserveDrawingBuffer: false,
      powerPreference: "high-performance",
      shadowMapEnabled: true,
      shadowMapType: THREE.PCFSoftShadowMap,
    },
  };

  return (
    <>
      <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
      <Loader />
      {isLoaded && (
        <div
          style={{
            animation: "fadeIn 2s ease-out",
            width: "100%",
            height: "100vh",
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
                  <HouseScene />
                  <AnimatedScene onActiveStepUpdate={setActiveStep} />
                  <KeyframeOverlayManager />
                </Suspense>
              </SheetProvider>
            </ScrollControls>
          </Canvas>
          <RoadmapSidebar activeStep={activeStep} />
        </div>
      )}
    </>
  );
}

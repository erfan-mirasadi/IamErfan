"use client";

import { Suspense, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Environment,
  ScrollControls,
  useScroll,
  AdaptiveDpr,
  AdaptiveEvents,
} from "@react-three/drei";
import * as THREE from "three";
import HouseScene from "./scene/HouseScene";
import { getProject, val } from "@theatre/core";
import { useMemo } from "react";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
// import studio from "@theatre/studio";
// import extension from "@theatre/r3f/dist/extension";
import {
  SheetProvider,
  PerspectiveCamera,
  useCurrentSheet,
} from "@theatre/r3f";
import animationState from "../../lib/Portfolio.theatre-project-state.json";
import KeyframeOverlayManager from "./overlays/KeyframeOverlayManager";

// Initialize Theatre.js exactly like Codrops tutorial
// if (typeof window !== "undefined") {
//   studio.extend(extension);
//   studio.initialize();
// }

const project = getProject("Portfolio", { state: animationState });
const sheet = project.sheet("Scene");
sheet.sequence.position = 0;

function AnimatedScene() {
  const sheet = useCurrentSheet();
  const scroll = useScroll();

  useFrame(() => {
    const sequenceLength = val(sheet.sequence.pointer.length);
    sheet.sequence.position = scroll.offset * sequenceLength;
  });

  return (
    <>
      <PerspectiveCamera theatreKey="Camera" makeDefault />
      <Environment preset="sunset" background />
    </>
  );
}
export default function PortfolioViewer() {
  const [ready, setReady] = useState(false);
  // Configure DRACO decoder path once
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
      // toneMapping: THREE.ACESFilmicToneMapping,
      // toneMappingExposure: 0.9,
    },
  };
  if (!ready) {
    return (
      <Canvas {...canvasProps}>
        <AdaptiveDpr pixelated min={1} max={1} />
        <AdaptiveEvents />
        <Suspense fallback={null}>
          <HouseScene onModelLoaded={() => setReady(true)} />
        </Suspense>
      </Canvas>
    );
  }
  return (
    <Canvas {...canvasProps}>
      <AdaptiveDpr pixelated min={1} max={1} />
      <AdaptiveEvents />
      <ScrollControls pages={val(sheet.sequence.pointer.length)} damping={0}>
        <SheetProvider sheet={sheet}>
          <Suspense fallback={null}>
            <HouseScene />
            <AnimatedScene />
            <KeyframeOverlayManager />
          </Suspense>
        </SheetProvider>
      </ScrollControls>
    </Canvas>
  );
}

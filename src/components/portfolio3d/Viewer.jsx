"use client";

import { Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, ScrollControls, useScroll } from "@react-three/drei";
import HouseScene from "./scene/HouseScene";
import { getProject, val } from "@theatre/core";
import studio from "@theatre/studio";
import extension from "@theatre/r3f/dist/extension";
import {
  SheetProvider,
  PerspectiveCamera,
  useCurrentSheet,
} from "@theatre/r3f";

// Import your exported animation state
import animationState from "../../lib/Portfolio.theatre-project-state.json"; // Ensure this path is correct

// Initialize Theatre.js exactly like Codrops tutorial
if (typeof window !== "undefined") {
  studio.extend(extension);
  studio.initialize();
}

// Create project with your saved animation state
const project = getProject("Portfolio", { state: animationState });
const sheet = project.sheet("Scene");
// Ensure a safe initial playhead position (per Theatre.js expectations)
sheet.sequence.position = 0;

function Scene() {
  const sheet = useCurrentSheet();
  const scroll = useScroll();

  // This is the key part from Codrops tutorial - useFrame for scroll control
  useFrame(() => {
    // Get the length of our sequence
    const sequenceLength = val(sheet.sequence.pointer.length);
    // Update the position of the playhead in the sequence, as a fraction of its whole length
    const nextPosition = scroll.offset * sequenceLength;
    // Clamp to [0, sequenceLength] to avoid tiny negative/overflow due to smoothing
    sheet.sequence.position = Math.max(
      0,
      Math.min(nextPosition, sequenceLength)
    );
  });

  return (
    <>
      <PerspectiveCamera theatreKey="Camera" makeDefault />
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 15, 10]} intensity={1.2} castShadow />
      <HouseScene />
      <Environment preset="park" background />
    </>
  );
}

export default function PortfolioViewer() {
  return (
    <div className="fixed inset-0 w-screen h-screen">
      <Canvas gl={{ antialias: true, preserveDrawingBuffer: true }}>
        <ScrollControls pages={val(sheet.sequence.pointer.length)} damping={0}>
          <SheetProvider sheet={sheet}>
            <Suspense fallback={null}>
              <Scene />
            </Suspense>
          </SheetProvider>
        </ScrollControls>
      </Canvas>
    </div>
  );
}

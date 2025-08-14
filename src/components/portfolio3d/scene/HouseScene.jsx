"use client";

import { Suspense, useState } from "react";
import {
  Center,
  Html,
  useProgress,
  PerformanceMonitor,
} from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import HouseModel from "./model/HouseModel";
import DoorLockInteractable from "../interactables/DoorLockInteractable";
import PlanetsInteractable from "../interactables/PlanetsInteractable";
import BookInteractable from "../interactables/BookInteractable";
import BodyBuldingInteractable from "../interactables/BodyBuldingInteractable";
import BikeInteractable from "../interactables/BikeInteractable";

// Loader according to drei docs: Html overlay + useProgress
function CanvasLoader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center rounded-xl bg-black/60 text-white backdrop-blur-md p-3 w-44">
        <div className="text-sm opacity-80">Loading…</div>
        <div className="mt-2 w-36 h-2 rounded-full bg-white/20 overflow-hidden">
          <div
            className="h-full bg-cyan-400"
            style={{ width: `${Math.round(progress)}%` }}
          />
        </div>
        <div className="mt-2 text-xs opacity-70">{Math.round(progress)}%</div>
      </div>
    </Html>
  );
}

export default function HouseScene({ onModelLoaded }) {
  const [extraLightsOn, setExtraLightsOn] = useState(true);
  return (
    <Center>
      <PerformanceMonitor
        onDecline={() => setExtraLightsOn(false)}
        onIncline={() => setExtraLightsOn(true)}
      />
      {/* Sunset key light */}
      <directionalLight
        castShadow
        color={"#ffb38a"}
        intensity={2}
        position={[-1.35, 8, 7]}
        rotation={(0, -0.4399999999999996, 0)}
        shadow-bias={-0.0006}
        shadow-mapSize-width={468}
        shadow-mapSize-height={468}
      />
      {/* Fill light */}
      <ambientLight color={"#ffd9c2"} intensity={1} />
      {/* Studio-like helper light (placeholder) */}
      <pointLight
        color={"#ffd166"}
        intensity={0.3}
        distance={2.5}
        decay={10}
        position={[-0.2, 1.8, -11.5]}
        castShadow={false}
        visible={extraLightsOn}
      />
      <pointLight
        color={"#fffff"}
        intensity={1}
        decay={4}
        position={[-3.1, -0.1, 7]}
        castShadow={false}
        visible={extraLightsOn}
      />
      <pointLight
        color={"#fffff"}
        intensity={2}
        decay={1.5}
        position={[-3.1, -0.5, -3.1]}
        castShadow={false}
        visible={extraLightsOn}
      />
      <Suspense fallback={<CanvasLoader />}>
        <HouseModel onModelLoaded={onModelLoaded} />
        {/* Interactables (self-contained) */}
        <DoorLockInteractable />
        <PlanetsInteractable />
        <BookInteractable />
        <BodyBuldingInteractable />
        <BikeInteractable />
        {/* Lightweight bloom for bright emissive parts only */}
        <EffectComposer
          multisampling={0}
          disableNormalPass
          enabled={extraLightsOn}
          resolutionScale={0.75}
        >
          <Bloom
            intensity={0.1}
            mipmapBlur
            luminanceThreshold={1}
            luminanceSmoothing={0.5}
          />
        </EffectComposer>
      </Suspense>
    </Center>
  );
}

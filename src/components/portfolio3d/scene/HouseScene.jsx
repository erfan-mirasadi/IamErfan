"use client";

import { Suspense, useState } from "react";
import * as THREE from "three";
import {
  Center,
  Html,
  useProgress,
  PerformanceMonitor,
} from "@react-three/drei";

import {
  EffectComposer,
  Bloom,
  Noise,
  Vignette,
} from "@react-three/postprocessing";

import HouseModel from "./model/HouseModel";
import DoorLockInteractable from "../interactables/DoorLockInteractable";
import PlanetsInteractable from "../interactables/PlanetsInteractable";
import BookInteractable from "../interactables/BookInteractable";
import BodyBuldingInteractable from "../interactables/BodyBuldingInteractable";
import BikeInteractable from "../interactables/BikeInteractable";
import SetarInteractable from "../interactables/SetarInteractable";
import ProjectInteractable from "../interactables/ProjectInteraxtable";

// Loader
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
        color={"#f2c183"}
        intensity={6}
        position={[-2, 5, 6.5]}
        shadow-bias={-0.01}
        shadow-mapSize-width={1250}
        shadow-mapSize-height={1250}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-camera-near={0.1}
        shadow-camera-far={30}
      />

      {/* Sun sample out of the window */}
      <mesh name="sun" position={[-3.8, 2, 14]} rotation={[0, 3.1, 0]}>
        <sphereGeometry args={[2, 32, 32]} />
        <meshStandardMaterial
          color="#fcfaea"
          emissive="#fcfaea"
          emissiveIntensity={30}
          toneMapped={false}
        />
      </mesh>

      {/* Fake volumetric cone */}
      <mesh position={[-3.9, 1.5, 11.9]} rotation={[0, 0, 0]}>
        <coneGeometry args={[3, 4.7, 15, 1, true]} />
        <meshBasicMaterial
          transparent
          opacity={0.09}
          depthWrite={false}
          // side={THREE.DoubleSide}
          color="#f2c183"
        />
      </mesh>

      <rectAreaLight
        width={5.8}
        height={5.8}
        color={"#f2c183"}
        intensity={6}
        position={[-3.8, 1.9, 12]}
        castShadow={false}
      />

      {/* Fill light */}
      <ambientLight color={"#e8b880"} intensity={3} />

      {/* Plant light */}
      <pointLight
        color={"#f3e914"}
        intensity={0.25}
        distance={2.5}
        decay={10}
        position={[-0.2, 1.8, -11.5]}
        castShadow={false}
        visible={extraLightsOn}
      />

      <Suspense fallback={<CanvasLoader />}>
        <HouseModel onModelLoaded={onModelLoaded} />
        <DoorLockInteractable />
        <PlanetsInteractable />
        <BookInteractable />
        <BodyBuldingInteractable />
        <BikeInteractable />
        <SetarInteractable />
        <ProjectInteractable
          targetName="Project_1"
          markerPosition={{ x: 1, y: 0, z: 2 }}
        />
        <ProjectInteractable
          targetName="Project_2"
          markerPosition={{ x: -1, y: 0, z: 3 }}
        />
        <ProjectInteractable
          targetName="Project_3"
          markerPosition={{ x: 2, y: 1, z: -1 }}
        />
        <ProjectInteractable
          targetName="Project_4"
          markerPosition={{ x: -2, y: 0.5, z: 1 }}
        />

        {/* Simple effects */}
        <EffectComposer
          multisampling={0}
          disableNormalPass
          enabled={extraLightsOn}
        >
          <Bloom intensity={0.1} />
          <Noise opacity={0.04} />
          <Vignette eskil={false} offset={0.1} darkness={0.9} />
        </EffectComposer>
      </Suspense>
    </Center>
  );
}

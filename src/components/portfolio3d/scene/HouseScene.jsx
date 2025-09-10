"use client";

import { Suspense, useState } from "react";
import { Center, PerformanceMonitor } from "@react-three/drei";
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
import ProjectInteractable from "../interactables/ProjectInteractable";

export default function HouseScene({ activeStep = "intro", onReady }) {
  const [extraLightsOn, setExtraLightsOn] = useState(true);
  const [modelLoaded, setModelLoaded] = useState(false);

  // trigger ready when model is loaded
  const handleModelLoad = () => {
    setModelLoaded(true);
    if (onReady) {
      // small delay to ensure everything is rendered
      setTimeout(() => onReady(), 100);
    }
  };

  return (
    <Center>
      <PerformanceMonitor
        onDecline={() => setExtraLightsOn(false)}
        onIncline={() => setExtraLightsOn(true)}
      />

      {/* lighting and static meshes */}
      <directionalLight
        castShadow
        color={"#f2c183"}
        intensity={6}
        position={[-2, 5, 6.5]}
        shadow-bias={-0.01}
        shadow-mapSize={[1250, 1250]}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-camera-near={0.1}
        shadow-camera-far={25}
      />
      <mesh name="sun" position={[-3.8, 2, 14]}>
        <sphereGeometry args={[2, 32, 32]} />
        <meshStandardMaterial
          color="#fcfaea"
          emissive="#fcfaea"
          emissiveIntensity={30}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[-3.9, 1.5, 11.9]}>
        <coneGeometry args={[3, 4.7, 15, 1, true]} />
        <meshBasicMaterial
          transparent
          opacity={0.09}
          depthWrite={false}
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
      <ambientLight color={"#e8b880"} intensity={3} />
      <pointLight
        color={"#f3e914"}
        intensity={0.25}
        distance={2.5}
        decay={10}
        position={[-0.2, 1.8, -11.5]}
        castShadow={false}
        visible={extraLightsOn}
      />

      {/* main scene content */}
      <Suspense fallback={null}>
        <HouseModel onLoad={handleModelLoad} />
        <DoorLockInteractable activeStep={activeStep} />
        <PlanetsInteractable activeStep={activeStep} />
        <BookInteractable activeStep={activeStep} />
        <BodyBuldingInteractable activeStep={activeStep} />
        <BikeInteractable activeStep={activeStep} />
        <SetarInteractable activeStep={activeStep} />
        <ProjectInteractable targetName="Project_1" activeStep={activeStep} />
        <ProjectInteractable targetName="Project_2" activeStep={activeStep} />
        <ProjectInteractable targetName="Project_3" activeStep={activeStep} />
        <ProjectInteractable targetName="Project_4" activeStep={activeStep} />

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

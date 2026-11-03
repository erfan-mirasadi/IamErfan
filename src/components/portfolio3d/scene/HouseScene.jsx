"use client";

import { Suspense, use, useCallback, useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
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
import { loadHouseModel } from "../loading/sceneLoader";
import { daylight } from "../daylight/daylight";
import { NIGHT, blendInto, captureDay, mix } from "../daylight/lighting";

// When a device can't keep up it renders a little fewer pixels instead. Turning lights
// or post-processing off (as before) changed the look and made every material compile
// its shaders again right when the device was already struggling (a long freeze).
const REDUCED_DPR = 0.75;

export default function HouseScene({ activeStep = "intro" }) {
  // Wait for the model BEFORE mounting <Center>: it measures its bounds only once,
  // and the Theatre camera keyframes were made with the house inside those bounds.
  use(loadHouseModel());
  const setDpr = useThree((state) => state.setDpr);

  // the composer only resizes its buffers when the canvas size changes: without this
  // a lower DPR shrank just the final copy, the scene itself still rendered full size
  const composerRef = useRef(null);
  const dpr = useThree((state) => state.viewport.dpr);
  const size = useThree((state) => state.size);
  useEffect(() => {
    composerRef.current?.setSize(size.width, size.height);
  }, [dpr, size]);

  // day <-> night for the house lights and post effects: colors and intensities only
  // (uniforms), never adding or hiding a light, so nothing has to recompile
  const sunRef = useRef(null);
  const sunDiscRef = useRef(null);
  const shaftRef = useRef(null);
  const windowRef = useRef(null);
  const fillRef = useRef(null);
  const lampRef = useRef(null);
  const bloomRef = useRef(null);
  const vignetteRef = useRef(null);
  const dayRef = useRef(null);
  const appliedRef = useRef(-1);
  // callback refs: the effect wrappers JSON.stringify their props (a ref object would
  // end up holding the effect itself, which can't be stringified)
  const setBloom = useCallback((effect) => {
    bloomRef.current = effect;
  }, []);
  const setVignette = useCallback((effect) => {
    vignetteRef.current = effect;
  }, []);

  useFrame(() => {
    const night = daylight.night;
    if (night === appliedRef.current) return;
    const sun = sunRef.current;
    const disc = sunDiscRef.current;
    const shaft = shaftRef.current;
    const windowLight = windowRef.current;
    const fill = fillRef.current;
    const lamp = lampRef.current;
    const bloom = bloomRef.current;
    const vignette = vignetteRef.current;
    if (!sun || !disc || !shaft || !windowLight || !fill || !lamp || !bloom || !vignette) return;

    // the day look is whatever is declared below, read once before the first change
    if (!dayRef.current) {
      dayRef.current = {
        sun: captureDay(sun.color, sun.intensity),
        window: captureDay(windowLight.color, windowLight.intensity),
        fill: captureDay(fill.color, fill.intensity),
        lamp: captureDay(lamp.color, lamp.intensity),
        shaft: captureDay(shaft.material.color, shaft.material.opacity),
        sunGlow: disc.material.emissiveIntensity,
        bloom: bloom.intensity,
        vignette: vignette.darkness,
      };
    }
    const day = dayRef.current;
    appliedRef.current = night;

    sun.intensity = blendInto(sun.color, day.sun, NIGHT.sun, night);
    windowLight.intensity = blendInto(windowLight.color, day.window, NIGHT.window, night);
    fill.intensity = blendInto(fill.color, day.fill, NIGHT.fill, night);
    lamp.intensity = blendInto(lamp.color, day.lamp, NIGHT.lamp, night);
    shaft.material.opacity = blendInto(shaft.material.color, day.shaft, NIGHT.shaft, night);
    disc.material.emissiveIntensity = mix(day.sunGlow, NIGHT.sunGlow, night);
    disc.visible = night < 0.999;
    bloom.intensity = mix(day.bloom, NIGHT.bloom, night);
    vignette.darkness = mix(day.vignette, NIGHT.vignette, night);
  });

  return (
    <Center>
      <PerformanceMonitor
        flipflops={3}
        onDecline={() => setDpr(REDUCED_DPR)}
        onIncline={() => setDpr(1)}
        onFallback={() => setDpr(REDUCED_DPR)}
      />

      {/* lighting and static meshes */}
      <directionalLight
        ref={sunRef}
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
      <mesh ref={sunDiscRef} name="sun" position={[-3.8, 2, 14]}>
        <sphereGeometry args={[2, 32, 32]} />
        <meshStandardMaterial
          color="#fcfaea"
          emissive="#fcfaea"
          emissiveIntensity={30}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={shaftRef} position={[-3.9, 1.5, 11.9]}>
        <coneGeometry args={[3, 4.7, 15, 1, true]} />
        <meshBasicMaterial
          transparent
          opacity={0.09}
          depthWrite={false}
          color="#f2c183"
        />
      </mesh>
      <rectAreaLight
        ref={windowRef}
        width={5.8}
        height={5.8}
        color={"#f2c183"}
        intensity={6}
        position={[-3.8, 1.9, 12]}
        castShadow={false}
      />
      <ambientLight ref={fillRef} color={"#e8b880"} intensity={3} />
      <pointLight
        ref={lampRef}
        color={"#f3e914"}
        intensity={0.25}
        distance={2.5}
        decay={10}
        position={[-0.2, 1.8, -11.5]}
        castShadow={false}
      />

      {/* main scene content */}
      <Suspense fallback={null}>
        <HouseModel />
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

        <EffectComposer ref={composerRef} multisampling={0} disableNormalPass>
          <Bloom ref={setBloom} intensity={0.1} />
          <Noise opacity={0.04} />
          <Vignette ref={setVignette} eskil={false} offset={0.1} darkness={0.9} />
        </EffectComposer>
      </Suspense>
    </Center>
  );
}

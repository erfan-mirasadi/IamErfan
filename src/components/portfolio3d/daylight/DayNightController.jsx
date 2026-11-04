"use client";

import { useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { createDaylightRig } from "./createDaylightRig";

// The night sky + the scene-wide part of day/night (see createDaylightRig).
// Mounted next to <Center> (world space), before SceneWarmup so it is compiled early.
export default function DayNightController() {
  const rig = useMemo(() => createDaylightRig(), []);

  useEffect(() => () => rig.dispose(), [rig]);

  useFrame((state, delta) => rig.update(state, delta));

  return <primitive object={rig.object} />;
}

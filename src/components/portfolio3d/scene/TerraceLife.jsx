"use client";

import { use, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { loadHouseModel } from "../loading/sceneLoader";
import { daylight } from "../daylight/daylight";
import { createTerrace } from "./outdoor/createTerrace";
import { createSeagulls } from "./outdoor/createSeagulls";

// Life on the empty right side of the intro view: potted palms (instanced copies of the
// kitchen palm) swaying in the wind, a low curb with a railing and string lights on the
// terrace edges (lit at night), plus a few gulls far over the sea by day.
// Mounted next to <Center> (world space) so it never changes the house's centering.
export default function TerraceLife() {
  const { scene: house } = use(loadHouseModel());
  const terrace = useMemo(() => createTerrace(house), [house]);
  const gulls = useMemo(() => createSeagulls(), []);

  useEffect(
    () => () => {
      terrace.dispose();
      gulls.dispose();
    },
    [terrace, gulls],
  );

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    terrace.update(state.camera, time, daylight.night);
    gulls.update(time, daylight.night);
  });

  return (
    <>
      <primitive object={terrace.object} />
      <primitive object={gulls.object} />
    </>
  );
}

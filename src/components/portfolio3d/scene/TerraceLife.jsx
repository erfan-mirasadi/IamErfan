"use client";

import { use, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { loadHouseModel } from "../loading/sceneLoader";
import { createTerrace } from "./outdoor/createTerrace";
import { createSeagulls } from "./outdoor/createSeagulls";

// Life on the empty right side of the intro view: potted palms (instanced copies of the
// kitchen palm) and a low curb with a railing on the terrace edges, plus a few gulls
// far over the sea. Mounted next to <Center> (world space) so it never changes the
// house's centering.
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
    terrace.update(state.camera);
    gulls.update(state.clock.elapsedTime);
  });

  return (
    <>
      <primitive object={terrace.object} />
      <primitive object={gulls.object} />
    </>
  );
}

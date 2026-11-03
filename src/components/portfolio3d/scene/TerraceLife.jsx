"use client";

import { use, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { loadHouseModel } from "../loading/sceneLoader";
import { createPierPlants } from "./outdoor/createPierPlants";
import { createSeagulls } from "./outdoor/createSeagulls";

// Life on the empty right side of the intro view: potted palms on the terrace edge
// (instanced copies of the kitchen palm) and a few gulls far over the sea.
// Mounted next to <Center> (world space) so it never changes the house's centering.
export default function TerraceLife() {
  const { scene: house } = use(loadHouseModel());
  const plants = useMemo(() => createPierPlants(house), [house]);
  const gulls = useMemo(() => createSeagulls(), []);

  useEffect(
    () => () => {
      plants?.dispose();
      gulls.dispose();
    },
    [plants, gulls],
  );

  useFrame((state) => {
    plants?.update(state.camera);
    gulls.update(state.clock.elapsedTime);
  });

  return (
    <>
      {plants && <primitive object={plants.object} />}
      <primitive object={gulls.object} />
    </>
  );
}

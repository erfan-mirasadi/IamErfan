"use client";

import { Suspense } from "react";
import { Center } from "@react-three/drei";
import HouseModel from "./model/HouseModel";

// Loading fallback component
function LoadingBox() {
  return (
    <mesh>
      <boxGeometry args={[2, 1, 2]} />
      <meshStandardMaterial color="#444" wireframe />
    </mesh>
  );
}

export default function HouseScene() {
  return (
    <Center>
      <Suspense fallback={<LoadingBox />}>
        <HouseModel />
      </Suspense>
    </Center>
  );
}

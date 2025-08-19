"use client";

import { useGLTF } from "@react-three/drei";
import { useLayoutEffect, useRef } from "react";

// Preload Draco-compressed model
useGLTF.preload("/models/main-draco.glb", "/draco/");

export default function HouseModel(props) {
  const { scene } = useGLTF("/models/main-draco.glb", "/draco/");
  const loadedRef = useRef(false);

  useLayoutEffect(() => {
    if (!scene || loadedRef.current) return;
    loadedRef.current = true;
    scene.traverse((object) => {
      if (object.isMesh) {
        object.castShadow = true;
        object.receiveShadow = true;
      }
    });
    console.log("[Model] ✅ main.glb loaded & optimized");
  }, [scene]);

  return <primitive object={scene} {...props} />;
}

"use client";

import { useGLTF } from "@react-three/drei";
import { useLayoutEffect, useRef } from "react";

// preload the 3D model
useGLTF.preload("/models/main-draco.glb", "/draco/");

export default function HouseModel({ onLoad, ...props }) {
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
    // trigger ready callback when model is fully processed
    if (onLoad) {
      onLoad();
    }
    // console.log("[Model] ✅ main.glb loaded & optimized");
  }, [scene, onLoad]);

  return <primitive object={scene} {...props} />;
}

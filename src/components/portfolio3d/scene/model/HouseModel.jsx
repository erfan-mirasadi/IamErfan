"use client";

import { useGLTF } from "@react-three/drei";
import { useMemo } from "react";

export default function HouseModel(props) {
  const { scene } = useGLTF("/models/main.glb");

  // Optimize meshes on load
  useMemo(() => {
    if (scene) {
      scene.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          // Better performance for complex models
          child.frustumCulled = false;
        }
      });
      console.log("✅ House model optimized");
    }
  }, [scene]);

  if (!scene) return null;

  return <primitive object={scene} {...props} />;
}

// Preload for better performance
useGLTF.preload("/models/main.glb");

useGLTF.preload("/models/main.glb");

"use client";

import { useGLTF } from "@react-three/drei";
import { useLayoutEffect, useRef } from "react";

// Preload Draco-compressed model FIRST (with local decoder path)
useGLTF.preload("/models/main-draco.glb", "/draco/");

export default function HouseModel({ onModelLoaded, ...props }) {
  const { scene, nodes, materials } = useGLTF(
    "/models/main-draco.glb",
    "/draco/"
  );
  const groupRef = useRef();
  const loadedRef = useRef(false);

  useLayoutEffect(() => {
    if (!scene || loadedRef.current) return;

    loadedRef.current = true;

    // Enable shadows on all meshes in the GLTF scene
    scene.traverse((object) => {
      const isRenderableMesh = object.isMesh || object.isSkinnedMesh;
      if (isRenderableMesh) {
        object.castShadow = true;
        object.receiveShadow = true;
      }
    });

    console.log("[Model] ✅ main.glb loaded & optimized");
    console.log(`📊 Nodes: ${Object.keys(nodes || {}).length}`);
    console.log(`📊 Materials: ${Object.keys(materials || {}).length}`);

    if (onModelLoaded) {
      onModelLoaded();
    }
  }, [scene]); // فقط scene تو dependency

  return (
    <group ref={groupRef} {...props}>
      <primitive object={scene} />
    </group>
  );
}

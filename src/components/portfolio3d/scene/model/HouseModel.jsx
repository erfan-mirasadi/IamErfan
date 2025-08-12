"use client";

import { useGLTF } from "@react-three/drei";
import { useLayoutEffect, useRef } from "react";

export default function HouseModel(props) {
  const { scene, nodes, materials } = useGLTF("/models/main.glb");
  const groupRef = useRef();

  // بهینه‌سازی مدل بعد از لود - useLayoutEffect برای جلوگیری از flash
  useLayoutEffect(() => {
    if (!scene) return;

    // بهینه‌سازی shadows و culling
    scene.traverse((child) => {
      if (child.isMesh) {
        // فعال کردن shadows
        child.castShadow = true;
        child.receiveShadow = true;

        // بهینه‌سازی rendering
        child.frustumCulled = true; // برعکس کد قبلی - این باید true باشه

        // بهینه‌سازی materials
        if (child.material) {
          child.material.needsUpdate = false;
        }
      }
    });

    // Log موفقیت
    console.log("✅ Heavy house model loaded and optimized");
    console.log(`📊 Nodes: ${Object.keys(nodes || {}).length}`);
    console.log(`📊 Materials: ${Object.keys(materials || {}).length}`);

    // Cleanup function
    return () => {
      // پاکسازی memory در صورت unmount
      scene.traverse((child) => {
        if (child.isMesh) {
          child.geometry?.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((material) => material.dispose());
          } else {
            child.material?.dispose();
          }
        }
      });
    };
  }, [scene, nodes, materials]);

  return (
    <group ref={groupRef} {...props}>
      <primitive object={scene} />
    </group>
  );
}

// Optional: enable if you want to prefetch the model ahead of time
// useGLTF.preload("/models/main.glb");

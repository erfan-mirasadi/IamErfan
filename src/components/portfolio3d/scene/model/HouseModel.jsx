"use client";

import { use, useLayoutEffect, useRef } from "react";
import { loadHouseModel } from "../../loading/sceneLoader";

// the model is preloaded (with download progress) in loading/sceneLoader.js
export default function HouseModel({ onLoad, ...props }) {
  const { scene } = use(loadHouseModel());
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

"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function Marker({
  markerSize = 0.1,
  markerColor = "#39e7e8",
  segments = 28,
  isActive = true,
}) {
  const outerRingRef = useRef();
  const innerRingRef = useRef();
  const outerMaterialRef = useRef();
  const innerMaterialRef = useRef();

  // Throttle refs for performance
  const lastCheckTime = useRef(0);

  // Optimized animation frame - only run when active
  useFrame((state) => {
    if (!isActive) return;

    const rings = [outerRingRef.current, innerRingRef.current];
    if (rings.some((ring) => !ring)) return;

    const t = state.clock.elapsedTime;

    // Animation without group scaling (parent handles positioning)
    outerRingRef.current.rotation.z = t * 0.6;
    const outerPulse = 1 + Math.sin(t * 3.2) * 0.15;
    outerRingRef.current.scale.setScalar(outerPulse);

    innerRingRef.current.rotation.x = t * 1.2;
    const innerScale = 0.8 + Math.sin(t * 2.5) * 0.2;
    innerRingRef.current.scale.set(innerScale, innerScale, innerScale);

    // Update materials less frequently for better performance
    const now = performance.now();
    if (now - lastCheckTime.current > 16) {
      // ~60fps throttle
      if (outerMaterialRef.current) {
        outerMaterialRef.current.opacity = 0.6 + 0.3 * Math.sin(t * 2.3);
        outerMaterialRef.current.size = 0.003 * (1 + 0.4 * Math.sin(t * 2.8));
      }
      if (innerMaterialRef.current) {
        innerMaterialRef.current.opacity =
          0.75 + 0.25 * Math.sin(t * 3.5 + Math.PI / 2);
        innerMaterialRef.current.size = 0.002 * (1 + 0.3 * Math.sin(t * 4.2));
      }
      lastCheckTime.current = now;
    }
  });

  // Memoized geometry - only recreate when segments change
  const ringGeometry = useMemo(() => {
    const positions = new Float32Array(segments * 3);
    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      positions[i * 3] = Math.cos(angle);
      positions[i * 3 + 1] = Math.sin(angle);
      positions[i * 3 + 2] = 0;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [segments]);

  // Memoized materials - only recreate when color changes
  const materials = useMemo(() => {
    const baseColor = new THREE.Color(markerColor);

    const outerMaterial = new THREE.PointsMaterial({
      color: baseColor.clone().multiplyScalar(1.4),
      size: 0.008,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
      depthTest: true,
      toneMapped: false,
      blending: THREE.AdditiveBlending,
    });

    const innerMaterial = new THREE.PointsMaterial({
      color: baseColor.clone().multiplyScalar(1.8),
      size: 0.006,
      sizeAttenuation: true,
      transparent: true,
      opacity: 1.0,
      depthWrite: false,
      depthTest: true,
      toneMapped: false,
      blending: THREE.AdditiveBlending,
    });

    return { outerMaterial, innerMaterial };
  }, [markerColor]);

  // Expose refs for parent component
  const getGroupRef = () => ringGroupRef;

  return (
    <>
      <points ref={outerRingRef} geometry={ringGeometry}>
        <primitive
          object={materials.outerMaterial}
          ref={outerMaterialRef}
          attach="material"
        />
      </points>
      <points ref={innerRingRef} geometry={ringGeometry}>
        <primitive
          object={materials.innerMaterial}
          ref={innerMaterialRef}
          attach="material"
        />
      </points>
    </>
  );
}

// Export a hook for parent to access the group ref
export function useMarkerRef() {
  const markerRef = useRef();
  return markerRef;
}

"use client";

import { useMemo } from "react";
import * as THREE from "three";

export default function HintHalo({ color = "#22d3ee" }) {
  const ring = useMemo(() => new THREE.RingGeometry(0.18, 0.24, 32), []);
  return (
    <group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.18, 0]}
        geometry={ring}
      >
        <meshBasicMaterial color={color} transparent opacity={0.7} />
      </mesh>
      <mesh position={[0, 0.3, 0]}>
        <coneGeometry args={[0.06, 0.14, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.8}
        />
      </mesh>
    </group>
  );
}

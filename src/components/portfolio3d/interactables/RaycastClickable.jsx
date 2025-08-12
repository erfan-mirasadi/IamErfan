"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

export default function RaycastClickable({ targetName, onClick, children }) {
  const { camera, scene, gl } = useThree();
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const hintGroupRef = useRef();
  const [targetObj, setTargetObj] = useState(null);
  const [visible, setVisible] = useState(false);

  const tempVec = useMemo(() => new THREE.Vector3(), []);

  // Find target by name (once available)
  useFrame(() => {
    if (!targetObj) {
      const obj = scene.getObjectByName(targetName);
      if (obj) {
        setTargetObj(obj);
        setVisible(true);
      }
    }
    if (targetObj && hintGroupRef.current) {
      targetObj.getWorldPosition(tempVec);
      hintGroupRef.current.position.copy(tempVec);
    }
  });

  // Basic three.js raycasting on canvas click
  useEffect(() => {
    const handleClick = (event) => {
      if (!targetObj) return;
      const rect = gl.domElement.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const hits = raycasterRef.current.intersectObject(targetObj, true);
      if (hits.length > 0) onClick?.(hits[0]);
    };
    gl.domElement.addEventListener("click", handleClick);
    return () => gl.domElement.removeEventListener("click", handleClick);
  }, [camera, gl, targetObj, onClick]);

  // Floating/bobbing animation for the hint
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (hintGroupRef.current) {
      const offset = Math.sin(t * 2) * 0.05;
      hintGroupRef.current.position.y += offset;
      hintGroupRef.current.rotation.y = t * 0.8;
    }
  });

  return (
    <group ref={hintGroupRef} visible={visible}>
      {children}
    </group>
  );
}

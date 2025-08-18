// RaycastClickable.js
"use client";

import { useEffect, useMemo, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function RaycastClickable({
  targetName,
  onClick,
  markerPosition = { x: 0, y: 0, z: 0 },
  markerSize = 0.1,
  markerColor = "#ffffff",
  segments = 26,
}) {
  const { camera, scene, gl } = useThree();
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const outerRingRef = useRef();
  const innerRingRef = useRef();
  const ringGroupRef = useRef();
  const outerMaterialRef = useRef();
  const innerMaterialRef = useRef();

  // انیمیشن جذاب برای دو حلقه
  useFrame((state) => {
    if (!outerRingRef.current || !innerRingRef.current || !ringGroupRef.current)
      return;
    const t = state.clock.elapsedTime;

    // انیمیشن کل گروه: تنفس نرم
    const groupScale = 1 + Math.sin(t * 1.8) * 0.12;
    ringGroupRef.current.scale.setScalar(markerSize * groupScale);

    // حلقه بیرونی: چرخش آرام + پالس
    outerRingRef.current.rotation.z = t * 0.6;
    const outerPulse = 1 + Math.sin(t * 3.2) * 0.15;
    outerRingRef.current.scale.setScalar(outerPulse);

    // حلقه داخلی: چرخش سریع‌تر معکوس + ویوز
    innerRingRef.current.rotation.z = -t * 1.5;
    const innerWave = 0.7 + Math.sin(t * 4.1 + Math.PI / 3) * 0.1;
    innerRingRef.current.scale.setScalar(innerWave);

    // چشمک زنی جذاب
    if (outerMaterialRef.current) {
      outerMaterialRef.current.opacity = 0.6 + 0.3 * Math.sin(t * 2.3);
      outerMaterialRef.current.size = 0.003 * (1 + 0.4 * Math.sin(t * 2.8));
    }
    if (innerMaterialRef.current) {
      innerMaterialRef.current.opacity =
        0.75 + 0.25 * Math.sin(t * 3.5 + Math.PI / 2);
      innerMaterialRef.current.size = 0.002 * (1 + 0.3 * Math.sin(t * 4.2));
    }
  });

  // هندسه حلقه (مشترک برای هر دو)
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

  // مواد برای حلقه بیرونی
  const outerMaterial = useMemo(() => {
    return new THREE.PointsMaterial({
      color: new THREE.Color(markerColor),
      size: 0.003,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }, [markerColor]);

  // مواد برای حلقه داخلی
  const innerMaterial = useMemo(() => {
    return new THREE.PointsMaterial({
      color: new THREE.Color(markerColor).multiplyScalar(1.2),
      size: 0.002,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }, [markerColor]);

  // onClick functionality - کد اصلی raycast
  // وصل کردن مارکر به target object
  useEffect(() => {
    const isInsideCanvas = (event) => {
      const rect = gl.domElement.getBoundingClientRect();
      return (
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom
      );
    };

    const updateMouseRay = (event) => {
      const rect = gl.domElement.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycasterRef.current.setFromCamera(mouseRef.current, camera);
    };

    const findHit = () => {
      const hitsAll = raycasterRef.current.intersectObjects(
        scene.children,
        true
      );
      const targetLc = (targetName || "").toLowerCase();
      for (const hit of hitsAll) {
        let obj = hit.object;
        while (obj) {
          const nameLc = (obj.name || "").toLowerCase();
          if (nameLc === targetLc || nameLc.includes(targetLc)) return hit;
          obj = obj.parent;
        }
      }
      const exactTarget = scene.getObjectByName(targetName);
      if (exactTarget) {
        const hits = raycasterRef.current.intersectObject(exactTarget, true);
        if (hits.length > 0) return hits[0];
      }
      return null;
    };

    const handlePointerDown = (event) => {
      if (!isInsideCanvas(event)) return;
      updateMouseRay(event);
      const hit = findHit();
      if (hit) onClick?.(hit);
    };

    window.addEventListener("pointerdown", handlePointerDown, {
      passive: true,
      capture: true,
    });
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, [camera, gl, scene, targetName, onClick]);
  useEffect(() => {
    const targetObject = scene.getObjectByName(targetName);
    if (targetObject && ringGroupRef.current && markerPosition) {
      targetObject.add(ringGroupRef.current);
      ringGroupRef.current.position.set(
        markerPosition.x,
        markerPosition.y,
        markerPosition.z
      );
      ringGroupRef.current.scale.setScalar(markerSize);
      ringGroupRef.current.visible = true;
    }
  }, [scene, targetName, markerPosition, markerSize]);

  return markerPosition ? (
    <group ref={ringGroupRef}>
      {/* حلقه بیرونی */}
      <points ref={outerRingRef} geometry={ringGeometry}>
        <primitive
          object={outerMaterial}
          ref={outerMaterialRef}
          attach="material"
        />
      </points>

      {/* حلقه داخلی */}
      <points ref={innerRingRef} geometry={ringGeometry}>
        <primitive
          object={innerMaterial}
          ref={innerMaterialRef}
          attach="material"
        />
      </points>
    </group>
  ) : null;
}

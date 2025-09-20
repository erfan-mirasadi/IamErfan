"use client";

import { useEffect, useRef, useCallback } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import Marker from "./Marker";

export default function RaycastClickable({
  targetName,
  onClick,
  onPointerEnter,
  onPointerLeave,
  markerPosition = { x: 0, y: 0, z: 0 },
  markerSize = 0.1,
  markerColor = "#39e7e8",
  segments = 28,
  isActive = true,
  activeStep = "intro",
}) {
  const { camera, scene, gl } = useThree();
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const isHoveringRef = useRef(false);
  const ringGroupRef = useRef();

  const targetObjectRef = useRef(null);

  const shouldBeActive = isActive;

  // group pulsing animation
  useFrame((state) => {
    if (!shouldBeActive || !ringGroupRef.current) return;

    const t = state.clock.elapsedTime;
    const groupScale = 1 + Math.sin(t * 1.8) * 0.12;
    ringGroupRef.current.scale.setScalar(markerSize * groupScale);
  });

  const isInsideCanvas = useCallback(
    (event) => {
      const rect = gl.domElement.getBoundingClientRect();
      return (
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom
      );
    },
    [gl]
  );

  const updateMouseRay = useCallback(
    (event) => {
      const rect = gl.domElement.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycasterRef.current.setFromCamera(mouseRef.current, camera);
    },
    [gl, camera]
  );

  // find target with caching
  const findHit = useCallback(() => {
    if (!targetName) return null;

    // use cached target first
    if (targetObjectRef.current) {
      const hits = raycasterRef.current.intersectObject(
        targetObjectRef.current,
        true
      );
      if (hits.length > 0) return hits[0];
    }

    // search scene if not cached
    const hitsAll = raycasterRef.current.intersectObjects(scene.children, true);
    const targetLc = targetName.toLowerCase();

    for (const hit of hitsAll) {
      let obj = hit.object;
      while (obj) {
        const nameLc = (obj.name || "").toLowerCase();
        if (nameLc === targetLc || nameLc.includes(targetLc)) {
          targetObjectRef.current = obj;
          return hit;
        }
        obj = obj.parent;
      }
    }

    return null;
  }, [targetName, scene]);

  // click handler
  useEffect(() => {
    if (!shouldBeActive) return;

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
  }, [shouldBeActive, isInsideCanvas, updateMouseRay, findHit, onClick]);

  // hover handler
  useEffect(() => {
    if (!shouldBeActive) {
      if (isHoveringRef.current) {
        isHoveringRef.current = false;
        onPointerLeave?.();
        document.body.style.cursor = "";
      }
      return;
    }

    let rafId = null;
    let lastMoveTime = 0;

    const handlePointerMove = (event) => {
      const now = performance.now();

      // throttle to 30fps
      if (now - lastMoveTime < 33) return;
      lastMoveTime = now;

      if (!isInsideCanvas(event)) {
        if (isHoveringRef.current) {
          isHoveringRef.current = false;
          onPointerLeave?.();
          document.body.style.cursor = "";
        }
        return;
      }

      // smooth hover detection
      if (rafId) cancelAnimationFrame(rafId);

      rafId = requestAnimationFrame(() => {
        updateMouseRay(event);
        const hit = findHit();

        if (hit && !isHoveringRef.current) {
          isHoveringRef.current = true;
          onPointerEnter?.(hit);
          document.body.style.cursor = "pointer";
        } else if (!hit && isHoveringRef.current) {
          isHoveringRef.current = false;
          onPointerLeave?.();
          document.body.style.cursor = "";
        }
      });
    };

    if (onPointerEnter || onPointerLeave) {
      window.addEventListener("pointermove", handlePointerMove, {
        passive: true,
        capture: true,
      });
    }

    return () => {
      if (onPointerEnter || onPointerLeave) {
        window.removeEventListener("pointermove", handlePointerMove);
      }
      if (rafId) cancelAnimationFrame(rafId);
      document.body.style.cursor = "";
    };
  }, [
    shouldBeActive,
    isInsideCanvas,
    updateMouseRay,
    findHit,
    onPointerEnter,
    onPointerLeave,
  ]);

  // marker positioning with caching
  useEffect(() => {
    if (!shouldBeActive || !targetName) {
      if (ringGroupRef.current) {
        ringGroupRef.current.visible = false;
      }
      targetObjectRef.current = null;
      return;
    }

    // try cached target first
    let targetObject = targetObjectRef.current;

    // search again if not cached
    if (!targetObject || targetObject.name !== targetName) {
      targetObject = scene.getObjectByName(targetName);
      targetObjectRef.current = targetObject;
    }

    if (targetObject && ringGroupRef.current && markerPosition) {
      targetObject.add(ringGroupRef.current);
      ringGroupRef.current.position.set(
        markerPosition.x,
        markerPosition.y,
        markerPosition.z
      );
      ringGroupRef.current.scale.setScalar(markerSize);
      ringGroupRef.current.visible = true;
    } else {
      // console.warn(
      //   `Target object "${targetName}" not found or invalid markerPosition`
      // );
      if (ringGroupRef.current) {
        ringGroupRef.current.visible = false;
      }
      targetObjectRef.current = null;
    }
  }, [shouldBeActive, scene, targetName, markerPosition, markerSize]);

  useEffect(() => {
    return () => {
      document.body.style.cursor = "";
    };
  }, []);

  if (!shouldBeActive || !targetName) return null;

  return (
    <group ref={ringGroupRef}>
      <Marker
        markerSize={markerSize}
        markerColor={markerColor}
        segments={segments}
        isActive={shouldBeActive}
      />
    </group>
  );
}

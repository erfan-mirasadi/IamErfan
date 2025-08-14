"use client";

import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

// Minimal: click anywhere on the named object triggers onClick. No visuals.
export default function RaycastClickable({ targetName, onClick }) {
  const { camera, scene, gl } = useThree();
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const hoveringRef = useRef(false);

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
          if (nameLc === targetLc || nameLc.includes(targetLc)) {
            return hit;
          }
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

    const handlePointerMove = (event) => {
      if (!isInsideCanvas(event)) {
        if (hoveringRef.current) {
          hoveringRef.current = false;
          document.body.style.cursor = "";
        }
        return;
      }
      updateMouseRay(event);
      const isHovering = !!findHit();
      if (hoveringRef.current !== isHovering) {
        hoveringRef.current = isHovering;
        // Use body cursor so it works even if an overlay captures pointer events
        document.body.style.cursor = isHovering ? "pointer" : "";
      }
    };

    // Attach to window to bypass overlays (e.g., ScrollControls)
    window.addEventListener("pointerdown", handlePointerDown, {
      passive: true,
      capture: true,
    });
    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
      capture: true,
    });
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      // Always reset cursor on cleanup to avoid sticky pointer
      document.body.style.cursor = "";
    };
  }, [camera, gl, scene, targetName, onClick]);

  return null;
}

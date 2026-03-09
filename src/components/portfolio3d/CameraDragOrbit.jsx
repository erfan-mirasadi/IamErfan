"use client";

import { useRef, useEffect, useCallback } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const _offsetQuat = new THREE.Quaternion();
const _pitchQuat = new THREE.Quaternion();
const _yawQuat = new THREE.Quaternion();
const _xAxis = new THREE.Vector3(1, 0, 0);
const _yAxis = new THREE.Vector3(0, 1, 0);

const DRAG_THRESHOLD = 4; // Minimum pixels to move before starting to rotate
const SENSITIVITY = 0.0004; // Mouse movement to radians
const RETURN_SPEED = 0.07; // How quickly the camera returns to the base position when not dragging
const MAX_PITCH = Math.PI / 0.5; // Limit vertical rotation to prevent flipping
const MAX_YAW = Math.PI / 0.5; // Limit horizontal rotation

export default function CameraDragOrbit() {
  const { camera, gl } = useThree();

  const isDragging = useRef(false);
  const hasMoved = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const lastX = useRef(0);
  const lastY = useRef(0);
  const offsetX = useRef(0);
  const offsetY = useRef(0);

  // Theatre.js base quaternion (the "real" keyframe rotation)
  const baseQuat = useRef(new THREE.Quaternion());
  // What we set camera.quaternion to last frame
  const lastAppliedQuat = useRef(new THREE.Quaternion());

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
    [gl],
  );

  useEffect(() => {
    const onPointerDown = (e) => {
      if (e.button !== 0 || e.pointerType === "touch") return;
      if (
        e.target.closest("button, a, input, textarea, select, [role='button']")
      )
        return;
      if (!isInsideCanvas(e)) return;

      isDragging.current = true;
      hasMoved.current = false;
      startX.current = e.clientX;
      startY.current = e.clientY;
      lastX.current = e.clientX;
      lastY.current = e.clientY;
    };

    const onPointerMove = (e) => {
      if (!isDragging.current || e.pointerType === "touch") return;

      if (!hasMoved.current) {
        const dx = e.clientX - startX.current;
        const dy = e.clientY - startY.current;
        if (Math.sqrt(dx * dx + dy * dy) < DRAG_THRESHOLD) return;
        hasMoved.current = true;
        document.body.style.cursor = "grabbing";
      }

      const dx = e.clientX - lastX.current;
      const dy = e.clientY - lastY.current;
      lastX.current = e.clientX;
      lastY.current = e.clientY;

      offsetY.current += dx * SENSITIVITY;
      offsetX.current += dy * SENSITIVITY;

      offsetX.current = Math.max(
        -MAX_PITCH,
        Math.min(MAX_PITCH, offsetX.current),
      );
      offsetY.current = Math.max(-MAX_YAW, Math.min(MAX_YAW, offsetY.current));
    };

    const onPointerUp = () => {
      isDragging.current = false;
      hasMoved.current = false;
      document.body.style.cursor = "";
    };

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp, { capture: true });
    window.addEventListener("pointercancel", onPointerUp, { capture: true });

    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp, { capture: true });
      window.removeEventListener("pointercancel", onPointerUp, {
        capture: true,
      });
      document.body.style.cursor = "";
    };
  }, [isInsideCanvas, camera]);

  // Runs AFTER Theatre.js updates camera
  useFrame(() => {
    const dot = Math.abs(camera.quaternion.dot(lastAppliedQuat.current));
    if (dot < 0.9999) {
      baseQuat.current.copy(camera.quaternion);
    }

    // Decay offset toward zero when not dragging
    if (!isDragging.current) {
      offsetX.current *= 1 - RETURN_SPEED;
      offsetY.current *= 1 - RETURN_SPEED;

      if (
        Math.abs(offsetX.current) < 0.0001 &&
        Math.abs(offsetY.current) < 0.0001
      ) {
        offsetX.current = 0;
        offsetY.current = 0;
      }
    }

    // When offset is zero, just track the base and skip
    if (offsetX.current === 0 && offsetY.current === 0) {
      baseQuat.current.copy(camera.quaternion);
      lastAppliedQuat.current.copy(camera.quaternion);
      return;
    }

    // Build offset quaternion from accumulated drag
    _yawQuat.setFromAxisAngle(_yAxis, -offsetY.current);
    _pitchQuat.setFromAxisAngle(_xAxis, -offsetX.current);
    _offsetQuat.copy(_yawQuat).multiply(_pitchQuat);
    // ALWAYS start from the Theatre.js base
    camera.quaternion.copy(baseQuat.current).multiply(_offsetQuat);
    // Remember for next frame's comparison
    lastAppliedQuat.current.copy(camera.quaternion);
  }, 1);

  return null;
}

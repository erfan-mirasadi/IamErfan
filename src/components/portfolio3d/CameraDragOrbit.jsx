"use client";

import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { cameraLook } from "./cameraLook";

const _offsetQuat = new THREE.Quaternion();
const _pitchQuat = new THREE.Quaternion();
const _yawQuat = new THREE.Quaternion();
const _rollQuat = new THREE.Quaternion();
const _deltaQuat = new THREE.Quaternion();
const _xAxis = new THREE.Vector3(1, 0, 0);
const _yAxis = new THREE.Vector3(0, 1, 0);
const _zAxis = new THREE.Vector3(0, 0, 1);

// Look around with the cursor (no drag): the view turns toward where the cursor is,
// same angle per pixel as the old drag, measured from the center of the screen
const SENSITIVITY = 0.0004; // Mouse movement to radians
const MAX_PITCH = Math.PI / 0.5; // Limit vertical rotation to prevent flipping
const MAX_YAW = Math.PI / 0.5; // Limit horizontal rotation
const LOOK_SMOOTHING = 0.3; // seconds, how softly the view follows the cursor

// Flight feel while scrolling (kept subtle on purpose)
const BANK_STRENGTH = 0.035; // roll (rad) per rad/s the camera path turns
const MAX_BANK = THREE.MathUtils.degToRad(2.5); // never tilt more than this
const SPEED_FOV = 3; // extra degrees of FOV when the camera flies fast
const FULL_SPEED = 12; // world units per second that count as "fast"
const MOTION_SMOOTHING = 0.3; // seconds

const clamp = THREE.MathUtils.clamp;
// frame-rate independent easing toward a target (snaps when close enough)
const damp = (current, target, smoothing, delta) => {
  const next = current + (target - current) * (1 - Math.exp(-delta / smoothing));
  return Math.abs(next - target) < 1e-5 ? target : next;
};

export default function CameraDragOrbit() {
  const { camera, gl } = useThree();

  const target = useRef({ yaw: 0, pitch: 0 }); // where the cursor asks to look
  const look = useRef({ yaw: 0, pitch: 0 }); // smoothed look offset
  const motion = useRef({ bank: 0, fovKick: 0, tracking: false });
  const reducedMotion = useRef(false);

  // Theatre.js base values (the "real" keyframes) and what we wrote last frame
  const baseQuat = useRef(new THREE.Quaternion());
  const lastAppliedQuat = useRef(new THREE.Quaternion());
  const prevBaseQuat = useRef(new THREE.Quaternion());
  const prevPosition = useRef(new THREE.Vector3());
  const baseFov = useRef(camera.fov);
  const lastAppliedFov = useRef(camera.fov);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotion.current = motionQuery.matches;
    const onMotionPreference = (e) => {
      reducedMotion.current = e.matches;
    };

    const recenter = () => {
      target.current.yaw = 0;
      target.current.pitch = 0;
    };

    const onPointerMove = (e) => {
      // touch screens scroll with the finger, there is no hover to follow
      if (e.pointerType === "touch") return;
      // keep the view still while a terminal modal is being read
      if (document.body.classList.contains("modal-open")) return;

      const rect = gl.domElement.getBoundingClientRect();
      const dx = e.clientX - (rect.left + rect.width / 2);
      const dy = e.clientY - (rect.top + rect.height / 2);
      target.current.yaw = clamp(dx * SENSITIVITY, -MAX_YAW, MAX_YAW);
      target.current.pitch = clamp(dy * SENSITIVITY, -MAX_PITCH, MAX_PITCH);
    };

    // cursor left the window -> glide back to the authored view
    const onPointerOut = (e) => {
      if (!e.relatedTarget) recenter();
    };

    motionQuery.addEventListener("change", onMotionPreference);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerout", onPointerOut);
    window.addEventListener("blur", recenter);

    return () => {
      motionQuery.removeEventListener("change", onMotionPreference);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerout", onPointerOut);
      window.removeEventListener("blur", recenter);
    };
  }, [gl]);

  // Runs AFTER Theatre.js updates camera (registered after AnimatedScene's useFrame).
  // Keep the default priority: any priority > 0 disables R3F's own render call.
  useFrame((state, delta) => {
    const camera = state.camera;
    const dt = Math.min(delta, 0.1);
    const calm = reducedMotion.current;

    // Theatre writes the camera on its own tick: anything different from what we wrote
    // last frame is a new keyframe value. Exact compare, so tiny steps of a smooth
    // scroll are never mistaken for our own offset and dropped.
    if (!camera.quaternion.equals(lastAppliedQuat.current)) {
      baseQuat.current.copy(camera.quaternion);
    }
    if (camera.fov !== lastAppliedFov.current) {
      baseFov.current = camera.fov;
    }

    // 1) cursor look-around
    look.current.yaw = damp(
      look.current.yaw,
      calm ? 0 : target.current.yaw,
      LOOK_SMOOTHING,
      dt,
    );
    look.current.pitch = damp(
      look.current.pitch,
      calm ? 0 : target.current.pitch,
      LOOK_SMOOTHING,
      dt,
    );

    // 2) flight feel from the scroll path: bank into its turns, widen a bit when fast
    let aimBank = 0;
    let aimFovKick = 0;
    if (motion.current.tracking && !calm && dt > 0) {
      // rotation since last frame, in the camera's own space -> turn rate around its up axis
      _deltaQuat.copy(prevBaseQuat.current).invert().multiply(baseQuat.current);
      const sign = _deltaQuat.w < 0 ? -1 : 1;
      const turnRate = (2 * sign * _deltaQuat.y) / dt;
      aimBank = clamp(turnRate * BANK_STRENGTH, -MAX_BANK, MAX_BANK);

      const speed = camera.position.distanceTo(prevPosition.current) / dt;
      aimFovKick = SPEED_FOV * Math.min(speed / FULL_SPEED, 1);
    }
    motion.current.tracking = true;
    prevBaseQuat.current.copy(baseQuat.current);
    prevPosition.current.copy(camera.position);
    motion.current.bank = damp(motion.current.bank, aimBank, MOTION_SMOOTHING, dt);
    motion.current.fovKick = damp(
      motion.current.fovKick,
      aimFovKick,
      MOTION_SMOOTHING,
      dt,
    );

    // 3) ALWAYS start from the Theatre.js base
    _yawQuat.setFromAxisAngle(_yAxis, -look.current.yaw);
    _pitchQuat.setFromAxisAngle(_xAxis, -look.current.pitch);
    _rollQuat.setFromAxisAngle(_zAxis, motion.current.bank);
    _offsetQuat.copy(_yawQuat).multiply(_pitchQuat).multiply(_rollQuat);
    camera.quaternion.copy(baseQuat.current).multiply(_offsetQuat);
    // Remember for next frame's comparison
    lastAppliedQuat.current.copy(camera.quaternion);
    // for the night sky: the view without the cursor offset
    cameraLook.base.copy(baseQuat.current);
    cameraLook.ready = true;

    const fov = baseFov.current + motion.current.fovKick;
    if (camera.fov !== fov) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
    lastAppliedFov.current = camera.fov;
  });

  return null;
}

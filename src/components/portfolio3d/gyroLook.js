import * as THREE from "three";
import { loadingProgress } from "./loading/sceneLoader";

// Phones and tablets: the gyroscope turns the view the way the cursor does on desktop.
// Turning the phone right looks right, tilting it up looks up, measured from the way
// it was held when the look started (the "rest" pose). The rest pose slowly follows
// the phone, so sensor drift or a new way of holding it never leaves the view off.
const GAIN = 0.6; // view turn per radian the phone turns
const MAX_YAW = 0.32; // rad, about how far the cursor reaches on a wide desktop screen
const MAX_PITCH = 0.18;
const REST_FOLLOW = 20; // seconds
const NEAR_VERTICAL = 1.3; // rad: pointing (almost) straight up or down, no heading

const DEG = THREE.MathUtils.DEG2RAD;
const _deviceEuler = new THREE.Euler();
const _lookEuler = new THREE.Euler(0, 0, 0, "YXZ");
const _deviceQuat = new THREE.Quaternion();
const _screenQuat = new THREE.Quaternion();
const _zAxis = new THREE.Vector3(0, 0, 1);
// the sensor frame looks out of the top of the phone: look out of its back instead
const _outOfTheBack = new THREE.Quaternion(-Math.SQRT1_2, 0, 0, Math.SQRT1_2);

const softClamp = (value, max) => max * Math.tanh(value / max);
const wrapAngle = (angle) => Math.atan2(Math.sin(angle), Math.cos(angle));
const screenAngle = () =>
  (window.screen?.orientation?.angle ?? window.orientation ?? 0) * DEG;

export const isTouchDevice = () =>
  window.matchMedia("(hover: none) and (pointer: coarse)").matches;

/**
 * Calls onLook(yaw, pitch) with the look offset in radians (same signs as the cursor:
 * +yaw right, +pitch down; yaw is null while the phone points straight up/down).
 * Returns a cleanup function.
 */
export function startGyroLook(onLook) {
  let rest = null;
  let lastTime = 0;
  let gotReading = false;
  let asking = false;

  const onOrientation = (e) => {
    if (e.alpha == null || e.beta == null || e.gamma == null) return;
    gotReading = true;
    // phone pose -> where its back looks, in the scene's frame (Y up)
    _deviceEuler.set(e.beta * DEG, e.alpha * DEG, -e.gamma * DEG, "YXZ");
    _deviceQuat
      .setFromEuler(_deviceEuler)
      .multiply(_outOfTheBack)
      .multiply(_screenQuat.setFromAxisAngle(_zAxis, -screenAngle()));
    _lookEuler.setFromQuaternion(_deviceQuat, "YXZ");
    const yaw = _lookEuler.y;
    const pitch = _lookEuler.x;
    const steady = Math.abs(pitch) < NEAR_VERTICAL;
    const now = performance.now();

    // first reading, or a terminal is open (the view stays still): start from here
    if (!rest || document.body.classList.contains("modal-open")) {
      rest = { yaw, pitch };
      lastTime = now;
      return;
    }

    const follow =
      1 - Math.exp(-Math.min((now - lastTime) / 1000, 0.5) / REST_FOLLOW);
    lastTime = now;
    if (steady) rest.yaw += wrapAngle(yaw - rest.yaw) * follow;
    rest.pitch += (pitch - rest.pitch) * follow;

    onLook(
      steady ? softClamp(-wrapAngle(yaw - rest.yaw) * GAIN, MAX_YAW) : null,
      softClamp(-(pitch - rest.pitch) * GAIN, MAX_PITCH),
    );
  };

  // portrait <-> landscape, or back from another app: the current pose is the new rest
  const resetRest = () => {
    rest = null;
  };

  // listen right away: where the sensor needs no permission (Android) readings just
  // start, where it does (iOS) they start once the visitor allows it
  window.addEventListener("deviceorientation", onOrientation);

  // the permission can only be asked from a tap: ask on the first tap once the house
  // is on screen (never over the loader), unless readings already come in
  const requestPermission = window.DeviceOrientationEvent?.requestPermission;
  const stopAsking = () => {
    window.removeEventListener("touchend", onTap);
    window.removeEventListener("click", onTap);
  };
  function onTap() {
    if (gotReading) return stopAsking();
    if (asking || !loadingProgress.ready) return;
    asking = true;
    requestPermission
      .call(window.DeviceOrientationEvent)
      .then((state) => {
        // granted or denied: never ask again (anything else: ask on the next tap)
        if (state === "granted" || state === "denied") stopAsking();
      })
      .catch(() => {
        // that touch could not ask (e.g. it was a scroll): try on the next one
      })
      .finally(() => {
        asking = false;
      });
  }

  if (typeof requestPermission === "function") {
    window.addEventListener("touchend", onTap, { passive: true });
    window.addEventListener("click", onTap);
  }
  window.addEventListener("orientationchange", resetRest);
  window.screen?.orientation?.addEventListener?.("change", resetRest);
  document.addEventListener("visibilitychange", resetRest);

  return () => {
    stopAsking();
    window.removeEventListener("deviceorientation", onOrientation);
    window.removeEventListener("orientationchange", resetRest);
    window.screen?.orientation?.removeEventListener?.("change", resetRest);
    document.removeEventListener("visibilitychange", resetRest);
  };
}

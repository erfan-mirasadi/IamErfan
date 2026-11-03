"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { HalfFloatType, WebGLRenderTarget } from "three";
import { loadingProgress } from "./sceneLoader";

const WARMUP_TIMEOUT = 15000; // a slow driver must never keep the loader up forever
const TEXTURES_PER_FRAME = 4;
const FRAMES_BEFORE_REVEAL = 3;
// The only refractive surfaces are fully frosted (roughness 1), so the copy of the
// scene they blur can be half size: same picture, a quarter of the pixels to draw.
const TRANSMISSION_SCALE = 0.5;

const nextFrame = () => new Promise((resolve) => requestAnimationFrame(() => resolve()));
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function collectTextures(scene) {
  const textures = new Set();
  if (scene.background?.isTexture) textures.add(scene.background);
  scene.traverse((object) => {
    if (!object.material) return;
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    for (const material of materials) {
      for (const value of Object.values(material)) {
        if (value?.isTexture) textures.add(value);
      }
    }
  });
  return [...textures];
}

/**
 * Runs once everything is downloaded, while the Loader still covers the canvas:
 * 1. compiles every shader (in parallel where KHR_parallel_shader_compile exists)
 * 2. uploads every texture to the GPU, a few per frame
 * 3. starts the render loop (onWarm) and reveals the scene (onReady) only after
 *    real frames were drawn — so the first thing users see is the finished house,
 *    never a black canvas or a frozen first frame.
 */
export default function SceneWarmup({ onWarm, onReady }) {
  const get = useThree((state) => state.get);
  const framesRef = useRef(-1); // -1 = still warming up

  useEffect(() => {
    let cancelled = false;
    framesRef.current = -1;

    (async () => {
      const { gl, scene, camera } = get();

      // 1) EffectComposer draws the scene into a render target, so compile with one
      //    bound to get exactly the same shader variants (linear output, no tone mapping)
      const target = new WebGLRenderTarget(1, 1, { type: HalfFloatType });
      const previousTarget = gl.getRenderTarget();
      let compiling = Promise.resolve();
      try {
        gl.setRenderTarget(target);
        compiling = gl.compileAsync(scene, camera);
      } catch (error) {
        console.warn("[Loader] shader warm-up skipped", error);
      } finally {
        gl.setRenderTarget(previousTarget);
      }
      await Promise.race([compiling.catch(() => {}), delay(WARMUP_TIMEOUT)]);
      target.dispose();
      if (cancelled) return;
      loadingProgress.warmup = 0.1;

      // 2) upload textures now, so rooms deeper in the house don't stutter on first view
      const textures = collectTextures(scene);
      for (let i = 0; i < textures.length; i++) {
        if (cancelled) return;
        try {
          gl.initTexture(textures[i]);
        } catch {
          // falls back to uploading on first render
        }
        loadingProgress.warmup = 0.1 + 0.9 * ((i + 1) / textures.length);
        if ((i + 1) % TEXTURES_PER_FRAME === 0) await nextFrame();
      }
      if (cancelled) return;

      // 3) start rendering, useFrame below reveals after a few drawn frames.
      //    Nothing that casts a shadow ever moves, so the sun's shadow map is drawn
      //    once on the first frame instead of every frame (it was ~480 draw calls).
      gl.shadowMap.autoUpdate = false;
      gl.shadowMap.needsUpdate = true;
      gl.transmissionResolutionScale = TRANSMISSION_SCALE;
      loadingProgress.warmup = 1;
      framesRef.current = 0;
      onWarm?.();
    })();

    return () => {
      cancelled = true;
    };
  }, [get, onWarm]);

  // a lost + restored WebGL context comes back with empty shadow maps
  useEffect(() => {
    const canvas = get().gl.domElement;
    const redrawShadows = () => {
      get().gl.shadowMap.needsUpdate = true;
    };
    canvas.addEventListener("webglcontextrestored", redrawShadows);
    return () => canvas.removeEventListener("webglcontextrestored", redrawShadows);
  }, [get]);

  useFrame(() => {
    if (framesRef.current < 0 || framesRef.current >= FRAMES_BEFORE_REVEAL) return;
    framesRef.current += 1;
    if (framesRef.current === FRAMES_BEFORE_REVEAL) {
      loadingProgress.ready = true;
      onReady?.();
    }
  });

  return null;
}

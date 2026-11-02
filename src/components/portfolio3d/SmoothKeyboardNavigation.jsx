"use client";

import { useEffect } from "react";
import { useScroll } from "@react-three/drei";

// Arrow keys walk through the tour (ArrowUp = forward, as the intro hint shows).
// Speeds are in screen heights per second, so it feels the same at 60Hz or 144Hz.
const CRUISE_SPEED = 0.5; // while a key is held
const SPEED_UP = 0.12; // seconds, ease in when the key goes down
const SLOW_DOWN = 0.18; // seconds, short glide after the key is released
const MIN_PRESS = 0.16; // seconds, a quick tap still moves a comfortable step
const NAV_KEYS = new Set(["ArrowUp", "ArrowDown"]);

export default function SmoothKeyboardNavigation() {
  const scroll = useScroll();

  useEffect(() => {
    const el = scroll.el;
    const pressed = new Map(); // key -> { downAt, releasedAt }
    let velocity = 0; // screen heights per second
    let position = null; // float scroll position (scrollTop alone rounds tiny steps away)
    let frame = 0;
    let lastTime = 0;

    const step = (time) => {
      const dt = Math.min(Math.max((time - lastTime) / 1000, 0), 0.05);
      lastTime = time;

      // a tapped key counts as held for MIN_PRESS, then it is let go
      let direction = 0;
      for (const [key, press] of pressed) {
        if (press.releasedAt && time - press.downAt >= MIN_PRESS * 1000) {
          pressed.delete(key);
        } else {
          direction += key === "ArrowUp" ? 1 : -1;
        }
      }

      const targetVelocity = Math.sign(direction) * CRUISE_SPEED;
      const smoothing = targetVelocity ? SPEED_UP : SLOW_DOWN;
      velocity += (targetVelocity - velocity) * (1 - Math.exp(-dt / smoothing));
      if (!targetVelocity && Math.abs(velocity) < 0.003) velocity = 0;

      if (velocity) {
        const maxScroll = el.scrollHeight - el.clientHeight;
        if (position === null) position = el.scrollTop;
        position = Math.max(
          0,
          Math.min(maxScroll, position + velocity * dt * el.clientHeight),
        );
        el.scrollTop = position;
      }

      // Only keep looping if there's still work to do
      if (pressed.size || velocity) {
        frame = requestAnimationFrame(step);
      } else {
        frame = 0;
        position = null;
      }
    };

    const start = () => {
      if (frame) return;
      lastTime = performance.now();
      frame = requestAnimationFrame(step);
    };

    // mouse wheel / touch takes over immediately
    const handOver = () => {
      pressed.clear();
      velocity = 0;
      position = null;
    };

    // window lost focus while a key was down: its keyup never arrives
    const releaseAll = () => {
      const now = performance.now();
      for (const press of pressed.values()) press.releasedAt ||= now;
    };

    const handleKeyDown = (event) => {
      // Protection against extension interference
      try {
        if (!event || !NAV_KEYS.has(event.key)) return;

        // Stop event propagation to prevent extension interference
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        // keep the scene still while a terminal modal is open
        if (document.body.classList.contains("modal-open")) return;

        // Prevent key repeat issues - only handle if key wasn't already pressed
        const press = pressed.get(event.key);
        if (press && !press.releasedAt) return;

        pressed.set(event.key, { downAt: performance.now(), releasedAt: 0 });
        start();
      } catch (error) {
        // Silently handle any extension-related errors
        console.warn(
          "Keyboard event handling interrupted by extension:",
          error,
        );
      }
    };

    const handleKeyUp = (event) => {
      try {
        if (!event || !NAV_KEYS.has(event.key)) return;

        // Stop event propagation
        event.stopPropagation();
        event.stopImmediatePropagation();

        const press = pressed.get(event.key);
        if (press) press.releasedAt = performance.now();
      } catch (error) {
        // Silently handle any extension-related errors
        console.warn(
          "Keyboard event handling interrupted by extension:",
          error,
        );
      }
    };

    // Add event listeners with capture phase to get events before extensions
    window.addEventListener("keydown", handleKeyDown, {
      passive: false,
      capture: true,
    });
    window.addEventListener("keyup", handleKeyUp, {
      passive: false,
      capture: true,
    });
    window.addEventListener("blur", releaseAll);
    el.addEventListener("wheel", handOver, { passive: true });
    el.addEventListener("touchstart", handOver, { passive: true });

    return () => {
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
      window.removeEventListener("keyup", handleKeyUp, { capture: true });
      window.removeEventListener("blur", releaseAll);
      el.removeEventListener("wheel", handOver);
      el.removeEventListener("touchstart", handOver);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [scroll]);

  return null;
}

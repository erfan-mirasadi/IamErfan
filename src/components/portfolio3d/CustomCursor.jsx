"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";

// A small copy of the glowing scene markers is the cursor: the dot sits exactly on
// the pointer, the dotted ring trails a little. It grows over links and buttons and
// "locks on" (corner brackets + CLICK) over clickable things in the 3D scene.
const FINE_POINTER = "(hover: hover) and (pointer: fine)";
const RING_SMOOTHING = 0.08; // seconds, how fast the ring catches up with the dot
const DOM_TARGETS =
  "a, button, [role='button'], label, select, input, textarea, [data-cursor='link']";

const subscribe = (onChange) => {
  const query = window.matchMedia(FINE_POINTER);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

export default function CustomCursor() {
  // mouse / trackpad only, phones keep their normal touch behaviour
  const enabled = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(FINE_POINTER).matches,
    () => false,
  );
  const rootRef = useRef(null);
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;
    const root = rootRef.current;
    const dot = dotRef.current;
    const ring = ringRef.current;
    const html = document.documentElement;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    html.classList.add("has-custom-cursor");

    const pointer = { x: -100, y: -100 };
    const trail = { x: -100, y: -100 };
    let frame = 0;
    let lastTime = 0;

    const follow = (time) => {
      const dt = Math.min(Math.max((time - lastTime) / 1000, 0), 0.1);
      lastTime = time;
      const k = calm ? 1 : 1 - Math.exp(-dt / RING_SMOOTHING);
      trail.x += (pointer.x - trail.x) * k;
      trail.y += (pointer.y - trail.y) * k;
      ring.style.transform = `translate3d(${trail.x}px, ${trail.y}px, 0)`;
      const settled =
        Math.abs(pointer.x - trail.x) + Math.abs(pointer.y - trail.y) < 0.1;
      frame = settled ? 0 : requestAnimationFrame(follow);
    };

    const onMove = (e) => {
      if (e.pointerType === "touch") return;
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      dot.style.transform = `translate3d(${pointer.x}px, ${pointer.y}px, 0)`;
      if (root.dataset.visible !== "true") {
        // appear right under the pointer instead of flying in from the corner
        trail.x = pointer.x;
        trail.y = pointer.y;
        ring.style.transform = `translate3d(${trail.x}px, ${trail.y}px, 0)`;
        root.dataset.visible = "true";
      }
      const overLink =
        e.target instanceof Element && e.target.closest(DOM_TARGETS) !== null;
      root.dataset.link = String(overLink);
      if (!frame) {
        lastTime = performance.now();
        frame = requestAnimationFrame(follow);
      }
    };

    const onDown = (e) => {
      if (e.pointerType !== "touch") root.dataset.pressed = "true";
    };
    const onUp = () => {
      root.dataset.pressed = "false";
    };
    const hide = () => {
      root.dataset.visible = "false";
    };
    const onOut = (e) => {
      if (!e.relatedTarget) hide(); // left the window
    };

    // clickable objects in the 3D scene switch body.style.cursor to "pointer"
    const observer = new MutationObserver(() => {
      root.dataset.target = String(document.body.style.cursor === "pointer");
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ["style"] });

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("pointercancel", onUp, { passive: true });
    window.addEventListener("pointerout", onOut);
    window.addEventListener("blur", hide);

    return () => {
      html.classList.remove("has-custom-cursor");
      observer.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      window.removeEventListener("pointerout", onOut);
      window.removeEventListener("blur", hide);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={rootRef}
      className="custom-cursor"
      data-visible="false"
      data-link="false"
      data-target="false"
      data-pressed="false"
      aria-hidden
    >
      <div ref={ringRef} className="custom-cursor-ring">
        <div className="custom-cursor-reticle">
          <svg className="custom-cursor-dots" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="15" />
          </svg>
          <span className="custom-cursor-bracket is-tl" />
          <span className="custom-cursor-bracket is-tr" />
          <span className="custom-cursor-bracket is-bl" />
          <span className="custom-cursor-bracket is-br" />
        </div>
        <span className="custom-cursor-label">CLICK</span>
      </div>
      <div ref={dotRef} className="custom-cursor-dot" />
    </div>
  );
}

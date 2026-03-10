"use client";

import { useEffect, useRef } from "react";
import { useScroll } from "@react-three/drei";

export default function SmoothKeyboardNavigation() {
  const scroll = useScroll();
  const velocityRef = useRef(0);
  const animationRef = useRef(null);
  const keysPressed = useRef(new Set());
  const startLoopRef = useRef(null);

  useEffect(() => {
    const animate = () => {
      // Apply continuous acceleration while keys are pressed
      if (keysPressed.current.size > 0) {
        const acceleration = scroll.el.scrollHeight * 0.00015;

        if (keysPressed.current.has("ArrowUp")) {
          velocityRef.current = Math.min(velocityRef.current + acceleration, 8);
        }
        if (keysPressed.current.has("ArrowDown")) {
          velocityRef.current = Math.max(
            velocityRef.current - acceleration,
            -8,
          );
        }
      }

      if (velocityRef.current !== 0) {
        const currentScroll = scroll.el.scrollTop;
        const maxScroll = scroll.el.scrollHeight - scroll.el.clientHeight;
        const newScroll = Math.max(
          0,
          Math.min(maxScroll, currentScroll + velocityRef.current),
        );

        scroll.el.scrollTop = newScroll;

        if (keysPressed.current.size === 0) {
          velocityRef.current *= 0.92;
        }

        if (Math.abs(velocityRef.current) < 0.2) {
          velocityRef.current = 0;
        }
      }

      // Only keep looping if there's still work to do
      if (
        keysPressed.current.size > 0 ||
        Math.abs(velocityRef.current) >= 0.2
      ) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        animationRef.current = null;
      }
    };

    // Helper to start the loop if not already running
    const startLoop = () => {
      if (!animationRef.current) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    // Expose startLoop so keydown handler can kick it off
    startLoopRef.current = startLoop;

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [scroll]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      // Protection against extension interference
      try {
        if (
          !event ||
          !event.key ||
          !["ArrowUp", "ArrowDown"].includes(event.key)
        ) {
          return;
        }

        // Stop event propagation to prevent extension interference
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        // Prevent key repeat issues - only handle if key wasn't already pressed
        if (keysPressed.current.has(event.key)) {
          return;
        }

        keysPressed.current.add(event.key);

        // Start the animation loop if not already running
        if (startLoopRef.current) startLoopRef.current();
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
        if (!event || !event.key) {
          return;
        }

        // Stop event propagation
        event.stopPropagation();
        event.stopImmediatePropagation();

        keysPressed.current.delete(event.key);
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

    return () => {
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
      window.removeEventListener("keyup", handleKeyUp, { capture: true });
    };
  }, [scroll]);

  // Reset velocity when user scrolls with mouse
  useEffect(() => {
    const handleScroll = () => {
      if (keysPressed.current.size === 0) {
        velocityRef.current = 0;
      }
    };

    scroll.el.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      scroll.el.removeEventListener("scroll", handleScroll);
    };
  }, [scroll]);

  return null;
}

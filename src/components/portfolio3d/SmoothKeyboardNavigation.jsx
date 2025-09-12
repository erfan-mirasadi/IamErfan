"use client";

import { useEffect, useRef } from "react";
import { useScroll } from "@react-three/drei";

export default function SmoothKeyboardNavigation() {
  const scroll = useScroll();
  const velocityRef = useRef(0);
  const animationRef = useRef(null);
  const keysPressed = useRef(new Set());

  useEffect(() => {
    const animate = () => {
      // Apply continuous acceleration while keys are pressed
      if (keysPressed.current.size > 0) {
        const acceleration = scroll.el.scrollHeight * 0.00015; // Continuous smooth acceleration

        if (keysPressed.current.has("ArrowUp")) {
          velocityRef.current = Math.min(velocityRef.current + acceleration, 8);
        }
        if (keysPressed.current.has("ArrowDown")) {
          velocityRef.current = Math.max(
            velocityRef.current - acceleration,
            -8
          );
        }
      }

      if (velocityRef.current !== 0) {
        // Apply velocity to scroll position
        const currentScroll = scroll.el.scrollTop;
        const maxScroll = scroll.el.scrollHeight - scroll.el.clientHeight;
        const newScroll = Math.max(
          0,
          Math.min(maxScroll, currentScroll + velocityRef.current)
        );

        scroll.el.scrollTop = newScroll;

        // Apply damping to velocity only when no keys are pressed
        if (keysPressed.current.size === 0) {
          velocityRef.current *= 0.92; // Slightly less damping for more momentum
        }

        // Stop when velocity is very small
        if (Math.abs(velocityRef.current) < 0.2) {
          velocityRef.current = 0;
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
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
      } catch (error) {
        // Silently handle any extension-related errors
        console.warn(
          "Keyboard event handling interrupted by extension:",
          error
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
          error
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

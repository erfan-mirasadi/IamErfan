"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function DirtyWindowOverlay({ activeStep }) {
  const [opacity, setOpacity] = useState(1);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (activeStep === "intro") {
      setOpacity(1);
      setIsVisible(true);
    } else {
      // Fade out smoothly
      setOpacity(0);
      // Hide completely after transition
      const timeout = setTimeout(() => {
        setIsVisible(false);
      }, 1000); // Wait for transition to complete

      return () => clearTimeout(timeout);
    }
  }, [activeStep]);

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "92vw",
        height: "100vh",
        pointerEvents: "none",
        opacity: opacity,
        zIndex: 0,
        transition: "opacity 1s ease-out",
        transform: "scale(1.2)",
        mixBlendMode: "multiply",
      }}
    >
      <Image
        src="/images/dirty-window-7.png"
        alt=""
        fill
        priority
        style={{
          objectFit: "cover",
          objectPosition: "center",
        }}
        sizes="92vw"
      />
    </div>
  );
}

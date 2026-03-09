"use client";

import { useState, useEffect, useRef } from "react";

export default function DragHint({ activeStep }) {
  const [visible, setVisible] = useState(false);
  const hasShownRef = useRef(false);
  const prevStepRef = useRef(activeStep);
  const timersRef = useRef([]);

  useEffect(() => {
    // Prevent showing the hint more than once
    if (hasShownRef.current) return;

    // Check if user transitioned out of the 'Garden' step
    const leftGarden =
      prevStepRef.current === "Garden" && activeStep !== "Garden";
    prevStepRef.current = activeStep;

    if (!leftGarden) return;

    hasShownRef.current = true;

    // Hide the hint entirely after 6 seconds (allows the animation to play a few times)
    timersRef.current.push(setTimeout(() => setVisible(false), 6000));
  }, [activeStep]);

  // Cleanup all active timers when the component unmounts
  useEffect(() => {
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
        zIndex: 50,
      }}
    >
      <div className="drag-hint-wrapper">
        <div className="drag-icon-container">
          {/* Subtle track line for the dot to slide on */}
          <div className="drag-path"></div>
          {/* The glowing dot that simulates a touch/mouse grab */}
          <div className="drag-dot"></div>
        </div>
        <span className="drag-hint-text">Drag to explore</span>
      </div>
    </div>
  );
}

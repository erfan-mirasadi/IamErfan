"use client";

import React from "react";
import { steps } from "./step";

function RoadmapSidebarComponent({ activeStep = "intro" }) {
  return (
    <div className="fixed right-8 top-1/2 -translate-y-1/2 flex flex-col items-center gap-8 pointer-events-none font-vt323">
      {steps.map((step, index) => {
        const isActive = activeStep === step.id;
        const isCompleted = steps.findIndex((s) => s.id === activeStep) > index;

        return (
          <div key={step.id} className="relative flex flex-col items-center">
            {index !== 0 && (
              <div
                className={`absolute -top-8 w-[3px] h-8 rounded-full transition-all duration-700 ${
                  isCompleted
                    ? "bg-gradient-to-b from-cyan-200 to-purple-400 shadow-[0_0_12px_rgba(34,211,238,0.8)]"
                    : "bg-gray-600"
                }`}
              />
            )}

            <div
              className={`relative w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500 ${
                isActive
                  ? "bg-cyan-100 shadow-[0_0_15px_rgba(34,211,238,1)] scale-135"
                  : isCompleted
                  ? "bg-cyan-900 shadow-[0_0_8px_rgba(168,85,247,0.8)]"
                  : "bg-gray-700 border border-gray-600"
              }`}
            >
              {isActive && (
                <>
                  <div className="absolute w-12 h-12 rounded-full border-2 border-cyan-400 opacity-40 animate-ping" />
                  <div className="absolute w-8 h-8 rounded-full border border-cyan-500 opacity-20 animate-pulse" />
                </>
              )}
            </div>

            <span
              className={`mt-1.5  font-bold tracking-wider uppercase font-semibold transition-all duration-800 ${
                isActive
                  ? "text-cyan-200 font-bold text-2xl drop-shadow-[0_0_6px_rgba(34,211,238,0.8)]"
                  : isCompleted
                  ? "text-gary-500 text-sm"
                  : "text-gray-500 text-xl"
              }`}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// Memoize the component to prevent unnecessary re-renders
export default React.memo(RoadmapSidebarComponent);

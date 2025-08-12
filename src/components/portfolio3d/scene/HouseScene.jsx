//HOUSE SCENE
"use client";

import { Suspense } from "react";
import { Center, Html, useProgress } from "@react-three/drei";
import HouseModel from "./model/HouseModel";
import DoorLockInteractable from "../interactables/DoorLockInteractable";
import PlanetsInteractable from "../interactables/PlanetsInteractable";

// Loader according to drei docs: Html overlay + useProgress
function CanvasLoader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center rounded-xl bg-black/60 text-white backdrop-blur-md p-3 w-44">
        <div className="text-sm opacity-80">Loading…</div>
        <div className="mt-2 w-36 h-2 rounded-full bg-white/20 overflow-hidden">
          <div
            className="h-full bg-cyan-400"
            style={{ width: `${Math.round(progress)}%` }}
          />
        </div>
        <div className="mt-2 text-xs opacity-70">{Math.round(progress)}%</div>
      </div>
    </Html>
  );
}

export default function HouseScene() {
  return (
    <Center>
      <Suspense fallback={<CanvasLoader />}>
        <HouseModel />
        {/* Interactables (self-contained) */}
        <DoorLockInteractable
          onActivate={() => console.log("DoorLock activated")}
        />
        <PlanetsInteractable
          onActivate={() => console.log("Planets activated")}
        />
      </Suspense>
    </Center>
  );
}

//HOUSE MODEL

// حذف preload برای lazy loading واقعی - مدل فقط وقتی لود میشه که نیاز باشه
// useGLTF.preload("/models/main.glb");

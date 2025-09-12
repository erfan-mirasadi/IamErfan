"use client";

import { openModal } from "../ModalManager";
import RaycastClickable from "./RaycastClickable";

const defaultScript = [
  { type: "normal", text: "hey traveler\n" },
  { type: "error", wrong: "my nam", correct: "It's Erfan" },
  // { type: "error", wrong: "yarn dev", correct: "come on in" },
  {
    type: "normal",
    text: "welcome to my life story",
  },
  { type: "normal", text: "Access granted" },
];

export default function DoorLockInteractable({
  targetName = "doorLock",
  scriptData = defaultScript,
  activeStep = "intro",
}) {
  const shouldBeActive = activeStep === "Key";
  return (
    <RaycastClickable
      targetName={targetName}
      activeStep={activeStep}
      isActive={shouldBeActive}
      onClick={() => {
        openModal({
          scriptData,
        });
      }}
      onPointerEnter={() => {
        document.body.style.cursor = "pointer";
      }}
      onPointerLeave={() => {
        document.body.style.cursor = "";
      }}
      markerPosition={{ x: 0.01, y: 0.24, z: 0.029 }} // simple position close to scene
      markerSize={0.02}
      segments={32}
    />
  );
}

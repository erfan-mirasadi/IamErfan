"use client";

import { openModal } from "../ModalManager";
import RaycastClickable from "./RaycastClickable";

const defaultScript = [
  { type: "normal", text: "hey...\n" },
  { type: "error", wrong: "my name i", correct: "I'm Erfan" },
  // {
  //   type: "error",
  //   wrong: "undefined path",
  //   correct: "Path found: Life × Code × Art",
  // },
  { type: "error", wrong: "yarn dev", correct: "come on in" },
  {
    type: "normal",
    text: "Let me show you around — each corner has own stories.",
  },
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

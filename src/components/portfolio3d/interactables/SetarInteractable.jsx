"use client";

import { openModal } from "../ModalManager";
import RaycastClickable from "./RaycastClickable";

const defaultScript = [
  {
    type: "normal",
    text: "It's a Setar, a traditional Persian instrument.",
  },
  {
    type: "normal",
    text: "I don’t only write codes, I also express with my soul.",
  },
  {
    type: "normal",
    text: "That's how I find peace in music",
  },
  { type: "normal", text: "Code has logic, Music has soul.\n" },
];

export default function SetarInteractable({
  targetName = "setar",
  scriptData = defaultScript,
  activeStep = "intro",
}) {
  const shouldBeActive = activeStep === "Art";

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
      markerPosition={{ x: -1.5, y: 0, z: 0.8 }}
      markerSize={0.25}
    />
  );
}

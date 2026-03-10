"use client";

import { openModal } from "../ModalManager";
import RaycastClickable from "./RaycastClickable";

const handlePointerEnter = () => {
  document.body.style.cursor = "pointer";
};
const handlePointerLeave = () => {
  document.body.style.cursor = "";
};

const defaultScript = [
  {
    type: "normal",
    text: "That’s my plants. I keep it alive… somehow ",
  },
  { type: "normal", text: "Trees, mountains, fresh air—it's my reset button" },
  {
    type: "normal",
    text: "I believe life makes more sense when you're close to the nature.",
  },
];

export default function PlanetsInteractable({
  targetName = "Plants",
  scriptData = defaultScript,
  activeStep = "intro",
}) {
  const shouldBeActive = activeStep === "Garden";

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
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      markerPosition={{ x: -0.25, y: -0.2, z: 1.8 }}
      markerSize={0.03}
      segments={42}
    />
  );
}

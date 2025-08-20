"use client";

import { openModal } from "../ModalManager";
import RaycastClickable from "./RaycastClickable";

const defaultScript = [
  {
    type: "normal",
    text: "If I'm not coding, you'll probably find me in nature.",
  },
  { type: "normal", text: "Trees, mountains, fresh air—it's my reset button." },
  {
    type: "normal",
    text: "I believe life makes more sense when you're close to the earth.",
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
      onPointerEnter={() => {
        document.body.style.cursor = "pointer";
      }}
      onPointerLeave={() => {
        document.body.style.cursor = "";
      }}
      markerPosition={{ x: -0.25, y: -0.2, z: 1.8 }}
      markerSize={0.03}
      segments={42}
    />
  );
}

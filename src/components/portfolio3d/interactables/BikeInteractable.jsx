"use client";

import { openModal } from "../ModalManager";
import RaycastClickable from "./RaycastClickable";

const defaultScript = [
  {
    type: "error",
    wrong: "$ echo L",
    correct: "Who needs therapy when you have a bike?",
  },
  {
    type: "normal",
    text: "Two wheels, endless possibilities.\n",
  },
  {
    type: "normal",
    text: "My best ideas happen at 30km/h.\n",
  },
];

export default function BikeInteractable({
  targetName = "Bike",
  scriptData = defaultScript,
  activeStep = "intro",
}) {
  const shouldBeActive = activeStep === "GYM";

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
      markerPosition={{ x: 15, y: 59, z: -95 }}
      markerSize={2}
      segments={35}
    />
  );
}

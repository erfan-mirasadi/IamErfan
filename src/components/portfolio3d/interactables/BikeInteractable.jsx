"use client";

import { openModal } from "../ModalManager";
import RaycastClickable from "./RaycastClickable";

const defaultScript = [
  {
    type: "error",
    wrong: "$ echo L",
    correct: "Life feels different when you're on two wheels 🚴🏻",
  },
  {
    type: "normal",
    text: "Cycling isn’t just a hobby",
  },
  {
    type: "normal",
    text: "it’s freedom, discipline, and pure joy",
  },
  {
    type: "normal",
    text: "Some of my best ideas came while I was on the road",
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

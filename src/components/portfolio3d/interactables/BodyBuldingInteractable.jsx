"use client";

import { openModal } from "../ModalManager";
import RaycastClickable from "./RaycastClickable";

const defaultScript = [
  { type: "normal", text: "\n[weights waiting...]\n" },
  {
    type: "wrong",
    wrong: "git push",
    correct: "Pushing limits in training teaches me how to push limits in life",
  },
  {
    type: "normal",
    text: "It’s not just about looks",
  },
  {
    type: "normal",
    text: "it’s discipline, adrenaline, and power",
  },
];

export default function BodyBuldingInteractable({
  targetName = "BodyBulding",
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
      markerPosition={{ x: 0.2, y: 0.5, z: -0.5 }}
      markerSize={0.08}
    />
  );
}

"use client";

import { openModal } from "../ModalManager";
import RaycastClickable from "./RaycastClickable";

const defaultScript = [
  {
    type: "normal",
    text: "Books are the cornerstone of how I perceive life.\n",
  },
  {
    type: "normal",
    text: "Every book I open feels like adding a new library to my brain.\n",
  },
  {
    type: "error",
    wrong: "404",
    correct: "200 - Learning in progress...",
  },
];

export default function BookInteractable({
  targetName = "Book",
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
      markerPosition={{ x: -0.06, y: 0.16, z: 0 }}
      markerSize={0.03}
    />
  );
}

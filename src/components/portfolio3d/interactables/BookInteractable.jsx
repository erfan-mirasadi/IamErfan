"use client";

import { openModal } from "../ModalManager";
import RaycastClickable from "./RaycastClickable";

const defaultScript = [
  {
    type: "normal",
    text: "Books are my way of moving without leaving the room\n",
  },
  {
    type: "normal",
    text: "If a day passes without learning",
  },
  {
    type: "normal",
    text: "it feels like standing still in time\n",
  },
  {
    type: "error",
    wrong: "404",
    correct: "Keep reading, keep evolving",
  },
];

export default function BookInteractable({
  targetName = "Book",
  scriptData = defaultScript,
  activeStep = "intro", // default value اضافه کردم
}) {
  // فقط در step "Art" فعال باشد
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
        console.log("Book hover enter");
        document.body.style.cursor = "pointer";
      }}
      onPointerLeave={() => {
        console.log("Book hover leave");
        document.body.style.cursor = "";
      }}
      markerPosition={{ x: -0.06, y: 0.16, z: 0 }}
      markerSize={0.03}
    />
  );
}

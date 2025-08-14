"use client";

import { openModal } from "../ModalManager";
import RaycastClickable from "./RaycastClickable";

const defaultScript = [{ type: "normal", text: "I love nature\n" }];

export default function PlanetsInteractable({
  targetName = "Planets",
  scriptData = defaultScript,
  modalContainerClassName = "",
  childrenClassName = "",
}) {
  return (
    <RaycastClickable
      targetName={targetName}
      onClick={() => {
        openModal({
          scriptData,
          modalContainerClassName,
          childrenClassName,
        });
      }}
    />
  );
}

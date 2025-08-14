"use client";

import { openModal } from "../ModalManager";
import RaycastClickable from "./RaycastClickable";

const defaultScript = [
  { type: "normal", text: "I love BodyBulding\n" },
  { type: "error", wrong: "no no", correct: "I enjoy BodyBulding" },
];

export default function BodyBuldingInteractable({
  targetName = "BodyBulding",
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

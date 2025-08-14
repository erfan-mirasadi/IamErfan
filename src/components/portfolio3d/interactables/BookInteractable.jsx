"use client";

import { openModal } from "../ModalManager";
import RaycastClickable from "./RaycastClickable";

const defaultScript = [
  { type: "normal", text: "I love reading books\n" },
  { type: "error", wrong: "no no", correct: "I enjoy reading books" },
];

export default function BookInteractable({
  targetName = "Book",
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

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
}) {
  return (
    <RaycastClickable
      targetName={targetName}
      onClick={() => {
        openModal({
          scriptData,
        });
      }}
      markerPosition={{ x: -0.06, y: 0.16, z: 0 }}
      markerSize={0.03}
    />
  );
}

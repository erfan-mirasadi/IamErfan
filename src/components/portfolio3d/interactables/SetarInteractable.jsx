"use client";

import { openModal } from "../ModalManager";
import RaycastClickable from "./RaycastClickable";

const defaultScript = [
  { type: "normal", text: "I love setar books\n" },
  { type: "error", wrong: "no no", correct: "I enjoy reading books" },
];

export default function SetarInteractable({
  targetName = "setar",
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
      markerPosition={{ x: -1.5, y: 0, z: 0.8 }}
      markerSize={0.25}
    />
  );
}

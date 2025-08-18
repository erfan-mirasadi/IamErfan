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
}) {
  return (
    <RaycastClickable
      targetName={targetName}
      onClick={() => openModal({ scriptData })}
      markerPosition={{ x: 0.2, y: 0.5, z: -0.5 }}
      markerSize={0.08}
    />
  );
}

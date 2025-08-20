"use client";

import { openModal } from "../ModalManager";
import RaycastClickable from "./RaycastClickable";

const defaultScript = [
  { type: "normal", text: "The gym is my second home" },
  {
    type: "normal",
    text: "It’s not just about looks",
  },
  {
    type: "normal",
    text: "it’s discipline, adrenaline, and power",
  },
  {
    type: "normal",
    text: "Pushing limits in training teaches me how to push limits in life",
  },
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

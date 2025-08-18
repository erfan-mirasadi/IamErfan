"use client";

import { openModal } from "../ModalManager";
import RaycastClickable from "./RaycastClickable";

const defaultScript = [
  {
    type: "normal",
    text: "life is noting mean too mean without riding bikes\n",
  },
  { type: "error", wrong: "hiii", correct: "I enjoy bikes " },
];

export default function BikeInteractable({
  targetName = "Bike",
  scriptData = defaultScript,
}) {
  return (
    <RaycastClickable
      targetName={targetName}
      onClick={() => openModal({ scriptData })}
      markerPosition={{ x: -5, y: 63, z: -65 }}
      markerSize={2.5}
    />
  );
}

"use client";

import { openModal } from "../ModalManager";
import RaycastClickable from "./RaycastClickable";

const defaultScript = [
  {
    type: "normal",
    text: "If I'm not coding, you'll probably find me in nature.",
  },
  { type: "normal", text: "Trees, mountains, fresh air—it's my reset button." },
  {
    type: "normal",
    text: "I believe life makes more sense when you're close to the earth.",
  },
];

export default function PlanetsInteractable({
  targetName = "Plants",
  scriptData = defaultScript,
}) {
  return (
    <RaycastClickable
      targetName={targetName}
      onClick={() => openModal({ scriptData })}
      markerPosition={{ x: 0.7, y: -0.2, z: 1.3 }}
      markerSize={0.05}
    />
  );
}

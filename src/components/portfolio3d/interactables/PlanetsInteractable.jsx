"use client";

import { openModal } from "../ModalManager";
import RaycastClickable from "./RaycastClickable";

const defaultScript = [{ type: "normal", text: "I love nature\n" }];

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

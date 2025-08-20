"use client";

import { openModal } from "../ModalManager";
import RaycastClickable from "./RaycastClickable";

const defaultScript = [
  {
    type: "normal",
    text: "This is a Setar — a traditional Persian instrument",
  },
  { type: "normal", text: "When I play, the noise of life fades away" },
  {
    type: "normal",
    text: "Music isn’t just sound to me",
  },
  {
    type: "normal",
    text: "it’s a form of meditation",
  },
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

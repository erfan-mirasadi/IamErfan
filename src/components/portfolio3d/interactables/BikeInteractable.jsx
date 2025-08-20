"use client";

import { openModal } from "../ModalManager";
import RaycastClickable from "./RaycastClickable";

const defaultScript = [
  {
    type: "error",
    wrong: "$ echo L",
    correct: "Life feels different when you're on two wheels 🚴🏻",
  },
  {
    type: "normal",
    text: "Cycling isn’t just a hobby",
  },
  {
    type: "normal",
    text: "it’s freedom, discipline, and pure joy",
  },
  {
    type: "normal",
    text: "Some of my best ideas came while I was on the road",
  },
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

"use client";

import { openModal } from "../ModalManager";
import RaycastClickable from "./RaycastClickable";

const projectScripts = {
  Project_1: [
    { type: "normal", text: "Project_1: Portfolio Website\n" },
    {
      type: "error",
      wrong: "no no",
      correct: "I enjoy building web portfolios.",
    },
  ],
  Project_2: [
    { type: "normal", text: "Project_2: 3D Visualization\n" },
    {
      type: "error",
      wrong: "no no",
      correct: "I enjoy working with Three.js.",
    },
  ],
  Project_3: [
    { type: "normal", text: "Project_3: Interactive Terminal\n" },
    {
      type: "error",
      wrong: "no no",
      correct: "I enjoy making interactive UIs.",
    },
  ],
  Project_4: [
    { type: "normal", text: "Project_4: Theatre.js Animations\n" },
    {
      type: "error",
      wrong: "no no",
      correct: "I enjoy animation and motion design.",
    },
  ],
};

export default function ProjectInteractable({
  targetName = "Project_1", // Add default back for safety
  markerPosition = { x: 0, y: 0, z: 0 },
  markerSize = 0.1,
}) {
  const scriptData = projectScripts[targetName];

  // Better error handling with more info
  if (!scriptData) {
    console.error(
      `ProjectInteractable: No script data found for targetName: "${targetName}"`
    );
    console.error("Available targets:", Object.keys(projectScripts));
    return null;
  }

  return (
    <RaycastClickable
      targetName={targetName}
      onClick={() => openModal({ scriptData })}
      markerPosition={markerPosition}
      markerSize={markerSize}
    />
  );
}

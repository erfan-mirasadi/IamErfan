"use client";

import { openModal } from "../ModalManager";
import RaycastClickable from "./RaycastClickable";

const projectScripts = {
  Project_1: {
    targetName: "Project_1",
    modalData: [
      { type: "normal", text: "Project_1: Portfolio Website\n" },
      {
        type: "error",
        wrong: "no no",
        correct: "I enjoy building web portfolios.",
      },
    ],
    markerPosition: { x: 0, y: -0.04, z: -0.5 },
  },
  Project_2: {
    targetName: "Project_2",
    modalData: [
      { type: "normal", text: "Project_2: 3D Visualization\n" },
      {
        type: "error",
        wrong: "no no",
        correct: "I enjoy working with Three.js.",
      },
    ],
    markerPosition: { x: 0, y: 0, z: -0.5 },
  },
  Project_3: {
    targetName: "Project_3",
    modalData: [
      { type: "normal", text: "Project_3: Interactive Terminal\n" },
      {
        type: "error",
        wrong: "no no",
        correct: "I enjoy making interactive UIs.",
      },
    ],
    markerPosition: { x: 0, y: 0.2, z: -0.36 },
  },
  Project_4: {
    targetName: "Project_4",
    modalData: [
      { type: "normal", text: "Project_4: Theatre.js Animations\n" },
      {
        type: "error",
        wrong: "no no",
        correct: "I enjoy animation and motion design.",
      },
    ],
    markerPosition: { x: -0.38, y: 0.42, z: 0 },
  },
};

export default function ProjectInteractable({
  targetName = "Project_1",
  scriptData = projectScripts[targetName],
}) {
  return (
    <RaycastClickable
      targetName={scriptData.targetName}
      onClick={() => openModal({ scriptData: scriptData.modalData })}
      markerPosition={scriptData.markerPosition}
      markerSize={0.05}
    />
  );
}

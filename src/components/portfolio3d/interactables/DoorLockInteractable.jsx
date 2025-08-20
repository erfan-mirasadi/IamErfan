"use client";

import { openModal } from "../ModalManager";
import RaycastClickable from "./RaycastClickable";

const defaultScript = [
  { type: "normal", text: "Welcome, traveler 🌌\n" },
  { type: "error", wrong: "my name i", correct: "Hello, I'm Erfan!" },
  { type: "normal", text: "You just stepped into my world.\n" },
  {
    type: "error",
    wrong: "undefined path",
    correct: "Path found: Life × Code × Art",
  },
  { type: "normal", text: "Access granted - Let's begin." },
];

export default function DoorLockInteractable({
  targetName = "doorLock",
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
      markerPosition={{ x: 0.01, y: 0.26, z: 0.029 }} // موقعیت ساده و نزدیک مرکز صحنه برای تست
      markerSize={0.03}
    />
  );
}

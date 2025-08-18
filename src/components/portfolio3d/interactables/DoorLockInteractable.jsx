"use client";

import { openModal } from "../ModalManager";
import RaycastClickable from "./RaycastClickable";

const defaultScript = [
  { type: "normal", text: "Welcome to my Life...\n" },
  { type: "error", wrong: "my name i", correct: "Hello, I'm Erfan!" },
  { type: "normal", text: "Take a walk with me through code and life :)" },
  {
    type: "error",
    wrong: "$ echo 'Let",
    correct: "Let's make something awesome!",
  },
  { type: "normal", text: "Token successfully generated\n" },
  { type: "normal", text: "Access granted" },
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

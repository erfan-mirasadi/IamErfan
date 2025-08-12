"use client";

import RaycastClickable from "./RaycastClickable";
import HintHalo from "./HintHalo";

export default function DoorLockInteractable({ onActivate }) {
  return (
    <RaycastClickable targetName="doorLock" onClick={onActivate}>
      <HintHalo />
    </RaycastClickable>
  );
}

"use client";

import RaycastClickable from "./RaycastClickable";
import HintHalo from "./HintHalo";

export default function PlanetsInteractable({
  onActivate,
  targetName = "Planets",
}) {
  return (
    <RaycastClickable targetName={targetName} onClick={onActivate}>
      <HintHalo color="#f59e0b" />
    </RaycastClickable>
  );
}

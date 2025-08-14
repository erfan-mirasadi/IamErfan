"use client";

import { Html, useScroll } from "@react-three/drei";
import { useCurrentSheet } from "@theatre/r3f";
import { useFrame } from "@react-three/fiber";
import { useMemo, useState } from "react";
import { val } from "@theatre/core";
import { overlayCues } from "./cues";

export default function KeyframeOverlayManager() {
  const sheet = useCurrentSheet();
  const scroll = useScroll();
  const [position, setPosition] = useState(0);

  const sequenceLength = val(sheet.sequence.pointer.length);
  const cues = useMemo(() => overlayCues(sequenceLength), [sequenceLength]);

  useFrame(() => {
    const pos = scroll.offset * sequenceLength;
    if (pos !== position) setPosition(pos);
  });

  const buffer = 0.15; // buffer for smooth fade-out
  const activeCue = cues.find(
    (c) => position >= c.start && position <= c.end + buffer
  );
  const isFadingOut = !!activeCue && position > activeCue.end;

  if (!activeCue) return null;

  const Component = activeCue.component;

  return (
    <Html fullscreen transform={false} pointerEvents={"none"}>
      <div
        style={{
          opacity: isFadingOut ? 0 : 1,
          transition: "opacity 400ms ease",
        }}
      >
        <Component />
      </div>
    </Html>
  );
}

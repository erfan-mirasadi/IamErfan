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
    if (pos !== position) {
      setPosition(pos);
    }
  });

  const resolvedCues = useMemo(() => {
    return cues.map((c) => {
      const isNormalized = c.normalized === true;
      const start = isNormalized ? c.start * sequenceLength : c.start;
      const end = isNormalized ? c.end * sequenceLength : c.end;
      return { ...c, _start: start, _end: end };
    });
  }, [cues, sequenceLength]);

  const activeCues = resolvedCues.filter((c) => {
    return position >= c._start && position <= c._end;
  });

  if (activeCues.length === 0) return null;

  return (
    <Html
      fullscreen
      transform={false}
      zIndexRange={[500, 0]}
      style={{ pointerEvents: "none" }}
    >
      {activeCues.map((cue) => {
        const Component = cue.component;
        const allowPointerEvents = cue.pointerEvents === "auto";
        return (
          <div
            key={cue.id}
            style={{ pointerEvents: allowPointerEvents ? "auto" : "none" }}
          >
            <Component {...(cue.props || {})} />
          </div>
        );
      })}
    </Html>
  );
}

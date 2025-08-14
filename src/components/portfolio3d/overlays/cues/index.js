import IntroScroll from "./IntroScroll";

// Cue registry: each item defines an active window on theatre sequence timeline
// start/end are in theatre sequence units (same as keyframe positions)
export const overlayCues = (sequenceLength) => [
  {
    id: "intro-scroll",
    start: 0,
    // end: Math.min(0.8, sequenceLength * 0.08),
    end: 0.5,
    component: IntroScroll,
  },
];

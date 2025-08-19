import IntroScroll from "./IntroScroll";

export const overlayCues = (sequenceLength) => [
  {
    id: "intro-scroll",
    start: 0,
    end: 0.5,
    component: IntroScroll,
    buffer: 0,
  },
  // {
  //   id: "roadmap-sidebar",
  //   start: 0,
  //   end: sequenceLength,
  //   component: RoadmapSidebar,
  //   buffer: 0,
  // },
];

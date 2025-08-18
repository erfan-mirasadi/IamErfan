import ProjectInteractable from "../../interactables/ProjectInteraxtable";
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
  {
    id: "project-interactable",
    start: 9,
    end: 10, // از 9 تا 10 ثانیه برای فعال کردن هاور و تولیپ‌ها
    component: ProjectInteractable, // کامپوننت پروژه‌ها
    props: {
      // پروپ‌های خاص برای ProjectInteractable
      targetName: "Project_1", // می‌تونید این رو داینامیک کنید یا چند تا اضافه کنید
      markerPosition: { x: 0, y: 1, z: 0 },
      markerSize: 0.2,
    },
    props: {
      // پروپ‌های خاص برای ProjectInteractable
      targetName: "Project_2", // می‌تونید این رو داینامیک کنید یا چند تا اضافه کنید
      markerPosition: { x: 0, y: 1, z: 0 },
      markerSize: 0.2,
    },
    props: {
      // پروپ‌های خاص برای ProjectInteractable
      targetName: "Project_2", // می‌تونید این رو داینامیک کنید یا چند تا اضافه کنید
      markerPosition: { x: 0, y: 1, z: 0 },
      markerSize: 0.2,
    },
    props: {
      // پروپ‌های خاص برای ProjectInteractable
      targetName: "Project_2", // می‌تونید این رو داینامیک کنید یا چند تا اضافه کنید
      markerPosition: { x: 0, y: 1, z: 0 },
      markerSize: 0.2,
    },
  },
];

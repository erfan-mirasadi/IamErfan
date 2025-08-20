"use client";

import { openModal } from "../ModalManager";
import RaycastClickable from "./RaycastClickable";

const projectScripts = {
  Project_1: {
    targetName: "Project_1",
    modalData: [
      {
        type: "normal",
        text: "Movie Project, A team project for subscribeable website movie 🎬",
      },
      {
        type: "normal",
        text: "Contributed on UI/UX and frontend, making the platform simple & fast.",
      },
    ],
    markerPosition: { x: 0, y: -0.04, z: -0.5 },
  },
  Project_2: {
    targetName: "Project_2",
    modalData: [
      {
        type: "normal",
        text: "SUBLY Project , A modern platform to buy & manage digital subscriptions",
      },
      {
        type: "normal",
        text: "Built with Next.js, Supabase, Tailwind — plus a full custom admin panel.",
      },
    ],
    markerPosition: { x: 0, y: 0, z: -0.5 },
  },
  Project_3: {
    targetName: "Project_3",
    modalData: [
      {
        type: "normal",
        text: "LumiLuxe Site, A fashion website with elegance in every pixel ✨",
      },
      {
        type: "normal",
        text: "React + Vite + GSAP powering smooth UX with a golden aesthetic.",
      },
    ],
    markerPosition: { x: 0, y: 0.2, z: -0.36 },
  },
  Project_4: {
    targetName: "Project_4",
    modalData: [
      {
        type: "normal",
        text: "Project under construction...",
      },
      {
        type: "normal",
        text: "Actually its building in laboratory...",
      },
      {
        type: "error",
        wrong: "launch.comingSoon()",
        correct: "launch comingSoon...",
      },
      {
        type: "normal",
        text: ":)",
      },
    ],
    markerPosition: { x: -0.38, y: 0.42, z: 0 },
  },
};

export default function ProjectInteractable({
  targetName = "Project_1",
  scriptData = projectScripts[targetName],
  activeStep = "intro",
}) {
  const shouldBeActive = activeStep === "Workshop";

  return (
    <RaycastClickable
      targetName={scriptData.targetName}
      activeStep={activeStep}
      isActive={shouldBeActive}
      onClick={() => openModal({ scriptData: scriptData.modalData })}
      onPointerEnter={() => {
        document.body.style.cursor = "pointer";
      }}
      onPointerLeave={() => {
        document.body.style.cursor = "";
      }}
      markerPosition={scriptData.markerPosition}
      markerSize={0.04}
    />
  );
}

// for Hover video autoPlay

// "use client";

// import { openModal } from "../ModalManager";
// import RaycastClickable from "./RaycastClickable";

// const projectScripts = {
//   Project_1: {
//     targetName: "Project_1",
//     modalData: [
//       { type: "normal", text: "Project_1: Portfolio Website\n" },
//       {
//         type: "error",
//         wrong: "no no",
//         correct: "I enjoy building web portfolios.",
//       },
//     ],
//     markerPosition: { x: 0, y: -0.04, z: -0.5 },
//   },
//   Project_2: {
//     targetName: "Project_2",
//     modalData: [
//       { type: "normal", text: "Project_2: 3D Visualization\n" },
//       {
//         type: "error",
//         wrong: "no no",
//         correct: "I enjoy working with Three.js.",
//       },
//     ],
//     markerPosition: { x: 0, y: 0, z: -0.5 },
//   },
//   Project_3: {
//     targetName: "Project_3",
//     modalData: [
//       { type: "normal", text: "Project_3: Interactive Terminal\n" },
//       {
//         type: "error",
//         wrong: "no no",
//         correct: "I enjoy making interactive UIs.",
//       },
//     ],
//     markerPosition: { x: 0, y: 0.2, z: -0.36 },
//   },
//   Project_4: {
//     targetName: "Project_4",
//     modalData: [
//       { type: "normal", text: "Project_4: Theatre.js Animations\n" },
//       {
//         type: "error",
//         wrong: "no no",
//         correct: "I enjoy animation and motion design.",
//       },
//     ],
//     markerPosition: { x: -0.38, y: 0.42, z: 0 },
//   },
// };

// // Global video state - shared across all project instances
// let globalVideoState = {
//   currentVideo: null,
//   isVisible: false,
//   listeners: new Set(),
// };

// // Global functions to manage video state
// export function showProjectVideo(projectName) {
//   console.log("📹 SHOW VIDEO:", projectName); // Debug log
//   globalVideoState.currentVideo = projectName;
//   globalVideoState.isVisible = true;
//   globalVideoState.listeners.forEach((listener) => listener(globalVideoState));
// }

// export function hideProjectVideo() {
//   console.log("📹 HIDE VIDEO"); // Debug log
//   globalVideoState.isVisible = false;
//   globalVideoState.listeners.forEach((listener) => listener(globalVideoState));
//   // Clear video after animation
//   setTimeout(() => {
//     globalVideoState.currentVideo = null;
//     globalVideoState.listeners.forEach((listener) =>
//       listener(globalVideoState)
//     );
//   }, 500);
// }

// export function subscribeToVideoState(listener) {
//   globalVideoState.listeners.add(listener);
//   return () => globalVideoState.listeners.delete(listener);
// }

// export default function ProjectInteractable({
//   targetName = "Project_1",
//   scriptData = projectScripts[targetName],
//   activeStep = "intro",
// }) {
//   const shouldBeActive = activeStep === "Workshop";

//   return (
//     <RaycastClickable
//       targetName={scriptData.targetName}
//       activeStep={activeStep}
//       isActive={shouldBeActive}
//       onClick={() => {
//         // Hide video and open modal
//         hideProjectVideo();
//         openModal({ scriptData: scriptData.modalData });
//       }}
//       onPointerEnter={() => {
//         console.log("🎯 HOVER IN:", targetName); // Debug log
//         document.body.style.cursor = "pointer";
//         // Show video for this project
//         showProjectVideo(targetName);
//       }}
//       onPointerLeave={() => {
//         console.log("🎯 HOVER OUT:", targetName); // Debug log
//         document.body.style.cursor = "";
//         // Hide video
//         hideProjectVideo();
//       }}
//       markerPosition={scriptData.markerPosition}
//       markerSize={0.04}
//     />
//   );
// }

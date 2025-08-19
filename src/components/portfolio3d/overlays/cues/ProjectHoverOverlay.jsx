"use client";

import { useRef } from "react";
import { Html } from "@react-three/drei";

const projectScripts = {
  Project_1: {
    title: "Portfolio Website",
    description: "Modern portfolio with smooth animations",
    tech: ["React", "Three.js", "GSAP"],
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
  },
  Project_2: {
    title: "3D Visualization",
    description: "Interactive 3D data visualization",
    tech: ["Three.js", "D3.js", "WebGL"],
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
  },
  Project_3: {
    title: "Interactive Terminal",
    description: "Web-based terminal with custom commands",
    tech: ["TypeScript", "Node.js", "Xterm.js"],
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
  },
  Project_4: {
    title: "Theatre.js Animations",
    description: "Cinematic 3D animations and sequences",
    tech: ["Theatre.js", "Three.js", "React"],
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
  },
};

export default function ProjectHoverOverlay({
  targetName = "Project_1",
  markerPosition = { x: 0, y: 0, z: 0 },
  isHovered = false,
  onVideoRef,
}) {
  const videoRef = useRef(null);
  const projectData = projectScripts[targetName];

  if (!projectData) {
    console.error(`ProjectHoverOverlay: No data for "${targetName}"`);
    return null;
  }

  // Pass video ref to parent component
  if (onVideoRef && videoRef.current !== onVideoRef.current) {
    onVideoRef(videoRef);
  }

  return (
    <>
      {isHovered && (
        <Html
          position={[markerPosition.x, markerPosition.y + 1, markerPosition.z]}
          center={true}
          distanceFactor={20}
          occlude={false}
          zIndexRange={[1000, 0]}
          style={{
            pointerEvents: "none",
          }}
        >
          <div
            className="w-[400px] h-[300px] rounded-2xl shadow-md
                       bg-gradient-to-r from-[#282c34] via-[#1f2227] to-[#282c34]
                       border-2 border-cyan-400"
            style={{
              boxShadow: "0 0 30px rgba(0, 255, 255, 0.8)",
            }}
          >
            {/* Header */}
            <div className="flex items-center h-8 px-4 rounded-t-2xl bg-gray-600 border-b border-[#1e1e1e] select-none">
              <div className="flex gap-2 items-center">
                <span className="w-3 h-3 rounded-full bg-[#fdbc40] border border-[#d9bb7a] shadow-sm" />
                <span className="w-3 h-3 rounded-full bg-[#34c749] border border-[#2da742] shadow-sm" />
              </div>
              <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
                <span className="text-xs text-gray-400 font-mono tracking-wide">
                  {projectData.title}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col items-center justify-center h-[calc(300px-32px)]">
              <video
                ref={videoRef}
                src={projectData.videoUrl}
                width="360"
                height="240"
                loop
                muted
                style={{
                  borderRadius: "8px",
                  objectFit: "cover",
                  border: "1px solid rgba(0, 255, 255, 0.5)",
                }}
              />
              <div
                style={{
                  marginTop: "10px",
                  color: "cyan",
                  fontSize: "14px",
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                {projectData.title}
              </div>
            </div>
          </div>
        </Html>
      )}
    </>
  );
}

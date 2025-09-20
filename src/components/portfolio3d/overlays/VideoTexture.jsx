// "use client";

// import { useRef, useEffect, useState, useMemo } from "react";
// import { useFrame, useThree } from "@react-three/fiber";
// import * as THREE from "three";
// import { subscribeToVideoState } from "../interactables/ProjectInteractable";

// const projectVideos = {
//   Project_1: {
//     src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
//     title: "Portfolio Website Demo",
//     position: [2, 1, 0], // 3D position in world space
//     scale: [1.5, 1, 1],
//   },
//   Project_2: {
//     src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
//     title: "3D Visualization Demo",
//     position: [2.5, 0, 0],
//     scale: [1.5, 1, 1],
//   },
//   Project_3: {
//     src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
//     title: "Interactive Terminal Demo",
//     position: [2, -1, 0],
//     scale: [1.5, 1, 1],
//   },
//   Project_4: {
//     src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
//     title: "Theatre.js Animation Demo",
//     position: [1.5, 1.5, 0],
//     scale: [1.5, 1, 1],
//   },
// };

// export default function VideoTexture() {
//   const meshRef = useRef();
//   const videoRef = useRef();
//   const [videoTexture, setVideoTexture] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [opacity, setOpacity] = useState(0);
//   const [videoState, setVideoState] = useState({
//     currentVideo: null,
//     isVisible: false,
//   });

//   const { camera } = useThree();

//   // Subscribe to global video state
//   useEffect(() => {
//     console.log("🔗 VideoTexture subscribed to global state"); // Debug log
//     return subscribeToVideoState((newState) => {
//       console.log("📡 VideoTexture received state:", newState); // Debug log
//       setVideoState(newState);
//     });
//   }, []);

//   const videoData = videoState.currentVideo
//     ? projectVideos[videoState.currentVideo]
//     : null;

//   // Create video element and texture
//   useEffect(() => {
//     if (!videoData || !videoState.isVisible) {
//       console.log("❌ Video not created:", {
//         hasVideoData: !!videoData,
//         isVisible: videoState.isVisible,
//       });
//       if (videoRef.current) {
//         videoRef.current.pause();
//       }
//       return;
//     }

//     console.log("🎬 Creating video for:", videoState.currentVideo, videoData);
//     setIsLoading(true);

//     const video = document.createElement("video");
//     video.src = videoData.src;
//     video.crossOrigin = "anonymous";
//     video.loop = true;
//     video.muted = true; // Required for autoplay
//     video.playsInline = true;

//     video.addEventListener("canplay", () => {
//       console.log("✅ Video can play:", videoState.currentVideo);
//       setIsLoading(false);
//       video.play().catch((err) => console.warn("Play failed:", err));
//     });

//     video.addEventListener("error", (e) => {
//       console.error("❌ Video error:", e, video.error);
//       setIsLoading(false);
//     });

//     video.addEventListener("ended", () => {
//       console.log("🏁 Video ended:", videoState.currentVideo);
//     });

//     const texture = new THREE.VideoTexture(video);
//     texture.minFilter = THREE.LinearFilter;
//     texture.magFilter = THREE.LinearFilter;

//     console.log("🖼️ Video texture created:", texture);

//     videoRef.current = video;
//     setVideoTexture(texture);

//     return () => {
//       console.log("🧹 Cleaning up video:", videoState.currentVideo);
//       if (video) {
//         video.pause();
//         video.src = "";
//       }
//       if (texture) {
//         texture.dispose();
//       }
//       videoRef.current = null;
//       setVideoTexture(null);
//     };
//   }, [videoData, videoState.isVisible]);

//   // Fade in/out animation
//   useFrame((state, delta) => {
//     if (!meshRef.current) return;

//     const target = videoState.isVisible && !isLoading && videoData ? 1 : 0;
//     const current = meshRef.current.material.opacity;
//     const newOpacity = THREE.MathUtils.lerp(current, target, delta * 5);

//     meshRef.current.material.opacity = newOpacity;
//     setOpacity(newOpacity);

//     // Always face camera (billboard effect)
//     if (videoData) {
//       meshRef.current.lookAt(camera.position);

//       // Subtle floating animation
//       if (videoState.isVisible) {
//         const t = state.clock.elapsedTime;
//         meshRef.current.position.y =
//           videoData.position[1] + Math.sin(t * 2) * 0.05;
//       }
//     }
//   });

//   // Material
//   const material = useMemo(() => {
//     return new THREE.MeshBasicMaterial({
//       map: videoTexture,
//       transparent: true,
//       opacity: 0,
//       side: THREE.DoubleSide,
//     });
//   }, [videoTexture]);

//   if (!videoData) return null;

//   console.log("🎥 VideoTexture render:", {
//     videoData: videoData.title,
//     position: videoData.position,
//     isVisible: videoState.isVisible,
//     hasTexture: !!videoTexture,
//     opacity,
//   });

//   return (
//     <mesh
//       ref={meshRef}
//       position={videoData.position}
//       scale={videoData.scale}
//       material={material}
//     >
//       <planeGeometry args={[1, 0.6]} />

//       {/* Loading indicator */}
//       {isLoading && (
//         <mesh position={[0, 0, 0.01]}>
//           <planeGeometry args={[0.2, 0.2]} />
//           <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
//         </mesh>
//       )}

//       {/* Frame border */}
//       <lineSegments position={[0, 0, 0.005]}>
//         <edgesGeometry args={[new THREE.PlaneGeometry(1, 0.6)]} />
//         <lineBasicMaterial color="#00ffff" transparent opacity={opacity} />
//       </lineSegments>
//     </mesh>
//   );
// }

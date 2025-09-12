"use client";

import Image from "next/image";

export default function IntroScrollWrapper({ activeStep = "intro" }) {
  return (
    <div className="pointer-events-none select-none fixed top-0 left-0 w-full h-full">
      <div
        className={`absolute md:top-[75px] md:-translate-x-1/2  lg:left-[9vw] xl:left-[12vw] left-1/2 top-3/4 -translate-x-1/2 p-3 lg:scale-130 md:scale-115 intro-scroll ${
          activeStep === "intro" ? "active" : "inactive"
        }`}
      >
        <div className="flex flex-col items-center gap-4 text-white/90">
          {/* scroll text */}
          <div className="text-xl font-vt323 tracking-wider text-center whitespace-nowrap">
            <span className=" uppercase bg-gradient-to-r from-white via-white/80 to-white/50 bg-clip-text text-transparent whitespace-nowrap">
              <span className="lg:hidden">Scroll down</span>
              <span className="hidden lg:inline">Use arrow keys</span>
            </span>
          </div>

          {/* Arrow Keys Image for desktop */}
          <div className="hidden lg:block relative">
            {/* Main arrow keys image with up/down animation */}
            <div className="animate-bounce" style={{ animationDuration: "2s" }}>
              <Image
                src="/images/arrrowKeys.png"
                alt="Arrow Keys"
                width={120}
                height={80}
                className="pixelated opacity-85"
                style={{ width: "auto", height: "auto" }}
                priority
              />

              {/* Highlight overlay for up arrow key - moves with image */}
              <div
                className="absolute top-0 left-1/2 transform -translate-x-1/2 w-10 h-10 border-2 border-cyan-500 rounded animate-pulse scale-80"
                style={{
                  boxShadow:
                    "0 0 10px rgba(34, 211, 238, 0.6), inset 0 0 10px rgba(34, 211, 238, 0.2)",
                }}
              ></div>
            </div>
          </div>

          {/* scroll indicator - only for mobile/tablet */}
          <div className="relative lg:hidden">
            <div className="absolute inset-0 w-12 h-16 rounded-full bg-gradient-to-b from-cyan-400/20 to-purple-600/20 blur-sm animate-pulse" />

            <div className="relative w-12 h-16 rounded-full border-2 border-white/60 bg-black/20 backdrop-blur-sm flex items-start justify-center p-2">
              <div className="w-2 h-3 rounded-full bg-gradient-to-b from-cyan-400 to-blue-500 animate-bounce shadow-lg" />

              <div
                className="absolute bottom-3 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-white/40 animate-ping"
                style={{ animationDelay: "0.5s" }}
              />
            </div>

            <div
              className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-white/60 animate-bounce"
              style={{ animationDelay: "0.2s" }}
            />
            <div
              className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white/60 animate-bounce"
              style={{ animationDelay: "0.7s" }}
            />
          </div>

          {/* animated dots - only for mobile/tablet */}
          <div className="flex gap-2 mt-2 scale-190 lg:hidden">
            <div className="w-1 h-1 rounded-full bg-cyan-300 animate-pulse" />
            <div
              className="w-1 h-1 rounded-full bg-blue-300 animate-pulse"
              style={{ animationDelay: "0.3s" }}
            />
            <div
              className="w-1 h-1 rounded-full bg-purple-500 animate-pulse"
              style={{ animationDelay: "0.6s" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

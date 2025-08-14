export default function IntroScroll() {
  return (
    <div className="pointer-events-none select-none">
      <div className="backdrop-blur-xs border border-white/30 rounded-md absolute left-[90vw] top-[650px] -translate-x-1/2 z-[9999] p-3">
        <div className="flex flex-col items-center gap-4 text-white/90">
          {/* Main scroll text with enhanced styling */}
          <div className="text-3xl font-vt323 tracking-wider text-center whitespace-nowrap">
            <span className="bg-gradient-to-r from-white via-white/80 to-white/50 bg-clip-text text-transparent whitespace-nowrap">
              Scroll down
            </span>
          </div>

          {/* Enhanced scroll indicator with multiple elements */}
          <div className="relative">
            {/* Outer glow ring */}
            <div className="absolute inset-0 w-12 h-16 rounded-full bg-gradient-to-b from-cyan-400/20 to-purple-600/20 blur-sm animate-pulse" />

            {/* Main scroll container */}
            <div className="relative w-12 h-16 rounded-full border-2 border-white/60 bg-black/20 backdrop-blur-sm flex items-start justify-center p-2">
              {/* Animated scroll dot */}
              <div className="w-2 h-3 rounded-full bg-gradient-to-b from-cyan-400 to-blue-500 animate-bounce shadow-lg" />

              {/* Decorative dots */}
              <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-white/40 animate-ping" />
              <div
                className="absolute bottom-3 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-white/40 animate-ping"
                style={{ animationDelay: "0.5s" }}
              />
            </div>

            {/* Arrow indicators */}
            <div
              className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-white/60 animate-bounce"
              style={{ animationDelay: "0.2s" }}
            />
            <div
              className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white/60 animate-bounce"
              style={{ animationDelay: "0.7s" }}
            />
          </div>

          {/* Additional creative elements */}
          <div className="flex gap-2 mt-2">
            <div className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse" />
            <div
              className="w-1 h-1 rounded-full bg-blue-500 animate-pulse"
              style={{ animationDelay: "0.3s" }}
            />
            <div
              className="w-1 h-1 rounded-full bg-purple-600 animate-pulse"
              style={{ animationDelay: "0.6s" }}
            />
          </div>

          {/* Start Journey text */}
          <div className="text-lg font-vt323 text-center text-white/80 tracking-wide mt-2 whitespace-nowrap">
            Start Journey
          </div>
        </div>
      </div>
    </div>
  );
}

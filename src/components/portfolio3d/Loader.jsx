import { useProgress } from "@react-three/drei";
import { useEffect, useState } from "react";

export default function Loader() {
  const { active, progress } = useProgress();
  const [fakeProgress, setFakeProgress] = useState(0);

  // سقف fake progress مثلا 40
  const fakeLimit = 83;

  useEffect(() => {
    if (active) {
      const interval = setInterval(() => {
        setFakeProgress((prev) => {
          if (prev < fakeLimit) {
            return prev + 2; // سرعت پر شدن fake
          }
          return prev;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [active]);

  // انتخاب بین fake و real progress
  const displayProgress =
    progress < fakeLimit ? Math.max(progress, fakeProgress) : progress;

  const totalBlocks = 20;
  const filledBlocks = Math.round((displayProgress / 100) * totalBlocks);

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-black z-50 transition-opacity duration-500 ${
        active ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="flex flex-col items-center">
        {/* متن LOADING */}
        <div className="text-cyan-100 text-2xl xs:text-3xl sm:text-4xl md:text-6xl font-[vt323] tracking-widest mb-6 animate-pulse">
          LOADING
        </div>

        {/* Progress bar شبیه ویندوز 98 */}
        <div className="flex items-center gap-4">
          <div className="flex gap-0.5 p-0.5 border-2 border-cyan-300 bg-black rounded">
            {Array.from({ length: totalBlocks }).map((_, i) => (
              <div
                key={i}
                className={`w-2 h-3 xs:w-3 xs:h-4 sm:w-4 sm:h-6 md:w-5 md:h-7 border border-cyan-500 ${
                  i < filledBlocks
                    ? "bg-cyan-200 animate-[glitch_1s_infinite]"
                    : "bg-black"
                }`}
              ></div>
            ))}
          </div>
          {/* درصد */}
          {/* <div className="text-cyan-200 font-[vt323] text-xl md:text-2xl">
            {Math.round(displayProgress)}%
          </div> */}
        </div>
      </div>

      {/* keyframes glitch */}
      <style jsx>{`
        @keyframes glitch {
          0% {
            opacity: 1;
          }
          20% {
            opacity: 0.7;
          }
          40% {
            opacity: 1;
          }
          60% {
            opacity: 0.8;
          }
          80% {
            opacity: 1;
          }
          100% {
            opacity: 0.9;
          }
        }
      `}</style>
    </div>
  );
}

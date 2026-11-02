"use client";

import { useEffect, useRef, useState } from "react";
import { loadingProgress } from "./loading/sceneLoader";

const totalBlocks = 20;

// ---------------------------------------------------------------------------
// Fake fill (the original idea): it fills on its own so users see movement right
// away. Two speeds: a quick push (~40% in 2s), then a slow creep toward fakeLimit
// that keeps adding blocks for ~30s, so slow connections never look frozen.
// The real progress (download bytes -> decoding -> GPU warm-up) takes over as
// soon as it gets ahead of the fake one, and only real "ready" reaches 100%.
// ---------------------------------------------------------------------------
const fakeLimit = 83; // fake progress limit (%)
const fakeQuick = 40; // % filled by the quick push
const fakeProgressAt = (seconds) =>
  fakeQuick * (1 - Math.exp(-seconds / 1.2)) +
  (fakeLimit - fakeQuick) * (1 - Math.exp(-seconds / 12));
// seconds (after first paint) at which the fake fill reaches block i
function fakeBlockTime(i) {
  const percent = (i + 1) * (100 / totalBlocks);
  let low = 0;
  let high = 120;
  for (let step = 0; step < 32; step++) {
    const middle = (low + high) / 2;
    if (fakeProgressAt(middle) < percent) low = middle;
    else high = middle;
  }
  return high;
}

// Until React hydrates, plain CSS animations fill the first blocks on the same
// curve, so the bar is already moving on the very first paint.
const preHydrationBlocks = 10;
function preHydrationStyle(i) {
  if (i > preHydrationBlocks) return undefined;
  const blinkFrom = i === 0 ? 0 : fakeBlockTime(i - 1);
  const blink = `loader-blink 0.9s ease-in-out ${blinkFrom.toFixed(2)}s infinite`;
  if (i === preHydrationBlocks) return { animation: blink };
  const fill = `loader-fill 0.15s ease-out ${fakeBlockTime(i).toFixed(2)}s forwards`;
  return { animation: `${blink}, ${fill}` };
}
const preHydrationStyles = Array.from({ length: totalBlocks }, (_, i) =>
  preHydrationStyle(i),
);

// Real progress: 0-80 bytes downloaded, 80-88 decoding, 88-98 GPU warm-up, 100 on screen
function realProgressAt(now, assetBytes, memo) {
  const { assets, warmup, ready } = loadingProgress;
  if (ready) return 100;
  if (warmup > 0) return 88 + 10 * warmup;
  const list = Object.entries(assets);
  if (list.every(([, asset]) => asset.parsed)) return 88;

  let loaded = 0;
  let total = 0;
  for (const [key, asset] of list) {
    const size = assetBytes?.[key] || asset.total;
    if (!size) return 0; // unknown size -> fake fill only
    total += size;
    loaded += asset.parsed ? size : Math.min(asset.loaded, size);
  }
  if (loaded < total) return 80 * (loaded / total);

  // everything downloaded, Draco + textures are decoding: keep creeping
  if (!memo.decodeStart) memo.decodeStart = now;
  return 80 + 7 * (1 - Math.exp(-(now - memo.decodeStart) / 1500));
}

// terminal-style status lines, they walk through the tour while the bar fills
const tourLines = [
  "unlocking the gate",
  "finding the key",
  "watering the plants",
  "tuning the setar",
  "warming up the gym",
  "charging up the lab",
  "polishing the workshop",
];
const tourStepMs = 650; // a stop is shown at least this long, the tour never skips one
const slowHintAfter = 12; // seconds, then show a reassurance line

function statusLine(tourIndex, real, isReady) {
  if (isReady) return "welcome in, traveler";
  if (loadingProgress.warmup > 0) return "turning on the lights";
  if (real >= 80) return "building the house";
  return tourLines[tourIndex];
}

export default function Loader({ ready = false, error = null, assetBytes }) {
  // live = the rAF loop has computed the bar at least once. Until then (server
  // render, hydration) the CSS animations keep filling it, so it never jumps back.
  const [view, setView] = useState({
    live: false,
    filled: 0,
    percent: 0,
    line: tourLines[0],
    slow: false,
  });
  // loading -> complete (100%, short pause) -> leaving (fade out) -> done
  const [phase, setPhase] = useState("loading");
  const readyRef = useRef(ready);

  useEffect(() => {
    readyRef.current = ready;
  }, [ready]);

  // one rAF loop drives the bar, React only re-renders when something visible changes
  useEffect(() => {
    if (error) return; // keep the bar where it stopped
    let frame = 0;
    const startedAt = performance.now();
    const memo = {
      // start where the CSS fill already is (same curve), never jump back to 0
      display: fakeProgressAt(startedAt / 1000),
      decodeStart: 0,
      last: "",
      lastTick: startedAt,
      tour: 0,
      tourAt: startedAt,
    };

    const tick = () => {
      const now = performance.now();
      const isReady = readyRef.current;
      const real = realProgressAt(now, assetBytes, memo);
      // choose between fake and real progress (only real "ready" may hit 100)
      const target = isReady
        ? 100
        : Math.min(99, Math.max(fakeProgressAt(now / 1000), real));
      // time based easing: same speed at 120fps or on a phone stuck at 5fps
      const blend =
        1 - Math.exp(-(now - memo.lastTick) / (isReady ? 90 : 160));
      memo.lastTick = now;
      const eased = memo.display + (target - memo.display) * blend;
      memo.display =
        target - eased < 0.4 ? target : Math.max(memo.display, eased);

      const filled = Math.floor((memo.display / 100) * totalBlocks);
      // the tour follows the bar (0-80%), one stop at a time
      const tourTarget = Math.min(
        tourLines.length - 1,
        Math.floor((memo.display / 80) * tourLines.length),
      );
      if (tourTarget > memo.tour && now - memo.tourAt > tourStepMs) {
        memo.tour += 1;
        memo.tourAt = now;
      }
      const line = statusLine(memo.tour, real, isReady);
      const slow = !isReady && now / 1000 > slowHintAfter;
      const key = `${filled}|${line}|${slow}`;
      if (key !== memo.last) {
        memo.last = key;
        setView({
          live: true,
          filled,
          percent: Math.round(memo.display),
          line,
          slow,
        });
      }

      if (isReady && memo.display >= 100) {
        setPhase("complete");
        return;
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [assetBytes, error]);

  // a short beat on the full bar, then fade out to the already rendered house
  useEffect(() => {
    if (phase === "complete") {
      const timer = setTimeout(() => setPhase("leaving"), 380);
      return () => clearTimeout(timer);
    }
    if (phase === "leaving") {
      const timer = setTimeout(() => setPhase("done"), 1200);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  if (phase === "done") return null;

  const leaving = phase === "leaving";
  const errorText = error
    ? /webgl/i.test(String(error?.message))
      ? "this browser couldn't start WebGL"
      : "couldn't load the 3D world"
    : null;

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-black z-[1100] transition-opacity duration-[1100ms] ease-in-out ${
        leaving ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      aria-hidden={leaving || undefined}
    >
      <div
        className={`flex flex-col items-center transition-[opacity,transform] duration-500 ease-out ${
          leaving ? "opacity-0 scale-105" : "opacity-100 scale-100"
        }`}
      >
        {/* LOADING text */}
        <div className="text-cyan-100 text-2xl xs:text-3xl sm:text-4xl md:text-6xl font-[vt323] tracking-widest mb-6 animate-pulse">
          LOADING
        </div>

        {/* progress bar like windows 98 */}
        <div className="flex items-center gap-4">
          <div
            className="relative overflow-hidden flex gap-0.5 p-0.5 border-2 border-cyan-300 bg-black rounded"
            role="progressbar"
            aria-label="Loading the 3D world"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={view.percent}
          >
            {Array.from({ length: totalBlocks }).map((_, i) => {
              let state = "";
              if (view.live) {
                if (i < view.filled) state = "is-on";
                else if (i === view.filled && !error) state = "is-next";
              }
              return (
                <div
                  key={i}
                  className="relative w-2 h-3 xs:w-3 xs:h-4 sm:w-4 sm:h-6 md:w-5 md:h-7 border border-cyan-500 bg-black"
                >
                  <span
                    className={`loader-block-fill bg-cyan-200 ${state}`}
                    style={view.live ? undefined : preHydrationStyles[i]}
                  />
                </div>
              );
            })}
            {!error && phase === "loading" && (
              <span className="loader-sweep" aria-hidden />
            )}
          </div>
          {/* percentage */}
          {/* <div className="text-cyan-200 font-[vt323] text-xl md:text-2xl">
            {view.percent}%
          </div> */}
        </div>

        {/* terminal status line */}
        <div className="mt-5 min-h-7 flex flex-col items-center font-[vt323] tracking-wider text-lg md:text-2xl">
          {errorText ? (
            <>
              <p className="text-rose-300/90">&gt; {errorText}</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-3 px-4 py-1 border-2 border-cyan-300 text-cyan-100 rounded hover:bg-cyan-200 hover:text-black transition-colors cursor-pointer"
              >
                [ RETRY ]
              </button>
            </>
          ) : (
            <p className="text-cyan-200/75">
              &gt; {view.line}
              <span className="loader-caret">_</span>
            </p>
          )}
          {view.slow && !errorText && (
            <p className="mt-1 text-sm md:text-lg text-cyan-200/40">
              first visit takes a moment, it&apos;s worth the wait
            </p>
          )}
          <noscript>
            <p className="mt-1 text-sm md:text-lg text-cyan-200/60">
              enable JavaScript to step inside
            </p>
          </noscript>
        </div>
      </div>
    </div>
  );
}

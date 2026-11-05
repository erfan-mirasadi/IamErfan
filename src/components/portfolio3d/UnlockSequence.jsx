"use client";

import { useEffect, useRef, useState } from "react";
import TerminalPrompt from "./TerminalPrompt";

// First visit only: after "Access granted" the door terminal "installs" the house in a
// fast log (sudo + brew/npm + boot-log vibe), then the window closes by itself.
const PLAYED_KEY = "iamerfan:door-unlock-played";
const HOLD_AFTER_MS = 900; // last line stays a moment before the window closes
const BAR_WIDTH = 16;

let playedThisVisit = false; // backup when storage is blocked (private mode etc.)

export function shouldPlayUnlock() {
  if (playedThisVisit) return false;
  try {
    return window.localStorage.getItem(PLAYED_KEY) !== "1";
  } catch {
    return true;
  }
}

function markPlayed() {
  playedThisVisit = true;
  try {
    window.localStorage.setItem(PLAYED_KEY, "1");
  } catch {
    // nothing to do, playedThisVisit still keeps it to once
  }
}

// a few lines of "binary" scrolling by, same bytes on every visit
function hexBurst(seed, count, steps) {
  let state = seed;
  const byte = () => {
    state = (state * 1103515245 + 12345) % 2147483648;
    return (state >> 16) & 0xff;
  };
  for (let i = 0; i < count; i++) {
    const offset = ((seed * 7 + i) * 16).toString(16).padStart(4, "0");
    const bytes = Array.from({ length: 8 }, () => byte().toString(16).padStart(2, "0"));
    steps.push({ text: `  0x${offset}: ${bytes.join(" ")}`, tone: "hex", wait: 18 });
  }
}

// one step = one printed line, or a progress bar that fills in place (frames)
const STEPS = (() => {
  const steps = [];
  const line = (text, tone, wait) => steps.push({ text, tone, wait });
  const bar = (text, frames, wait) => steps.push({ text, tone: "out", frames, wait });

  line("sudo unlock --door front --as traveler", "cmd", 140);
  line("Password: ********", "dim", 170);
  line("verifying access token ......... ok", "out", 70);
  line("==> resolving dependencies", "bright", 60);
  line("+ curiosity@latest", "out", 35);
  line("+ three@0.183.0", "out", 35);
  line("+ @react-three/fiber@9", "out", 35);
  line("+ @theatre/core@0.7", "out", 35);
  line("+ coffee@latest", "out", 60);
  bar("fetching erfan/life-story", 16, 28);
  hexBurst(11, 6, steps);
  line("==> unpacking memories.tar.gz", "bright", 60);
  line("[  OK  ] mounted /home/erfan/garden", "out", 40);
  line("[  OK  ] mounted /home/erfan/art", "out", 40);
  line("[  OK  ] mounted /home/erfan/gym", "out", 40);
  line("[  OK  ] mounted /home/erfan/skills", "out", 40);
  line("[  OK  ] mounted /home/erfan/workshop", "out", 60);
  line("sha256 9f2c41e7...a03d  verified", "dim", 60);
  bar("building the house", 12, 30);
  hexBurst(29, 4, steps);
  line("0 vulnerabilities, 1 traveler found", "out", 130);
  line("door unlocked. welcome in, traveler", "bright", 160);
  line("", "prompt", 0);
  return steps;
})();

// every frame of the log: which step is the newest one, and how full its bar is
const TICKS = STEPS.flatMap((step, index) =>
  step.frames
    ? Array.from({ length: step.frames + 1 }, (_, frame) => ({
        index,
        fill: frame / step.frames,
        wait: frame === step.frames ? 60 : step.wait,
      }))
    : [{ index, fill: 1, wait: step.wait }],
);

function stepText(step, fill) {
  if (!step.frames) return step.text;
  const filled = Math.round(fill * BAR_WIDTH);
  const percent = String(Math.round(fill * 100)).padStart(3, " ");
  return `${step.text} [${"#".repeat(filled)}${".".repeat(BAR_WIDTH - filled)}] ${percent}%`;
}

// cmd / prompt lines start with the zsh prompt, the rest is plain command output
const TONES = {
  cmd: "",
  prompt: "",
  out: "",
  bright: "is-bright",
  dim: "is-dim",
  hex: "is-hex",
};

export default function UnlockSequence({ onFinish }) {
  const [tick, setTick] = useState(0);
  // the parent's close handler changes every render: keep the latest without
  // restarting the log
  const finishRef = useRef(onFinish);
  useEffect(() => {
    finishRef.current = onFinish;
  });

  useEffect(() => {
    const last = tick >= TICKS.length - 1;
    if (last) markPlayed();
    const timer = setTimeout(
      () => (last ? finishRef.current?.() : setTick(tick + 1)),
      last ? HOLD_AFTER_MS : TICKS[tick].wait,
    );
    return () => clearTimeout(timer);
  }, [tick]);

  const { index, fill } = TICKS[tick];
  const done = tick >= TICKS.length - 1;

  return (
    <div
      className="unlock-log flex flex-col justify-end overflow-hidden"
      aria-hidden="true"
    >
      {STEPS.slice(0, index + 1).map((step, i) => (
        <div key={i} className={`truncate whitespace-pre ${TONES[step.tone]}`}>
          {(step.tone === "cmd" || step.tone === "prompt") && <TerminalPrompt />}
          {stepText(step, i < index ? 1 : fill)}
          {i === index && <span className={done ? "animate-pulse" : ""}>█</span>}
        </div>
      ))}
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import type { Vibrate } from "@/lib/demo/timeline";

const NAME: Record<Vibrate, string> = {
  left: "বামে ঘুরুন",
  right: "ডানে ঘুরুন",
  stop: "থামুন",
  short: "সতর্কতা",
};

// Pulse lengths in ms, mirrored in lib/demo/audio.ts (VIBRATE_MS).
const PULSES: Record<Vibrate, number[]> = {
  left: [300, 300],
  right: [300, 300, 300],
  stop: [900],
  short: [250],
};

/** Shows the phone "buzzing" with the pattern name and the pulse pattern as bars. */
export default function VibrationIndicator({ pattern, id }: { pattern: Vibrate | null; id?: string }) {
  const on = pattern !== null;
  return (
    <div
      role="status"
      aria-label={pattern ? `কম্পন: ${NAME[pattern]}` : "কম্পন বন্ধ"}
      className="flex w-[104px] flex-col items-center gap-2"
    >
      <motion.div
        key={id ?? "idle"}
        animate={on ? { x: [0, -4, 4, -4, 4, 0] } : { x: 0 }}
        transition={{ duration: 0.4, repeat: on ? 3 : 0 }}
        className={`flex size-[72px] items-center justify-center rounded-full ${
          on ? "bg-accent text-ink" : "bg-card text-muted backdrop-blur-md"
        }`}
      >
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <rect x="8" y="3" width="8" height="18" rx="2" />
          <path d="M4 8v8M20 8v8M1.5 10.5v3M22.5 10.5v3" />
        </svg>
      </motion.div>
      <div className="flex h-2 items-center gap-1">
        {(pattern ? PULSES[pattern] : []).map((ms, i) => (
          <span key={i} className="h-2 rounded-full bg-accent" style={{ width: ms / 20 }} />
        ))}
      </div>
      <div className="h-7 text-lg font-semibold leading-7 text-accent">{pattern ? NAME[pattern] : ""}</div>
    </div>
  );
}

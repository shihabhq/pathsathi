"use client";

import { motion } from "framer-motion";

export type WaveMode = "idle" | "listening" | "speaking";

const LABELS: Record<WaveMode, string> = {
  idle: "অপেক্ষা করছে",
  listening: "শুনছে",
  speaking: "বলছে",
};

const BARS = 13;

/** Pulsing ring with animated bars. Yellow while the agent speaks, white while it listens. */
export default function Waveform({ mode }: { mode: WaveMode }) {
  const active = mode !== "idle";
  const color = mode === "speaking" ? "#FFD60A" : "#FFFFFF";

  return (
    <div
      role="status"
      aria-label={LABELS[mode]}
      className="relative flex size-44 items-center justify-center"
    >
      {active &&
        [0, 1].map((i) => (
          <motion.span
            key={`${mode}-${i}`}
            className="absolute inset-0 rounded-full border-2"
            style={{ borderColor: color }}
            initial={{ scale: 0.7, opacity: 0.6 }}
            animate={{ scale: 1.25, opacity: 0 }}
            transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.9, ease: "easeOut" }}
          />
        ))}
      <div
        className="flex size-36 items-center justify-center gap-[5px] rounded-full bg-card transition-shadow duration-300"
        style={{
          boxShadow: active ? `0 0 60px ${color}55, inset 0 0 0 2px ${color}` : "inset 0 0 0 2px #3a3a3c",
        }}
      >
        {Array.from({ length: BARS }, (_, i) => {
          const centre = 1 - Math.abs(i - (BARS - 1) / 2) / (BARS / 2);
          const peak = 0.35 + 0.65 * centre;
          return (
            <motion.span
              key={i}
              className="w-[5px] rounded-full"
              style={{ height: 56, background: active ? color : "#636366" }}
              animate={active ? { scaleY: [0.15, peak, 0.3, peak * 0.8, 0.15] } : { scaleY: 0.1 }}
              transition={
                active
                  ? { duration: 0.9 + (i % 5) * 0.11, repeat: Infinity, delay: i * 0.04, ease: "easeInOut" }
                  : { duration: 0.3 }
              }
            />
          );
        })}
      </div>
    </div>
  );
}

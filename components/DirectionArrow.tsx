"use client";

import { motion } from "framer-motion";
import type { Severity, Vibrate } from "@/lib/demo/timeline";

const ROTATE: Record<Vibrate, number> = { left: -90, right: 90, short: 0, stop: 0 };
const ARIA: Record<Vibrate, string> = {
  left: "বামে ঘুরুন",
  right: "ডানে ঘুরুন",
  stop: "থামুন",
  short: "সোজা এগোন",
};

/** Big direction cue. Points ahead by default, turns left/right, or shows a stop square. */
export default function DirectionArrow({
  pattern,
  severity,
}: {
  pattern: Vibrate | null;
  severity: Severity | null;
}) {
  const dir = pattern ?? "short";
  const colour = severity === "danger" ? "#FF453A" : "#3DA9FC";
  return (
    <motion.div
      role="img"
      aria-label={ARIA[dir]}
      animate={{ rotate: ROTATE[dir], backgroundColor: colour }}
      transition={{ duration: 0.3 }}
      className="flex size-[88px] items-center justify-center rounded-full shadow-[0_6px_24px_rgba(0,0,0,0.5)]"
    >
      {dir === "stop" ? (
        <svg width="36" height="36" viewBox="0 0 24 24" fill="#05070D">
          <rect x="4" y="4" width="16" height="16" rx="3" />
        </svg>
      ) : (
        <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#05070D" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20V5M5 11l7-7 7 7" />
        </svg>
      )}
    </motion.div>
  );
}

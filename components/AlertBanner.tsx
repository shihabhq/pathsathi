"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { TimelineEntry } from "@/lib/demo/timeline";

const STYLE = {
  danger: "bg-danger text-white",
  warn: "bg-accent text-black",
  info: "bg-white text-black",
} as const;

/** Top alert banner. The wrapper is an assertive live region so screen readers announce it. */
export default function AlertBanner({ entry }: { entry: TimelineEntry | null }) {
  return (
    <div aria-live="assertive" role="alert" className="pointer-events-none">
      <AnimatePresence mode="wait">
        {entry && (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: -24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
            className={`rounded-3xl px-5 py-4 text-[30px] font-bold leading-tight shadow-[0_8px_32px_rgba(0,0,0,0.5)] ${STYLE[entry.severity]}`}
          >
            {entry.say}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

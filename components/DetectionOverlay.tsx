"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { Severity, TimelineEntry } from "@/lib/demo/timeline";

const COLOR: Record<Severity, string> = {
  danger: "#FF453A",
  warn: "#FFD60A",
  info: "#FFFFFF",
};

/**
 * Bounding box with a label chip. Lives inside the video-sized wrapper, so the
 * relative box coordinates line up with the picture, not the phone screen.
 */
export default function DetectionOverlay({ entry }: { entry: TimelineEntry | null }) {
  return (
    <AnimatePresence>
      {entry && (
        <motion.div
          key={entry.id}
          aria-hidden
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="absolute rounded-2xl"
          style={{
            left: `${entry.box[0] * 100}%`,
            top: `${entry.box[1] * 100}%`,
            width: `${entry.box[2] * 100}%`,
            height: `${entry.box[3] * 100}%`,
            border: `4px solid ${COLOR[entry.severity]}`,
            background: `${COLOR[entry.severity]}1f`,
            boxShadow: `0 0 24px ${COLOR[entry.severity]}66`,
          }}
        >
          <span
            className="absolute bottom-full left-[-4px] mb-2 whitespace-nowrap rounded-full px-3 py-1 text-xl font-bold text-black"
            style={{ background: COLOR[entry.severity] }}
          >
            {entry.label}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

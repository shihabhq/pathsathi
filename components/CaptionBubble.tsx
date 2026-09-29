"use client";

import { motion } from "framer-motion";

/** Live caption. Agent bubbles sit left in a dark card, user bubbles right in yellow. */
export default function CaptionBubble({ who, text }: { who: "agent" | "user"; text: string }) {
  const agent = who === "agent";
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`flex flex-col gap-1 ${agent ? "items-start" : "items-end"}`}
    >
      <span className="px-2 text-base font-medium text-muted">{agent ? "পথসাথী" : "আপনি"}</span>
      <p
        className={`max-w-[88%] rounded-3xl px-5 py-4 text-[22px] font-medium leading-snug ${
          agent ? "rounded-tl-md bg-card text-white backdrop-blur-md" : "rounded-tr-md bg-accent text-ink"
        }`}
      >
        {text}
      </p>
    </motion.div>
  );
}

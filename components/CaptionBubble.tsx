"use client";

import { motion } from "framer-motion";

/** Small PathSathi mark (the app icon: two rings and a yellow centre) shown beside agent bubbles. */
function AgentIcon() {
  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 36 36"
      aria-hidden
      className="shrink-0 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.35)]"
    >
      <circle cx="18" cy="18" r="17.5" fill="#0A1A3F" stroke="rgba(255,255,255,0.35)" />
      <circle cx="18" cy="18" r="12.5" fill="none" stroke="#3DA9FC" strokeWidth="2.5" />
      <circle cx="18" cy="18" r="6.5" fill="none" stroke="#3DA9FC" strokeWidth="2.5" />
      <circle cx="18" cy="18" r="2.6" fill="#FFD60A" />
    </svg>
  );
}

// Speaker labels sit in normal flow above the bubble (never overlapping it). The soft text shadow
// keeps them readable over bright video.
const LABEL = "px-1 text-base font-semibold text-muted [text-shadow:0_1px_4px_rgba(5,7,13,0.7)]";

/**
 * Live caption.
 * Agent: white bubble, dark text, 4px blue left border, soft shadow, flat top-left corner,
 * PathSathi icon on the left and the "পথসাথী" label above the bubble.
 * User: blue bubble, white text, flat top-right corner, "আপনি" label above.
 */
export default function CaptionBubble({ who, text }: { who: "agent" | "user"; text: string }) {
  const agent = who === "agent";
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`flex w-full items-start gap-2 ${agent ? "justify-start" : "justify-end"}`}
    >
      {agent && (
        // Pushed down by the label's height so the icon lines up with the bubble, not the label.
        <div className="mt-7.5">
          <AgentIcon />
        </div>
      )}
      <div className={`flex min-w-0 max-w-[85%] flex-col gap-1.5 ${agent ? "items-start" : "items-end"}`}>
        <span className={LABEL}>{agent ? "পথসাথী" : "আপনি"}</span>
        <p
          className={`px-6 py-4 text-[22px] font-medium leading-snug ${
            agent
              ? "rounded-3xl rounded-tl-none border-l-4 border-[#3DA9FC] bg-white text-[#0A1A3F] shadow-[0_8px_24px_rgba(5,7,13,0.35)]"
              : "rounded-3xl rounded-tr-none bg-bubble-user text-white shadow-[0_4px_16px_rgba(0,0,0,0.25)]"
          }`}
        >
          {text}
        </p>
      </div>
    </motion.div>
  );
}

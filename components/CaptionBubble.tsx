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

/**
 * Live caption. Agent: light bubble, PathSathi icon on the left, flat top-left corner.
 * User: blue bubble, white text, flat top-right corner.
 */
export default function CaptionBubble({ who, text }: { who: "agent" | "user"; text: string }) {
  const agent = who === "agent";
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`flex w-full flex-col gap-1 ${agent ? "items-start" : "items-end"}`}
    >
      {!agent && <span className="px-2 text-base font-medium text-muted">আপনি</span>}
      <div className={`flex w-full items-start gap-2 ${agent ? "justify-start" : "justify-end"}`}>
        {agent && <AgentIcon />}
        <p
          className={`min-w-0 max-w-[85%] px-6 py-4 text-[22px] font-medium leading-snug shadow-[0_4px_16px_rgba(0,0,0,0.25)] ${
            agent
              ? "rounded-3xl rounded-tl-none bg-bubble-agent text-[#0A1A3F]"
              : "rounded-3xl rounded-tr-none bg-bubble-user text-white"
          }`}
        >
          {agent && <span className="sr-only">পথসাথী: </span>}
          {text}
        </p>
      </div>
    </motion.div>
  );
}

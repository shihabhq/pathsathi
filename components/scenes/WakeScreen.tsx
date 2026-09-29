"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import CaptionBubble from "../CaptionBubble";
import Waveform from "../Waveform";
import type { Step } from "@/lib/demo/scenes";

// Real clock and date in Bangla digits and month names (12-hour, no AM/PM).
function bnClock(now: Date) {
  const time = new Intl.DateTimeFormat("bn-BD", { hour: "numeric", minute: "2-digit", hourCycle: "h12" })
    .formatToParts(now)
    .filter((p) => p.type !== "dayPeriod")
    .map((p) => p.value)
    .join("")
    .trim();
  const date = new Intl.DateTimeFormat("bn-BD", { weekday: "long", day: "numeric", month: "long" }).format(now);
  return { time, date };
}

const BREATH_S = 3; // one slow breath of the idle glow

/** Scene 0: near-black home screen. A glowing orb waits for the wake word "পথসাথী". */
export default function WakeScreen({ step }: { step: Step }) {
  const waking = step.id === "wake";
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 10_000);
    return () => clearInterval(id);
  }, []);
  const { time, date } = bnClock(now);

  return (
    <div className="flex h-full flex-col items-center bg-linear-to-b from-[#0A1A3F] to-[#05070D] px-6 pb-10 pt-20">
      <div className="text-center">
        <div className="text-[76px] font-medium leading-none text-white/90">{time}</div>
        <div className="mt-3 text-xl text-muted">{date}</div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="relative flex items-center justify-center">
          {/* Glow: breathes slowly while idle, brighter and larger when the wake word lands */}
          <motion.div
            aria-hidden
            key={waking ? "wake" : "idle"}
            className="absolute size-85 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(61,169,252,0.6) 0%, rgba(61,169,252,0.22) 42%, rgba(61,169,252,0) 70%)",
              filter: "blur(6px)",
            }}
            initial={false}
            animate={
              waking
                ? { opacity: [0.9, 1, 0.9], scale: [1.18, 1.3, 1.18] }
                : { opacity: [0.3, 0.6, 0.3], scale: [0.94, 1.06, 0.94] }
            }
            transition={{ duration: waking ? 1.2 : BREATH_S, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            animate={{ scale: waking ? 1.06 : 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 18 }}
          >
            <Waveform mode={waking ? "listening" : "idle"} />
          </motion.div>
        </div>

        <motion.p
          animate={{ opacity: waking ? 0 : 1 }}
          transition={{ duration: 0.3 }}
          className="mt-8 text-[18px] text-muted"
        >
          “পথসাথী” বলুন
        </motion.p>

        <div aria-live="polite" className="mt-6 min-h-28 w-full">
          {step.line && <CaptionBubble who={step.line.who} text={step.line.text} />}
        </div>
      </div>
    </div>
  );
}

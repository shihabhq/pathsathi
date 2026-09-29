"use client";

import { motion } from "framer-motion";
import CaptionBubble from "../CaptionBubble";
import Waveform from "../Waveform";
import type { Step } from "@/lib/demo/scenes";

/** Scene 0: dark phone home screen. The user says the wake word. */
export default function WakeScreen({ step }: { step: Step }) {
  const waking = step.id === "wake";
  return (
    <div className="flex h-full flex-col items-center bg-ink px-6 pb-10 pt-20">
      <div className="text-center">
        <div className="text-[76px] font-medium leading-none text-white/90">৯:৪১</div>
        <div className="mt-3 text-xl text-muted">সোমবার, ৩০ জুন</div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-8">
        <motion.div
          animate={waking ? { opacity: 1, scale: 1 } : { opacity: 0.55, scale: 0.9 }}
          transition={{ duration: 0.3 }}
        >
          <Waveform mode={waking ? "listening" : "idle"} />
        </motion.div>
        <div aria-live="polite" className="min-h-28 w-full">
          {step.line && <CaptionBubble who={step.line.who} text={step.line.text} />}
        </div>
      </div>
    </div>
  );
}

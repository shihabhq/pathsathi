"use client";

import { motion } from "framer-motion";
import { toBn } from "@/lib/demo/format";
import { DESTINATION_NAME } from "@/lib/demo/route";
import type { Step } from "@/lib/demo/scenes";
import { TIMELINE } from "@/lib/demo/timeline";


// Same numbers the agent gave in the route summary.
const SUMMARY = [
  { label: "সময়", value: "১৮ মিনিট" },
  { label: "দূরত্ব", value: "১.২ কিলোমিটার" },
  { label: "সতর্কতা", value: `${toBn(TIMELINE.length)} বার` },
];

/** Scene 5: green check, arrival line and trip summary card. */
export default function ArrivalScreen({ step }: { step: Step }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-7 px-6 pb-8 text-center">
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 16 }}
        className="flex size-36 items-center justify-center rounded-full bg-safe/15"
        style={{ boxShadow: "inset 0 0 0 4px #30D158, 0 0 80px #30D15866" }}
      >
        <svg width="76" height="76" viewBox="0 0 24 24" fill="none" stroke="#30D158" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <motion.path
            d="M5 12.5l4.5 4.5L19 7.5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.25, duration: 0.5, ease: "easeOut" }}
          />
        </svg>
      </motion.div>

      <div aria-live="polite">
        <h1 className="text-4xl font-bold text-safe">{step.line?.text}</h1>
        <p className="mt-2 text-xl text-muted">{DESTINATION_NAME}</p>
      </div>

      <motion.dl
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.3 }}
        className="w-full divide-y divide-white/15 rounded-3xl bg-card px-6 py-2 backdrop-blur-md"
      >
        {SUMMARY.map((r) => (
          <div key={r.label} className="flex items-center justify-between py-4">
            <dt className="text-xl text-muted">{r.label}</dt>
            <dd className="text-2xl font-bold">{r.value}</dd>
          </div>
        ))}
      </motion.dl>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import PhoneFrame from "./PhoneFrame";
import { toBn } from "@/lib/demo/format";
import { placeAt } from "@/lib/demo/route";

const FamilyMap = dynamic(() => import("./FamilyMap"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-background" />,
});

const WALK_S = 32; // same length as the walking-mode clip
const TOTAL_MIN = 18; // from the route summary
const PING_S = 3; // family location refreshes every few seconds

/** Scene 6 (/family): what the family member sees while Rafi walks. R restarts, F toggles the frame. */
export default function FamilyView() {
  const params = useSearchParams();
  const [frame, setFrame] = useState(params.get("frame") === "1");
  const [elapsed, setElapsed] = useState(0);
  const [run, setRun] = useState(0);

  useEffect(() => {
    const t0 = performance.now();
    const id = setInterval(() => setElapsed(Math.min((performance.now() - t0) / 1000, WALK_S)), 100);
    return () => clearInterval(id);
  }, [run]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "r" || e.key === "R") {
        setElapsed(0);
        setRun((n) => n + 1);
      }
      if (e.key === "f" || e.key === "F") setFrame((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const arrived = elapsed >= WALK_S;
  // The pin only moves on each refresh, like a real location feed.
  const shown = arrived ? WALK_S : Math.floor(elapsed / PING_S) * PING_S;
  const progress = shown / WALK_S;
  const minutesLeft = Math.ceil((1 - progress) * TOTAL_MIN);
  const place = arrived ? "মেডিকেল কলেজ হাসপাতাল" : placeAt(progress);

  return (
    <PhoneFrame enabled={frame}>
      <div className="relative h-full">
        <div role="img" aria-label="রাফির লাইভ অবস্থান" className="absolute inset-0 isolate z-0">
          <FamilyMap progress={progress} />
        </div>

        <div className="absolute inset-x-0 bottom-0 z-10 rounded-t-[32px] bg-black/90 px-5 pb-8 pt-6 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-accent text-3xl font-bold text-black">
              র
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-3xl font-bold">রাফি</h1>
              <p className="flex items-center gap-2 text-xl font-medium" aria-live="polite">
                <span className={`size-3 rounded-full ${arrived ? "bg-safe" : "animate-pulse bg-safe"}`} />
                <span className="text-safe">{arrived ? "পৌঁছে গেছেন" : "হাঁটছে"}</span>
              </p>
            </div>
            <div className="shrink-0 text-right">
              <div className="whitespace-nowrap text-lg text-white/70">পৌঁছাতে</div>
              <div className="flex h-10 items-baseline justify-end gap-2 whitespace-nowrap">
                <span className="text-3xl font-bold">{toBn(arrived ? 0 : minutesLeft)}</span>
                <span className="text-lg text-white/80">মিনিট</span>
              </div>
            </div>
          </div>

          {/* One fixed-height line, so the card never changes size when the name changes. */}
          <div className="mt-5 rounded-2xl bg-card px-4 py-3">
            <div className="whitespace-nowrap text-lg text-white/70">বর্তমান অবস্থান</div>
            <div className="flex h-10 items-center gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#FFD60A" aria-hidden className="shrink-0">
                <path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
              </svg>
              <motion.span
                key={place}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                aria-live="polite"
                className="truncate text-2xl font-bold"
              >
                {place}
              </motion.span>
            </div>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

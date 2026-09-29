"use client";

import dynamic from "next/dynamic";
import CaptionBubble from "../CaptionBubble";
import Waveform from "../Waveform";
import { STEPS, type Step } from "@/lib/demo/scenes";

// Leaflet touches `window`, so the map is client-only.
const RouteMap = dynamic(() => import("../RouteMap"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-background" />,
});

/** Scene 2: satellite map, route draws itself, agent reads the summary. */
export default function RouteScreen({ step, index }: { step: Step; index: number }) {
  const lines = STEPS.slice(0, index + 1)
    .filter((s) => s.scene === 2 && s.line)
    .map((s) => s.line!);
  const mode = step.line ? (step.line.who === "agent" ? "speaking" : "listening") : "idle";

  return (
    <div className="relative h-full">
      <div role="img" aria-label="ফুটপাত সহ রুটের স্যাটেলাইট মানচিত্র" className="absolute inset-0 isolate z-0">
        <RouteMap />
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10 rounded-t-[32px] bg-card px-5 pb-8 pt-3 backdrop-blur-xl">
        <div className="flex items-center justify-center">
          <div className="size-[72px]">
            <div className="origin-top-left scale-[0.41]">
              <Waveform mode={mode} />
            </div>
          </div>
        </div>
        <div aria-live="polite" className="flex flex-col gap-4">
          {lines.map((l) => (
            <CaptionBubble key={l.id} who={l.who} text={l.text} />
          ))}
        </div>
      </div>
    </div>
  );
}

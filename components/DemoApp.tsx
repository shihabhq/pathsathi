"use client";

import { useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import PhoneFrame from "./PhoneFrame";
import PresenterOverlay from "./PresenterOverlay";
import WakeScreen from "./scenes/WakeScreen";
import VoiceAgentScreen from "./scenes/VoiceAgentScreen";
import RouteScreen from "./scenes/RouteScreen";
import WalkingScreen from "./scenes/WalkingScreen";
import ArrivalScreen from "./scenes/ArrivalScreen";
import { chime, preloadAudio, speak, stopVoice } from "@/lib/demo/audio";
import { STEPS } from "@/lib/demo/scenes";
import { TIMELINE } from "@/lib/demo/timeline";
import { useDemoController } from "@/lib/demo/useDemoController";

export default function DemoApp() {
  const demo = useDemoController();
  const { step } = demo;

  // Warm up everything heavy once, so no scene stutters while recording.
  useEffect(() => {
    void import("./RouteMap");
    fetch("/demo/street.mp4").catch(() => {});
    preloadAudio([
      ...STEPS.flatMap((s) => (s.line?.who === "agent" ? [s.line.id] : [])),
      ...TIMELINE.map((e) => e.id),
    ]);
  }, []);

  // Voice: chime on wake, speak agent lines. Stops when the step changes.
  useEffect(() => {
    stopVoice();
    if (!demo.voice) return;
    if (step.id === "wake") chime();
    if (step.line?.who === "agent") speak(step.line.id, step.line.text);
    return stopVoice;
  }, [step, demo.voice]);

  const { setSource } = demo;
  const onCameraFail = useCallback(() => setSource("video"), [setSource]);

  return (
    <>
      <PhoneFrame enabled={demo.frame}>
        <AnimatePresence mode="wait">
          <motion.main
            key={step.scene === 4 ? 3 : step.scene} // walking mode spans scenes 3 and 4
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="h-full"
          >
            {step.scene === 0 && <WakeScreen step={step} />}
            {step.scene === 1 && <VoiceAgentScreen step={step} index={demo.index} />}
            {step.scene === 2 && <RouteScreen step={step} index={demo.index} />}
            {(step.scene === 3 || step.scene === 4) && (
              <WalkingScreen
                step={step}
                voice={demo.voice}
                source={demo.source}
                presenter={demo.overlay}
                startAt={demo.walkStart}
                onCameraFail={onCameraFail}
              />
            )}
            {step.scene === 5 && <ArrivalScreen step={step} />}
          </motion.main>
        </AnimatePresence>

        {demo.conceptTag && (
          <span className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-sm text-white/70">
            কনসেপ্ট ডেমো
          </span>
        )}

        {/* Invisible 48px tap zones for phones. Top-left: next step. Top-right: play the whole demo
            from the start (tap again while it runs to stop). The tap also unlocks browser audio. */}
        <button
          aria-hidden
          tabIndex={-1}
          onClick={demo.next}
          className="absolute left-0 top-0 z-40 size-12 cursor-default opacity-0"
        />
        <button
          aria-hidden
          tabIndex={-1}
          onClick={() => {
            if (demo.autoplay && !demo.isLast) {
              demo.setAutoplay(false);
            } else {
              demo.restart();
              demo.setAutoplay(true);
            }
          }}
          className="absolute right-0 top-0 z-40 size-12 cursor-default opacity-0"
        />
      </PhoneFrame>
      <PresenterOverlay demo={demo} />
    </>
  );
}

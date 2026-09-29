"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import PhoneFrame from "./PhoneFrame";
import PresenterOverlay from "./PresenterOverlay";
import WakeScreen from "./scenes/WakeScreen";
import VoiceAgentScreen from "./scenes/VoiceAgentScreen";
import RouteScreen from "./scenes/RouteScreen";
import WalkingScreen from "./scenes/WalkingScreen";
import ArrivalScreen from "./scenes/ArrivalScreen";
import FamilyScreen from "./FamilyScreen";
import { chime, preloadAudio, speak, stopVoice, vibrateMs } from "@/lib/demo/audio";
import { STEPS } from "@/lib/demo/scenes";
import { TIMELINE } from "@/lib/demo/timeline";
import { useDemoController } from "@/lib/demo/useDemoController";

export default function DemoApp() {
  const demo = useDemoController();
  const { step } = demo;
  // ?family=1 opens with the family view already showing.
  const [showFamily, setShowFamily] = useState(useSearchParams().get("family") === "1");
  const resumeAutoplay = useRef(false);

  // Warm up everything heavy once, so no scene stutters while recording.
  useEffect(() => {
    void import("./RouteMap");
    void import("./FamilyMap");
    fetch("/demo/street.mp4").catch(() => {});
    preloadAudio([
      ...STEPS.flatMap((s) => (s.line?.who === "agent" ? [s.line.id] : [])),
      ...TIMELINE.map((e) => e.id),
    ]);
  }, []);

  // Voice: chime on wake, speak agent lines. Stops when the step changes.
  useEffect(() => {
    stopVoice();
    if (!demo.voice || showFamily) return;
    if (step.id === "wake") {
      chime();
      vibrateMs(300);
    }
    if (step.id === "arrival") vibrateMs([250, 120, 250, 120, 600]);
    if (step.line?.who === "agent") speak(step.line.id, step.line.text);
    return stopVoice;
  }, [step, demo.voice, showFamily]);

  const { setSource } = demo;
  const onCameraFail = useCallback(() => setSource("video"), [setSource]);

  // Bottom-right tap: show or hide the family view. The demo pauses underneath and resumes after.
  const toggleFamily = () => {
    if (!showFamily) {
      resumeAutoplay.current = demo.autoplay;
      demo.setAutoplay(false);
      stopVoice();
    } else if (resumeAutoplay.current) {
      demo.setAutoplay(true);
    }
    setShowFamily(!showFamily);
  };
  const closeFamily = () => {
    resumeAutoplay.current = false;
    setShowFamily(false);
  };

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
                voice={demo.voice && !showFamily}
                source={demo.source}
                presenter={demo.overlay}
                startAt={demo.walkStart}
                paused={showFamily}
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

        <AnimatePresence>
          {showFamily && (
            <motion.div
              key="family"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0 z-30 bg-background"
            >
              <FamilyScreen />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Invisible tap zones for phones (a tap also unlocks browser audio and vibration).
            Top-left: next step. Top-middle: reset to the first screen and stop.
            Top-right: play the whole demo from the start. Bottom-right: family view on/off.
            They start below the notch or status bar because phones swallow taps at the very top edge. */}
        <button
          aria-hidden
          tabIndex={-1}
          onClick={() => {
            vibrateMs(30);
            closeFamily();
            demo.next();
          }}
          style={{ top: "max(env(safe-area-inset-top), 12px)" }}
          className="absolute left-0 z-40 h-14 w-16 cursor-default opacity-0"
        />
        <button
          aria-hidden
          tabIndex={-1}
          onClick={() => {
            vibrateMs(30);
            stopVoice();
            closeFamily();
            demo.setAutoplay(false);
            demo.restart();
          }}
          style={{ top: "max(env(safe-area-inset-top), 12px)" }}
          className="absolute left-1/2 z-40 h-14 w-28 -translate-x-1/2 cursor-default opacity-0"
        />
        <button
          aria-hidden
          tabIndex={-1}
          onClick={() => {
            vibrateMs(30);
            closeFamily();
            demo.restart();
            demo.setAutoplay(true);
          }}
          style={{ top: "max(env(safe-area-inset-top), 12px)" }}
          className="absolute right-0 z-40 h-14 w-16 cursor-default opacity-0"
        />
        <button
          aria-hidden
          tabIndex={-1}
          onClick={() => {
            vibrateMs(30);
            toggleFamily();
          }}
          style={{ bottom: "max(env(safe-area-inset-bottom), 12px)" }}
          className="absolute right-0 z-40 size-16 cursor-default opacity-0"
        />
      </PhoneFrame>
      <PresenterOverlay demo={demo} />
    </>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { STEPS } from "./scenes";

export type CameraSource = "video" | "camera";

const LAST = STEPS.length - 1;

export function useDemoController() {
  const params = useSearchParams();
  // ?step=N (1-based) starts at that step: handy for checking a single screen.
  const [index, setIndex] = useState(() => {
    const n = Number(params.get("step"));
    return Number.isInteger(n) && n >= 1 ? Math.min(n, STEPS.length) - 1 : 0;
  });
  // ?walk=SECONDS starts walking mode that far into the clip (to rehearse one alert).
  const walkStart = Math.max(0, Number(params.get("walk")) || 0);
  const [frame, setFrame] = useState(params.get("frame") === "1");
  const [autoplay, setAutoplay] = useState(params.get("autoplay") === "1");
  const [overlay, setOverlay] = useState(false);
  const [conceptTag, setConceptTag] = useState(false);
  const [voice, setVoice] = useState(true);
  const [source, setSource] = useState<CameraSource>("video");

  const next = useCallback(() => setIndex((i) => Math.min(i + 1, LAST)), []);
  const prev = useCallback(() => setIndex((i) => Math.max(i - 1, 0)), []);
  const restart = useCallback(() => setIndex(0), []);
  const goTo = useCallback((i: number) => setIndex(Math.max(0, Math.min(i, LAST))), []);

  // Keyboard controls: Space/Right next, Left prev, R restart, F frame, H overlay, P autoplay.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      switch (e.key) {
        case " ":
        case "ArrowRight":
          e.preventDefault();
          next();
          break;
        case "ArrowLeft":
          e.preventDefault();
          prev();
          break;
        case "r":
        case "R":
          restart();
          break;
        case "f":
        case "F":
          setFrame((v) => !v);
          break;
        case "h":
        case "H":
          setOverlay((v) => !v);
          break;
        case "p":
        case "P":
          setAutoplay((v) => !v);
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, restart]);

  // Autoplay: hold each step for its own duration, then advance.
  useEffect(() => {
    if (!autoplay || index >= LAST) return;
    const t = setTimeout(next, STEPS[index].autoMs);
    return () => clearTimeout(t);
  }, [autoplay, index, next]);

  return {
    index,
    step: STEPS[index],
    isLast: index === LAST,
    frame,
    autoplay,
    overlay,
    conceptTag,
    voice,
    source,
    walkStart,
    next,
    prev,
    restart,
    goTo,
    setFrame,
    setAutoplay,
    setOverlay,
    setConceptTag,
    setVoice,
    setSource,
  };
}

export type DemoController = ReturnType<typeof useDemoController>;

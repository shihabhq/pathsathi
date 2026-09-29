"use client";

import { useEffect, useRef, useState } from "react";
import AlertBanner from "../AlertBanner";
import CaptionBubble from "../CaptionBubble";
import DetectionOverlay from "../DetectionOverlay";
import DirectionArrow from "../DirectionArrow";
import MiniMap from "../MiniMap";
import VibrationIndicator from "../VibrationIndicator";
import { speak, tick, vibrate } from "@/lib/demo/audio";
import type { Step } from "@/lib/demo/scenes";
import { TIMELINE, type TimelineEntry } from "@/lib/demo/timeline";
import type { CameraSource } from "@/lib/demo/useDemoController";

const SHOW_S = 4.5; // how long an alert stays on screen
const COOLDOWN_S = 3; // minimum gap between spoken alerts
const FALLBACK_DURATION_S = 32;
const VIDEO_SRC = "/demo/street.mp4";

type Media = "loading" | "ok" | "missing";

type Props = {
  step: Step;
  voice: boolean;
  source: CameraSource;
  /** Presenter overlay is on: show presenter-only notes. */
  presenter: boolean;
  /** Seconds into the clip to start from (?walk=). */
  startAt: number;
  /** Hold the video while something else (the family view) is on top. */
  paused?: boolean;
  onCameraFail: () => void;
};

/** Scenes 3 and 4: camera view with detections, alerts, direction cue, vibration and mini map. */
export default function WalkingScreen({ step, voice, source, presenter, startAt, paused = false, onCameraFail }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const voiceRef = useRef(voice);
  const activeRef = useRef<TimelineEntry | null>(null);

  const [media, setMedia] = useState<Media>("loading");
  const [aspect, setAspect] = useState(9 / 16);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [active, setActive] = useState<TimelineEntry | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    voiceRef.current = voice;
  }, [voice]);

  // Live camera: attach the stream. The <video> is remounted per source (see key below).
  useEffect(() => {
    if (source !== "camera") return;
    let stream: MediaStream | undefined;
    let cancelled = false;
    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: "environment" }, audio: false })
      .then((s) => {
        if (cancelled) return s.getTracks().forEach((t) => t.stop());
        stream = s;
        const v = videoRef.current;
        if (v) {
          v.srcObject = s;
          void v.play();
        }
      })
      .catch(() => !cancelled && onCameraFail());
    if (!navigator.mediaDevices) onCameraFail();
    return () => {
      cancelled = true;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [source, onCameraFail]);

  // Events can fire before hydration and be missed, so also poll the element's real state.
  useEffect(() => {
    const check = () => {
      const v = videoRef.current;
      if (!v) return;
      if (source === "video" && (v.error || v.networkState === HTMLMediaElement.NETWORK_NO_SOURCE)) {
        setMedia("missing");
      } else if (!v.paused && v.readyState >= 2) {
        setMedia("ok");
      } else if (v.readyState >= 2) {
        void v.play().catch(() => {});
      }
    };
    check();
    const id = setInterval(check, 300);
    const stop = setTimeout(() => clearInterval(id), 10000);
    return () => {
      clearInterval(id);
      clearTimeout(stop);
    };
  }, [source]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (paused) v.pause();
    else if (v.readyState >= 2) void v.play().catch(() => {});
  }, [paused]);

  // Size the picture like object-fit: cover, so boxes stay glued to the video frame.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setBox({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Clock: video time (or elapsed time without a video) drives the scripted alerts and the mini map.
  useEffect(() => {
    if (media === "loading") return;
    const t0 = performance.now();
    const fired = new Set<string>();
    let prev = 0;
    let lastSpoken = -Infinity;
    let raf = 0;

    const fire = (e: TimelineEntry, t: number) => {
      if (t - lastSpoken < COOLDOWN_S) return;
      lastSpoken = t;
      activeRef.current = e;
      setActive(e);
      tick();
      vibrate(e.vibrate);
      if (voiceRef.current) speak(e.id, e.say);
    };

    const loop = () => {
      const v = videoRef.current;
      const useVideo = media === "ok" && source === "video" && v;
      const t = useVideo ? v.currentTime : startAt + (performance.now() - t0) / 1000;
      if (t < prev - 0.5) fired.clear(); // restarted or seeked back
      prev = t;

      for (const e of TIMELINE) {
        if (t >= e.t && t < e.t + 1.5 && !fired.has(e.id)) {
          fired.add(e.id);
          fire(e, t);
        }
      }
      const a = activeRef.current;
      if (a && t >= a.t + SHOW_S) {
        activeRef.current = null;
        setActive(null);
      }

      const dur = useVideo && Number.isFinite(v.duration) ? v.duration : FALLBACK_DURATION_S;
      const p = Math.min(t / dur, 1);
      setProgress((old) => (Math.abs(old - p) > 0.004 ? p : old));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [media, source, startAt]);

  // object-fit: cover, done by hand
  const scale = box.w && box.h ? Math.max(box.w, box.h * aspect) : 0;
  const pic = scale
    ? { width: scale, height: scale / aspect }
    : { width: "100%", height: "100%" };

  const showVideo = media !== "missing" || source === "camera";

  return (
    <div ref={wrapRef} className="relative h-full overflow-hidden bg-ink">
      {/* Placeholder when street.mp4 is missing */}
      {media === "missing" && (
        <div className="absolute inset-0 bg-gradient-to-b from-[#12306B] via-[#0A1A3F] to-[#05070D]">
          {presenter && (
            <p lang="en" className="absolute inset-x-6 top-1/2 text-center font-sans text-sm text-white/60">
              Presenter note: public/demo/street.mp4 was not found. Alerts still run on a timer.
            </p>
          )}
        </div>
      )}

      {/* Picture + boxes share one wrapper, sized like the video frame */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={pic}
      >
        {showVideo && (
          <video
            key={source}
            ref={videoRef}
            src={source === "video" ? VIDEO_SRC : undefined}
            className="absolute inset-0 h-full w-full"
            autoPlay
            muted
            playsInline
            aria-hidden
            onLoadedMetadata={(e) => {
              const v = e.currentTarget;
              if (v.videoWidth) setAspect(v.videoWidth / v.videoHeight);
              if (startAt > 0 && source === "video") v.currentTime = startAt;
            }}
            onPlaying={() => setMedia("ok")}
            onError={() => source === "video" && setMedia("missing")}
            onEnded={(e) => e.currentTarget.pause()}
          />
        )}
        <DetectionOverlay entry={active} />
      </div>

      {/* Scrims keep text readable over any footage */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-[#05070D]/75 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[26rem] bg-gradient-to-t from-[#05070D]/90 via-[#05070D]/60 to-transparent" />

      <div className="absolute inset-x-4 top-14 z-10">
        <AlertBanner entry={active} />
      </div>

      <div className="absolute inset-x-4 bottom-6 z-10 flex flex-col gap-4">
        {step.id === "walk-start" && step.line && (
          <div aria-live="polite">
            <CaptionBubble who={step.line.who} text={step.line.text} />
          </div>
        )}
        <div className="flex items-end justify-between">
          <VibrationIndicator pattern={active?.vibrate ?? null} id={active?.id} />
          <DirectionArrow pattern={active?.vibrate ?? null} severity={active?.severity ?? null} />
          <div className="flex w-[104px] justify-end">
            <MiniMap progress={progress} />
          </div>
        </div>
      </div>
    </div>
  );
}

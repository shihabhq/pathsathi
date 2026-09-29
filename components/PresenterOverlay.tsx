"use client";

import { SCENE_NAMES, STEPS } from "@/lib/demo/scenes";
import type { DemoController } from "@/lib/demo/useDemoController";

// Presenter-only UI (English). Hidden by default; press H to show.
export default function PresenterOverlay({ demo }: { demo: DemoController }) {
  if (!demo.overlay) return null;

  const toggle = (label: string, on: boolean, set: (v: boolean) => void) => (
    <button
      onClick={() => set(!on)}
      className={`rounded px-2 py-1 text-xs font-medium ${
        on ? "bg-accent text-black" : "bg-white/15 text-white"
      }`}
    >
      {label}: {on ? "on" : "off"}
    </button>
  );

  return (
    <aside
      lang="en"
      className="fixed left-3 top-3 z-50 w-72 rounded-xl border border-white/20 bg-black/85 p-3 font-sans text-xs text-white backdrop-blur"
    >
      <div className="mb-2 flex items-center justify-between">
        <strong className="text-sm">Presenter</strong>
        <span>
          {demo.index + 1} / {STEPS.length}
        </span>
      </div>

      <ol className="mb-3 max-h-64 space-y-0.5 overflow-y-auto">
        {STEPS.map((s, i) => (
          <li key={s.id}>
            <button
              onClick={() => demo.goTo(i)}
              className={`w-full rounded px-2 py-1 text-left ${
                i === demo.index ? "bg-accent font-semibold text-black" : "hover:bg-white/10"
              }`}
            >
              {i + 1}. [{s.scene}] {s.label}
              <span className="ml-1 opacity-60">{SCENE_NAMES[s.scene]}</span>
            </button>
          </li>
        ))}
      </ol>

      <div className="mb-3 flex gap-1.5">
        <button
          onClick={() => {
            demo.restart();
            demo.setAutoplay(true);
            demo.setOverlay(false);
          }}
          className="flex-1 rounded bg-accent px-2 py-2 text-sm font-bold text-black"
        >
          Play from start
        </button>
        <button onClick={() => demo.setOverlay(false)} className="rounded bg-white/15 px-3 py-2 text-sm">
          Hide
        </button>
      </div>

      <div className="mb-2 flex flex-wrap gap-1.5">
        <button onClick={demo.prev} className="rounded bg-white/15 px-2 py-1">
          Prev
        </button>
        <button onClick={demo.next} className="rounded bg-white/15 px-2 py-1">
          Next
        </button>
        <button onClick={demo.restart} className="rounded bg-white/15 px-2 py-1">
          Restart
        </button>
      </div>

      <div className="mb-2 flex flex-wrap gap-1.5">
        {toggle("Frame (F)", demo.frame, demo.setFrame)}
        {toggle("Autoplay (P)", demo.autoplay, demo.setAutoplay)}
        {toggle("Voice", demo.voice, demo.setVoice)}
        {toggle("Concept tag", demo.conceptTag, demo.setConceptTag)}
        {toggle("Live camera", demo.source === "camera", (v) =>
          demo.setSource(v ? "camera" : "video"),
        )}
      </div>

      <p className="opacity-60">
        Space/Right next, Left prev, R restart, F frame, H hide, P autoplay. On a phone: top-left
        corner tap = next step, top-right corner tap = play from start, bottom-right corner tap = show or hide the family view. Press P to pause autoplay.
      </p>
    </aside>
  );
}

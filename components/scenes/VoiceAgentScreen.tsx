"use client";

import CaptionBubble from "../CaptionBubble";
import Waveform from "../Waveform";
import { STEPS, type Step } from "@/lib/demo/scenes";

/** Scene 1: agent asks where to go, user answers. */
export default function VoiceAgentScreen({ step, index }: { step: Step; index: number }) {
  // Show every line spoken so far in this scene.
  const lines = STEPS.slice(0, index + 1)
    .filter((s) => s.scene === 1 && s.line)
    .map((s) => s.line!);
  const agentSpeaking = step.line?.who === "agent";

  return (
    <div className="flex h-full flex-col px-5 pb-10 pt-16">
      <header className="text-center">
        <h1 className="text-3xl font-bold text-highlight">পথসাথী</h1>
        <p className="mt-1 text-xl text-muted">{agentSpeaking ? "বলছে" : "শুনছে"}</p>
      </header>

      <div aria-live="polite" className="flex flex-1 flex-col justify-center gap-5">
        {lines.map((l) => (
          <CaptionBubble key={l.id} who={l.who} text={l.text} />
        ))}
      </div>

      <div className="flex justify-center">
        <Waveform mode={agentSpeaking ? "speaking" : "listening"} />
      </div>
    </div>
  );
}

"use client";

// Voice + UI sounds. Prefers public/audio/<id>.mp3; falls back to speechSynthesis
// with a Bangla voice; otherwise stays silent (captions are always shown).

let current: HTMLAudioElement | null = null;
let ctx: AudioContext | null = null;
let pending: { id: string; text: string; at: number } | null = null;

const PENDING_MAX_AGE_MS = 8000;

export function stopVoice() {
  pending = null;
  if (current) {
    current.onerror = null;
    current.pause();
    current = null;
  }
  if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel();
}

function banglaVoice() {
  const voices = speechSynthesis.getVoices();
  return voices.find((v) => v.lang === "bn-BD") ?? voices.find((v) => v.lang.startsWith("bn"));
}

function speakSynth(text: string) {
  if (typeof speechSynthesis === "undefined") return;
  const say = () => {
    const voice = banglaVoice();
    if (!voice) return; // no Bangla voice: stay silent, captions are still shown
    const u = new SpeechSynthesisUtterance(text);
    u.voice = voice;
    u.lang = voice.lang;
    speechSynthesis.speak(u);
  };
  // Browsers load voices late: wait for them once instead of giving up.
  if (speechSynthesis.getVoices().length) return say();
  const done = () => {
    speechSynthesis.removeEventListener("voiceschanged", done);
    say();
  };
  speechSynthesis.addEventListener("voiceschanged", done);
}

/** Speak one agent line. Cancels whatever was playing before. */
export function speak(id: string, text: string) {
  stopVoice();
  const a = new Audio(`/audio/${id}.mp3`);
  current = a;
  a.onerror = () => {
    if (current === a) speakSynth(text);
  };
  a.play().catch((err: unknown) => {
    if (current !== a) return;
    if ((err as DOMException)?.name === "NotAllowedError") {
      // Autoplay blocked until the first key press or tap: replay this line then.
      pending = { id, text, at: Date.now() };
    } else {
      speakSynth(text); // mp3 missing or unsupported
    }
  });
}

// First user gesture unlocks audio: resume the chime engine and replay a blocked line.
if (typeof window !== "undefined") {
  const unlock = () => {
    try {
      audioCtx();
    } catch {}
    const p = pending;
    pending = null;
    if (p && Date.now() - p.at < PENDING_MAX_AGE_MS) speak(p.id, p.text);
  };
  window.addEventListener("keydown", unlock, { capture: true });
  window.addEventListener("pointerdown", unlock, { capture: true });
}

function audioCtx() {
  ctx ??= new AudioContext();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(freq: number, start: number, dur: number, gain: number) {
  const c = audioCtx();
  if (c.state !== "running") return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = "sine";
  o.frequency.value = freq;
  const t0 = c.currentTime + start;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(c.destination);
  o.start(t0);
  o.stop(t0 + dur + 0.05);
}

/** Soft two-note chime when the app wakes. */
export function chime() {
  try {
    tone(659.25, 0, 0.5, 0.18);
    tone(987.77, 0.14, 0.7, 0.14);
  } catch {}
}

/** Soft tick when an alert appears. */
export function tick() {
  try {
    tone(1200, 0, 0.09, 0.12);
  } catch {}
}

export type VibratePattern = "left" | "right" | "stop" | "short";

// Each pattern feels different: left = 2 pulses, right = 3 pulses, stop = 1 long, short = 1 short.
// Pulses are long on purpose: phone motors barely register anything under about 200 ms.
export const VIBRATE_MS: Record<VibratePattern, number[]> = {
  left: [300, 150, 300],
  right: [300, 150, 300, 150, 300],
  stop: [900],
  short: [250],
};

/** Raw vibration. Only works on Android (Chrome), after the page has been tapped once. */
export function vibrateMs(pattern: number | number[]) {
  try {
    navigator.vibrate?.(pattern);
  } catch {}
}

/** Real vibration where supported. The UI always shows the visual indicator too. */
export function vibrate(pattern: VibratePattern) {
  vibrateMs(VIBRATE_MS[pattern]);
}

/** Warm the browser cache so the first play of each clip has no delay. */
export function preloadAudio(ids: string[]) {
  for (const id of ids) void fetch(`/audio/${id}.mp3`).catch(() => {});
}

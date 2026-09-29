// Generates one Bangla mp3 per agent line (scenes.ts) and timeline alert (timeline.ts)
// into public/audio/<id>.mp3 using edge-tts (pip install edge-tts).
// Usage: node --experimental-strip-types scripts/gen-audio.mjs [--force]
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { STEPS } from "../lib/demo/scenes.ts";
import { TIMELINE } from "../lib/demo/timeline.ts";

const VOICE = "bn-BD-NabanitaNeural";
const force = process.argv.includes("--force");

const lines = [
  ...STEPS.filter((s) => s.line?.who === "agent").map((s) => ({ id: s.line.id, text: s.line.text })),
  ...TIMELINE.map((e) => ({ id: e.id, text: e.say })),
];

mkdirSync("public/audio", { recursive: true });
let failed = 0;
for (const { id, text } of lines) {
  const out = `public/audio/${id}.mp3`;
  if (!force && existsSync(out)) {
    console.log(`skip  ${id}`);
    continue;
  }
  const r = spawnSync("python", ["-m", "edge_tts", "--voice", VOICE, "--text", text, "--write-media", out], {
    stdio: "inherit",
  });
  if (r.status === 0) console.log(`ok    ${id}`);
  else {
    console.error(`FAIL  ${id}`);
    failed++;
  }
}
process.exit(failed ? 1 : 0);

@AGENTS.md

# PathSathi (পথসাথী): Video Demo App

## What this project is

PathSathi is a concept for a Bangla voice companion that helps blind people walk the streets of Bangladesh more safely. The phone is worn on a chest mount with the camera facing forward. Maps (and later, satellite imagery) plan the route, the camera watches the next few steps for hazards, and the app speaks short Bangla alerts and vibrates.

**This codebase is NOT the real product.** It is a scripted, clickable simulation built only to record a 2 minute video for the Grameenphone FutureMakers 2026 competition (round 1). No real users will use it. Optimise for how it looks and feels on screen, not for production concerns.

## Hard rules

- Everything is simulated. No AI APIs, no paid APIs, no backend, no database, no auth.
- No real speech recognition. User speech is shown as scripted transcript bubbles.
- No real object detection. Bounding boxes and alerts come from a scripted timeline.
- The demo must be fully controllable by the person recording the video (see Presenter controls).
- Must look great in a phone viewport (390 x 844) and inside a phone frame on a desktop screen.
- Keep dependencies minimal. Do not add a library when a few lines of code will do.
- All user-facing app text is in Bangla. Code, comments and presenter UI are in English.
- Never use em dashes in any UI copy.

## Accessibility story (important for the pitch)

Blind users do not tap big buttons to open apps. The real product is voice-first:

1. The user says "পথসাথী" (wake word), or uses the phone's own voice assistant / TalkBack.
2. The voice agent opens and asks where they want to go.
3. The user speaks the destination; the app plans the route and starts guidance.

The UI we build exists so **sighted judges** can see what is happening. Show this clearly:

- A persistent listening indicator (animated waveform / pulsing ring) whenever the agent is "listening" or "speaking".
- Live Bangla captions of everything the agent says and the user says.
- Vibration shown visually (a pulse icon with the pattern name, e.g. "ডানে ঘুরুন" pattern).
- Still use proper semantics: aria-labels, aria-live regions for alerts, large touch targets. It should look like an app built with accessibility in mind.

In the real product, the wake word and background running need a native Android app. The PWA is a simulation only.

## Tech stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Framer Motion for transitions and the waveform
- react-leaflet + Leaflet for maps (client-only, dynamic import with `ssr: false`)
- Map tiles: Esri World Imagery for the satellite look (show the required attribution), OpenStreetMap for the family view
- Font: Noto Sans Bengali or Hind Siliguri via `next/font/google`
- PWA: `app/manifest.ts` plus app icons so it can be "installed" on a phone for filming. No offline service worker needed.
- Deploy: Vercel (HTTPS is needed if the live camera option is used)

## Visual direction

- High contrast, low-vision friendly: near-black background (#0B0B0C), warm yellow accent (#FFD60A), white text, red (#FF453A) for danger alerts, green (#30D158) for "safe / arrived".
- Large type. Alerts at 28 to 36px. Captions at 20px minimum.
- Calm, confident, uncluttered. One primary thing on screen at a time.
- Rounded cards, soft glows around the listening indicator, smooth 200 to 300ms transitions.
- It should feel like a real, polished app in a video, not a prototype.

## Demo scenes (the video flow)

The app is a state machine of scenes. Each scene has captions, optional audio, and timed events.

| #   | Scene          | What the viewer sees                                                                                                                                                                                                                                 |
| --- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0   | Idle / wake    | Dark phone home-style screen. User says "পথসাথী". Waveform animates, app opens with a soft chime.                                                                                                                                                    |
| 1   | Voice agent    | Agent: "আমি শুনছি। কোথায় যেতে চান?" User bubble: "ঢাকা মেডিকেল কলেজ হাসপাতালে যাব"                                                                                                                                                                  |
| 2   | Route planning | Satellite map zooms to the area. Footpath route draws itself (animated polyline). Small labels: "ফুটপাত শনাক্ত হয়েছে", "ক্রসিং". Agent: "রাস্তা পাওয়া গেছে। দূরত্ব ১.২ কিলোমিটার, হাঁটতে প্রায় ১৮ মিনিট লাগবে। শুরু করব?" User: "হ্যাঁ, শুরু করো" |
| 3   | Walking mode   | Full-screen camera view (street video) with bounding boxes, a top alert banner, a direction arrow, a vibration indicator, and a small mini map with a moving dot. Agent: "হাঁটা শুরু হলো। আপনার লোকেশন পরিবারের সাথে শেয়ার করা হচ্ছে।"              |
| 4   | Hazard alerts  | Scripted alerts synced to the video: "সামনে তিন মিটারে খোলা ড্রেন, ডান দিকে সরে যান" (red), "ডান দিক থেকে রিকশা আসছে, অপেক্ষা করুন" (red), "সামনে মানুষ" (yellow), "এখানে বাম দিকে ঘুরুন" (yellow, confirmed by crossing landmark)                   |
| 5   | Arrival        | Green check, "আপনি পৌঁছে গেছেন", trip summary card (time, distance, alerts given).                                                                                                                                                                   |
| 6   | Family view    | Separate screen (route `/family`): OpenStreetMap with a live pin moving along the same route, name "রাফি", status "হাঁটছে", ETA, last updated time.                                                                                                  |

Route for the map (approximate, adjust visually): start near TSC, University of Dhaka (23.7326, 90.3960) to Dhaka Medical College Hospital (23.7253, 90.3977). Store waypoints in `lib/demo/route.ts`.

## Walking mode details

- Source of the camera view, selectable in presenter controls:
  1. `video` (default): plays `public/demo/street.mp4`, a clip the team films on a real street with the phone at chest height. Bounding boxes and alerts are driven by `lib/demo/timeline.ts`, keyed by video time in seconds.
  2. `camera` (optional): live rear camera via `getUserMedia`, with the same scripted alerts on a timer. Use only if it looks good.
- Timeline entry shape: `{ t: number, label: string, box: [x, y, w, h] (0 to 1 relative), severity: "danger" | "warn" | "info", say: string, vibrate: "left" | "right" | "stop" | "short" }`.
- Bounding boxes: rounded outline, label chip above (Bangla label + distance, e.g. "রিকশা · ৪ মি").
- Only one spoken alert at a time; show a 3 second cooldown so it never feels noisy.
- Provide a placeholder if `street.mp4` is missing (dark gradient with a note for presenters only).

## Audio

- Every agent line has a caption. Audio is optional.
- Try `speechSynthesis` with a Bangla voice (`bn-BD` or `bn-IN`) if available; otherwise stay silent (the team may add voiceover in editing).
- Optional pre-recorded clips in `public/audio/*.mp3`, mapped by line id; if a file exists, prefer it over speechSynthesis.
- Small UI sounds (chime on wake, soft tick on alert) generated with the Web Audio API, no files needed.
- Call `navigator.vibrate` where supported, but always show the visual vibration indicator.

## Presenter controls (for recording)

- `Space` or `→`: next step. `←`: previous step. `R`: restart. `F`: toggle phone frame. `H`: hide/show presenter overlay.
- Tapping the top-right corner (invisible 48px zone) also advances, for recording on a real phone.
- `?frame=1` renders the app inside a phone frame centred on the page (for desktop screen recording).
- `?autoplay=1` runs the whole demo with default timings.
- The presenter overlay must never appear in the recording unless toggled on.

## Honesty in the video

Drain, pothole and step detection do not exist yet; they need a trained model on Bangladeshi street data. This app is a concept simulation. Keep a small, unobtrusive "Concept demo" tag available (toggle in presenter controls) so the team can decide whether to show it.

## Suggested structure

```
app/
  layout.tsx          fonts, metadata, theme
  manifest.ts         PWA manifest
  page.tsx            main demo (scene state machine)
  family/page.tsx     family live location view
components/
  PhoneFrame.tsx
  Waveform.tsx
  CaptionBubble.tsx
  AlertBanner.tsx
  DetectionOverlay.tsx
  VibrationIndicator.tsx
  RouteMap.tsx        satellite map + animated route (client only)
  FamilyMap.tsx
  PresenterOverlay.tsx
lib/demo/
  scenes.ts           scene list, captions, timings
  timeline.ts         walking-mode detections
  route.ts            waypoints
  audio.ts            speech + chime helpers
public/
  demo/street.mp4     team adds this
  audio/              optional voice clips
  icons/              PWA icons
```

## Working style

- Build in small steps and run the dev server after each step.
- Prefer simple, readable components over clever abstractions.
- Check every screen at 390 x 844 before calling a step done.

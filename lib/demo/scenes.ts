// The demo is a flat list of steps. Each step belongs to one of the scenes
// from the video plan (0 to 5; scene 6 is the /family route).

export type SceneId = 0 | 1 | 2 | 3 | 4 | 5;

export type Line = {
  /** Also the key for optional audio clips: public/audio/<id>.mp3 */
  id: string;
  who: "agent" | "user";
  text: string;
};

export type Step = {
  id: string;
  scene: SceneId;
  /** Presenter-only label (English). */
  label: string;
  /** Bangla line spoken or shown in this step, if any. */
  line?: Line;
  /** How long autoplay stays on this step, in ms. */
  autoMs: number;
};

export const SCENE_NAMES: Record<SceneId, string> = {
  0: "Idle / wake",
  1: "Voice agent",
  2: "Route planning",
  3: "Walking mode",
  4: "Hazard alerts",
  5: "Arrival",
};

export const STEPS: Step[] = [
  { id: "idle", scene: 0, label: "Idle home screen", autoMs: 2500 },
  {
    id: "wake",
    scene: 0,
    label: "User says the wake word",
    line: { id: "user-wake", who: "user", text: "পথসাথী" },
    autoMs: 2500,
  },
  {
    id: "ask",
    scene: 1,
    label: "Agent asks for destination",
    line: { id: "agent-ask", who: "agent", text: "আমি শুনছি। কোথায় যেতে চান?" },
    autoMs: 4500,
  },
  {
    id: "destination",
    scene: 1,
    label: "User speaks destination",
    line: {
      id: "user-destination",
      who: "user",
      text: "ঢাকা মেডিকেল কলেজ হাসপাতালে যাব",
    },
    autoMs: 3500,
  },
  { id: "route", scene: 2, label: "Route draws on satellite map", autoMs: 5000 },
  {
    id: "summary",
    scene: 2,
    label: "Agent reads route summary",
    line: {
      id: "agent-summary",
      who: "agent",
      text: "রাস্তা পাওয়া গেছে। দূরত্ব ১.২ কিলোমিটার, হাঁটতে প্রায় ১৮ মিনিট লাগবে। শুরু করব?",
    },
    autoMs: 9500,
  },
  {
    id: "confirm",
    scene: 2,
    label: "User confirms",
    line: { id: "user-confirm", who: "user", text: "হ্যাঁ, শুরু করো" },
    autoMs: 2500,
  },
  {
    id: "walk-start",
    scene: 3,
    label: "Walking mode starts",
    line: {
      id: "agent-walk-start",
      who: "agent",
      text: "হাঁটা শুরু হলো। আপনার লোকেশন পরিবারের সাথে শেয়ার করা হচ্ছে।",
    },
    autoMs: 6000,
  },
  { id: "hazards", scene: 4, label: "Hazard alerts (timeline)", autoMs: 27000 },
  {
    id: "arrival",
    scene: 5,
    label: "Arrival and trip summary",
    line: { id: "agent-arrival", who: "agent", text: "আপনি পৌঁছে গেছেন" },
    autoMs: 6000,
  },
];

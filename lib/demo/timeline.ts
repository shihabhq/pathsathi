// Walking-mode detections, keyed by video time in seconds.
// t and box currently match the SYNTHETIC stand-in clip made by scripts/gen-street.py.
// When you drop in real footage, retime every t and box against public/demo/street.mp4.

export type Severity = "danger" | "warn" | "info";
export type Vibrate = "left" | "right" | "stop" | "short";

export type TimelineEntry = {
  /** Also the key for optional audio clips: public/audio/<id>.mp3 */
  id: string;
  /** Video time in seconds. */
  t: number;
  /** Chip text above the bounding box. */
  label: string;
  /** [x, y, w, h], each 0 to 1 relative to the video frame. */
  box: [number, number, number, number];
  severity: Severity;
  /** Spoken and captioned alert. */
  say: string;
  vibrate: Vibrate;
};

export const TIMELINE: TimelineEntry[] = [
  {
    id: "alert-drain",
    t: 6,
    label: "খোলা ড্রেন · ৩ মি",
    box: [0.24, 0.56, 0.4, 0.05],
    severity: "danger",
    say: "সামনে তিন মিটারে খোলা ড্রেন, ডান দিকে সরে যান",
    vibrate: "right",
  },
  {
    id: "alert-rickshaw",
    t: 13,
    label: "রিকশা · ৪ মি",
    box: [0.48, 0.35, 0.25, 0.21],
    severity: "danger",
    say: "ডান দিক থেকে রিকশা আসছে, অপেক্ষা করুন",
    vibrate: "stop",
  },
  {
    id: "alert-person",
    t: 20,
    label: "মানুষ · ৫ মি",
    box: [0.24, 0.36, 0.08, 0.17],
    severity: "warn",
    say: "সামনে মানুষ",
    vibrate: "short",
  },
  {
    id: "alert-turn-left",
    t: 27,
    label: "ক্রসিং",
    box: [0.12, 0.48, 0.76, 0.09],
    severity: "warn",
    say: "এখানে বাম দিকে ঘুরুন",
    vibrate: "left",
  },
];

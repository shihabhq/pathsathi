// Route from TSC, University of Dhaka to Dhaka Medical College Hospital.
// Waypoints are approximate: adjust visually against the satellite map.

export type LatLng = [number, number];

export const START: LatLng = [23.7326, 90.396];
export const END: LatLng = [23.7253, 90.3977];

export const ROUTE: LatLng[] = [
  START,
  [23.7319, 90.3962],
  [23.7311, 90.3963],
  [23.7303, 90.3961],
  [23.7296, 90.3965],
  [23.729, 90.397],
  [23.7283, 90.3971],
  [23.7275, 90.3969],
  [23.7268, 90.3972],
  [23.7261, 90.3975],
  END,
];

// Cumulative length at each waypoint (degrees are fine for a route this small).
const dist = (a: LatLng, b: LatLng) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const cum: number[] = [0];
for (let i = 1; i < ROUTE.length; i++) cum.push(cum[i - 1] + dist(ROUTE[i - 1], ROUTE[i]));
const TOTAL = cum[cum.length - 1];

/** Point at fraction p (0 to 1) of the way along the route. */
export function pointAt(p: number): LatLng {
  const d = Math.min(Math.max(p, 0), 1) * TOTAL;
  let i = 1;
  while (i < cum.length - 1 && cum[i] < d) i++;
  const f = (d - cum[i - 1]) / (cum[i] - cum[i - 1] || 1);
  const [a, b] = [ROUTE[i - 1], ROUTE[i]];
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
}

/** The route drawn so far, up to fraction p. */
export function routeUpTo(p: number): LatLng[] {
  const d = Math.min(Math.max(p, 0), 1) * TOTAL;
  const pts = ROUTE.filter((_, i) => cum[i] < d);
  return [...pts, pointAt(p)];
}

/** Map labels that pop in when the drawn line reaches `at`. */
export const ROUTE_LABELS = [
  { at: 0.42, text: "ফুটপাত শনাক্ত হয়েছে", dot: "#30D158", side: "right" },
  { at: 0.68, text: "ক্রসিং", dot: "#FFD60A", side: "left" },
] as const;

export const DESTINATION_NAME = "ঢাকা মেডিকেল কলেজ হাসপাতাল";
/** Short form for the map pill, so it fits on screen. */
export const DESTINATION_SHORT = "ঢাকা মেডিকেল";

/** Landmark names shown on the family view as the walker progresses (fraction of route). */
const PLACES = [
  { until: 0.35, name: "ঢাকা বিশ্ববিদ্যালয়" },
  { until: 0.7, name: "শহীদ মিনারের কাছে" },
  { until: 1, name: "মেডিকেল কলেজের কাছে" },
] as const;

export function placeAt(p: number): string {
  return (PLACES.find((x) => p < x.until) ?? PLACES[PLACES.length - 1]).name;
}

"use client";

import { END, ROUTE, START, pointAt, routeUpTo, type LatLng } from "@/lib/demo/route";

const W = 100;
const H = 132;
const PAD = 14;

// Flat projection scaled by cos(latitude); enough for a route this small.
const K = Math.cos((23.73 * Math.PI) / 180);
const lats = ROUTE.map((p) => p[0]);
const lngs = ROUTE.map((p) => p[1] * K);
const [minLat, maxLat] = [Math.min(...lats), Math.max(...lats)];
const [minLng, maxLng] = [Math.min(...lngs), Math.max(...lngs)];
const scale = Math.min((W - PAD * 2) / (maxLng - minLng || 1), (H - PAD * 2) / (maxLat - minLat || 1));
const offX = (W - (maxLng - minLng) * scale) / 2;
const offY = (H - (maxLat - minLat) * scale) / 2;

const xy = ([lat, lng]: LatLng): [number, number] => [
  offX + (lng * K - minLng) * scale,
  offY + (maxLat - lat) * scale,
];
const path = (pts: LatLng[]) => pts.map((p) => xy(p).join(",")).join(" ");

/** Schematic route map with a moving dot. `progress` is 0 to 1 along the route. */
export default function MiniMap({ progress }: { progress: number }) {
  const [dx, dy] = xy(pointAt(progress));
  const [sx, sy] = xy(START);
  const [ex, ey] = xy(END);
  return (
    <svg
      role="img"
      aria-label="ছোট মানচিত্র"
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      className="rounded-2xl border border-white/25 bg-black/70 backdrop-blur"
    >
      <polyline points={path(ROUTE)} fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={path(routeUpTo(progress))} fill="none" stroke="#FFD60A" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={sx} cy={sy} r="4" fill="#fff" />
      <circle cx={ex} cy={ey} r="5" fill="#30D158" />
      <circle cx={dx} cy={dy} r="10" fill="#FFD60A" fillOpacity="0.35">
        <animate attributeName="r" values="7;13;7" dur="1.4s" repeatCount="indefinite" />
      </circle>
      <circle cx={dx} cy={dy} r="6" fill="#FFD60A" stroke="#000" strokeWidth="2" />
    </svg>
  );
}

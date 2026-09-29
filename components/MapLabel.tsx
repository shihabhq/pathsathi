"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { LatLng } from "@/lib/demo/route";
import { useMap, useMapEvents } from "react-leaflet";

const EDGE = 12; // minimum gap to the screen edge
const GAP = 16; // gap between the dot and the pill
const TOP_SAFE = 64; // below the attribution line
const BOTTOM_SAFE = 420; // above the bottom sheet

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), Math.max(lo, hi));

/**
 * Dark pill label next to a map point. It is a normal element (not a Leaflet marker), so it
 * can be measured and kept fully inside the visible map: it flips sides near the screen edge
 * and never sits under the bottom sheet.
 */
export default function MapLabel({
  position,
  text,
  side,
}: {
  position: LatLng;
  text: string;
  side: "left" | "right";
}) {
  const map = useMap();
  const ref = useRef<HTMLDivElement>(null);
  const [pt, setPt] = useState(() => map.latLngToContainerPoint(position));
  const [size, setSize] = useState({ w: 0, h: 0 });

  const update = () => setPt(map.latLngToContainerPoint(position));
  useMapEvents({ move: update, zoom: update, moveend: update, resize: update });

  useLayoutEffect(() => {
    const el = ref.current;
    if (el) setSize({ w: el.offsetWidth, h: el.offsetHeight });
  }, [text]);

  const { x: W, y: H } = map.getSize();
  const fitsRight = pt.x + GAP + size.w <= W - EDGE;
  const fitsLeft = pt.x - GAP - size.w >= EDGE;
  let left: number;
  let top: number;
  if (!fitsRight && !fitsLeft) {
    // Too wide for either side of the dot: sit centred above it so the dot stays visible.
    left = clamp(pt.x - size.w / 2, EDGE, W - EDGE - size.w);
    top = clamp(pt.y - GAP - size.h, TOP_SAFE, H - BOTTOM_SAFE - size.h);
  } else {
    const placeRight = side === "right" ? fitsRight : !fitsLeft;
    left = placeRight ? pt.x + GAP : pt.x - GAP - size.w;
    top = clamp(pt.y - size.h / 2, TOP_SAFE, H - BOTTOM_SAFE - size.h);
  }

  return createPortal(
    <div ref={ref} className="map-label" style={{ left, top, visibility: size.w ? "visible" : "hidden" }}>
      {text}
    </div>,
    map.getContainer(),
  );
}

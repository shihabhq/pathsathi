"use client";

import { useEffect, useMemo, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { AttributionControl, MapContainer, Marker, Polyline, TileLayer, useMap } from "react-leaflet";
import {
  DESTINATION_NAME,
  END,
  ROUTE,
  ROUTE_LABELS,
  START,
  pointAt,
  routeUpTo,
} from "@/lib/demo/route";

const ESRI =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
const ESRI_ATTRIBUTION = "Tiles © Esri, Maxar, Earthstar Geographics, and the GIS User Community";

const DRAW_DELAY_MS = 1200;
const DRAW_MS = 3200;

const chip = (text: string, tone: string) =>
  L.divIcon({ className: "", html: `<div class="map-chip ${tone}">${text}</div>`, iconSize: [0, 0] });
const dot = (tone = "") => L.divIcon({ className: "", html: `<div class="map-dot ${tone}"></div>`, iconSize: [0, 0] });

/** Starts wide, then flies in to frame the route above the bottom sheet. */
function ZoomToRoute() {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => {
      map.flyToBounds(L.latLngBounds(ROUTE), {
        paddingTopLeft: [40, 80],
        paddingBottomRight: [40, 400],
        duration: 2.2,
      });
    }, 300);
    return () => clearTimeout(t);
  }, [map]);
  return null;
}

/** 0 to 1 over DRAW_MS, after DRAW_DELAY_MS. */
function useDrawProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    let raf = 0;
    let t0 = 0;
    const tick = (now: number) => {
      t0 ||= now;
      const f = Math.min((now - t0) / DRAW_MS, 1);
      setP(1 - Math.pow(1 - f, 2));
      if (f < 1) raf = requestAnimationFrame(tick);
    };
    const start = setTimeout(() => (raf = requestAnimationFrame(tick)), DRAW_DELAY_MS);
    return () => {
      clearTimeout(start);
      cancelAnimationFrame(raf);
    };
  }, []);
  return p;
}

export default function RouteMap() {
  const progress = useDrawProgress();
  const line = useMemo(() => routeUpTo(progress), [progress]);
  const [centre] = useState(() => pointAt(0.5));

  return (
    <MapContainer
      center={centre}
      zoom={13}
      zoomControl={false}
      attributionControl={false}
      dragging={false}
      scrollWheelZoom={false}
      doubleClickZoom={false}
      touchZoom={false}
      keyboard={false}
      className="h-full w-full"
    >
      <TileLayer url={ESRI} attribution={ESRI_ATTRIBUTION} maxZoom={19} />
      <AttributionControl position="topleft" prefix={false} />
      <ZoomToRoute />

      {progress > 0 && (
        <>
          <Polyline positions={line} pathOptions={{ color: "#3DA9FC", weight: 14, opacity: 0.25, lineCap: "round" }} />
          <Polyline positions={line} pathOptions={{ color: "#3DA9FC", weight: 5, lineCap: "round", lineJoin: "round" }} />
        </>
      )}

      <Marker position={START} icon={dot()} interactive={false} />
      {ROUTE_LABELS.filter((l) => progress >= l.at).map((l) => (
        <Marker key={l.text} position={pointAt(l.at)} icon={chip(l.text, l.tone)} interactive={false} />
      ))}
      {progress >= 1 && (
        <>
          <Marker position={END} icon={dot("dest")} interactive={false} />
          <Marker position={END} icon={chip(DESTINATION_NAME, "dest")} interactive={false} />
        </>
      )}
    </MapContainer>
  );
}

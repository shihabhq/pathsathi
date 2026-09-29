"use client";

import { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { AttributionControl, MapContainer, Marker, Polyline, TileLayer, useMap } from "react-leaflet";
import { END, ROUTE, START, pointAt, routeUpTo } from "@/lib/demo/route";

const OSM = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

const personIcon = L.divIcon({
  className: "",
  html: '<div class="map-chip pin">রাফি</div><div class="map-dot"></div>',
  iconSize: [0, 0],
});
const endIcon = L.divIcon({ className: "", html: '<div class="map-dot dest"></div>', iconSize: [0, 0] });

/** Frames the whole route above the bottom card. */
function FitRoute() {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(L.latLngBounds(ROUTE), {
      paddingTopLeft: [40, 60],
      paddingBottomRight: [40, 300],
      animate: false,
    });
  }, [map]);
  return null;
}

/** Family view map (OpenStreetMap). `progress` is 0 to 1 along the route. */
export default function FamilyMap({ progress }: { progress: number }) {
  const [centre] = useState(() => pointAt(0.5));
  return (
    <MapContainer
      center={centre}
      zoom={16}
      zoomControl={false}
      attributionControl={false}
      dragging={false}
      scrollWheelZoom={false}
      doubleClickZoom={false}
      touchZoom={false}
      keyboard={false}
      className="h-full w-full"
    >
      <TileLayer url={OSM} attribution="© OpenStreetMap contributors" maxZoom={19} />
      <AttributionControl position="topleft" prefix={false} />
      <FitRoute />
      <Polyline positions={ROUTE} pathOptions={{ color: "#0A1A3F", weight: 6, opacity: 0.35, lineCap: "round" }} />
      <Polyline positions={routeUpTo(progress)} pathOptions={{ color: "#3DA9FC", weight: 7, lineCap: "round", lineJoin: "round" }} />
      <Marker position={START} icon={endIcon} interactive={false} />
      <Marker position={END} icon={endIcon} interactive={false} />
      <Marker position={pointAt(progress)} icon={personIcon} interactive={false} zIndexOffset={1000} />
    </MapContainer>
  );
}

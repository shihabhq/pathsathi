"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import FamilyScreen from "./FamilyScreen";
import PhoneFrame from "./PhoneFrame";

/** Scene 6 (/family) as its own page. R restarts, F toggles the frame. */
export default function FamilyView() {
  const params = useSearchParams();
  const [frame, setFrame] = useState(params.get("frame") === "1");
  const [run, setRun] = useState(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "r" || e.key === "R") setRun((n) => n + 1);
      if (e.key === "f" || e.key === "F") setFrame((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <PhoneFrame enabled={frame}>
      <FamilyScreen key={run} />
    </PhoneFrame>
  );
}

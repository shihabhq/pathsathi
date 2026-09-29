"use client";

import { useEffect, useState } from "react";

const SCREEN_W = 390;
const SCREEN_H = 844;
const BEZEL = 12;

/**
 * Wraps the app screen. When `enabled` it draws a 390 x 844 phone on a dark
 * page, scaled down to fit the window. When not, the screen fills the window.
 * The DOM structure is identical in both modes so children never remount.
 */
export default function PhoneFrame({
  enabled,
  children,
}: {
  enabled: boolean;
  children: React.ReactNode;
}) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const fit = () => {
      const w = SCREEN_W + BEZEL * 2 + 24;
      const h = SCREEN_H + BEZEL * 2 + 24;
      setScale(Math.min(1, window.innerWidth / w, window.innerHeight / h));
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  return (
    <div
      className={
        enabled
          ? "fixed inset-0 flex items-center justify-center overflow-hidden bg-[#050505]"
          : "h-dvh w-full"
      }
    >
      <div
        className={enabled ? "shrink-0 bg-[#2a2a2c] shadow-[0_30px_80px_#000]" : "h-full w-full"}
        style={
          enabled
            ? {
                width: SCREEN_W + BEZEL * 2,
                height: SCREEN_H + BEZEL * 2,
                padding: BEZEL,
                borderRadius: 56,
                transform: `scale(${scale})`,
              }
            : undefined
        }
      >
        <div
          className="relative h-full w-full overflow-hidden bg-background"
          style={enabled ? { borderRadius: 44 } : undefined}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

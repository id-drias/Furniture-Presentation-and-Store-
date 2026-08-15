"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { getSlot, type MotionSlotKey } from "@/lib/media";

/* ------------------------------------------------------------------ *
 * Ambient motion layer.
 *
 * If lib/media.ts has a URL for this slot, we play it. If it does not
 * — or the file fails to load, or the visitor has asked for reduced
 * motion — we fall back to the CSS caustics field, which is a first-
 * class look rather than a placeholder.
 * ------------------------------------------------------------------ */

interface AmbientVideoProps {
  slot: MotionSlotKey;
  className?: string;
  /** 0–1. Ambient light should sit well under the photography. */
  opacity?: number;
  /** CSS blend mode against whatever sits behind it. */
  blend?: "screen" | "soft-light" | "overlay" | "normal";
}

export function AmbientVideo({
  slot,
  className = "",
  opacity = 0.55,
  blend = "screen",
}: AmbientVideoProps) {
  const { src, poster } = getSlot(slot);
  const reduced = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);

  const useVideo = Boolean(src) && !reduced && !failed;

  /* Autoplay can still be refused (low-power mode); fall back cleanly. */
  useEffect(() => {
    if (!useVideo || !videoRef.current) return;
    const play = videoRef.current.play();
    if (play && typeof play.catch === "function") play.catch(() => setFailed(true));
  }, [useVideo]);

  if (useVideo) {
    return (
      <div
        className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
        style={{ opacity, mixBlendMode: blend }}
        aria-hidden
      >
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          src={src ?? undefined}
          poster={poster ?? undefined}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          onError={() => setFailed(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={`caustics ${className}`}
      style={{ opacity, mixBlendMode: blend }}
      aria-hidden
    />
  );
}

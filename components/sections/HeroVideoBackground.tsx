"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { getSlot, type MotionSlotKey } from "@/lib/media";
import { spring, springSnappy } from "@/lib/motion";

/* ------------------------------------------------------------------ *
 * Full-bleed cinematic video plate.
 *
 * Three things earn their keep here beyond "render a <video>":
 *
 *  1. It only decodes while on screen. An IntersectionObserver pauses
 *     playback once the hero scrolls away, so a looping background does
 *     not burn a laptop battery for the whole page.
 *  2. It degrades in every direction — no source, decode error, refused
 *     autoplay (low-power mode), or prefers-reduced-motion all land on
 *     the same still frame rather than a black rectangle.
 *  3. The grade is part of the component. A dark scrim, a vignette and
 *     screen-blended grain are what let a 480p source hold a 4K screen.
 * ------------------------------------------------------------------ */

interface HeroVideoBackgroundProps {
  slot: MotionSlotKey;
  /** Sharp still shown before decode, on failure, and under reduced motion. */
  fallbackImage: string;
  /** 0–1. How hard the dark grade sits over the footage. */
  scrim?: number;
  className?: string;
}

/*
 * Renders as an `absolute inset-0` plate; the caller stacks its own content
 * as a sibling at `z-30`. Content is deliberately *not* a child: nesting it
 * inside this clipped, viewport-height box would crop the headline on short
 * screens. The controls sit at z-40 so they stay clickable above content.
 */
export function HeroVideoBackground({
  slot,
  fallbackImage,
  scrim = 0.58,
  className = "",
}: HeroVideoBackgroundProps) {
  const { src, poster, hasAudio } = getSlot(slot);
  const reduced = useReducedMotion();

  const videoRef = useRef<HTMLVideoElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);

  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(true);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(false);

  const useVideo = Boolean(src) && !reduced && !failed;

  /* ---- autoplay, with a graceful refusal path ---- */
  useEffect(() => {
    const el = videoRef.current;
    if (!useVideo || !el) return;

    const attempt = el.play();
    if (attempt && typeof attempt.catch === "function") {
      attempt.catch(() => setPlaying(false));
    }
  }, [useVideo]);

  /* ---- stop decoding once the hero leaves the viewport ---- */
  useEffect(() => {
    const el = videoRef.current;
    const shell = shellRef.current;
    if (!useVideo || !el || !shell) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (playing) el.play().catch(() => {});
        } else {
          el.pause();
        }
      },
      { threshold: 0.05 },
    );

    io.observe(shell);
    return () => io.disconnect();
  }, [useVideo, playing]);

  const onLoaded = useCallback(() => setReady(true), []);

  const togglePlay = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      el.play()
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false));
    } else {
      el.pause();
      setPlaying(false);
    }
  }, []);

  const toggleMute = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    el.muted = !el.muted;
    setMuted(el.muted);
  }, []);

  return (
    <div
      ref={shellRef}
      className={`grain-film absolute inset-0 overflow-hidden bg-onyx ${className}`}
      onMouseEnter={() => setControlsVisible(true)}
      onMouseLeave={() => setControlsVisible(false)}
    >
      {/* ---------------------- the plate ---------------------- */}
      <div className="absolute inset-0">
        {/* Sharp still underneath: covers first paint, decode failure and
            reduced motion without a flash of empty black. */}
        <div
          aria-hidden
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${poster ?? fallbackImage})` }}
        />

        {useVideo && (
          <motion.video
            ref={videoRef}
            /* The ken-burns push is CSS, not motion — it must keep running
               even while the JS main thread is busy hydrating. */
            className="absolute inset-0 h-full w-full object-cover"
            style={{ animation: "hero-drift 26s ease-in-out infinite alternate" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: ready ? 1 : 0 }}
            transition={{ duration: 1.1, ease: [0.22, 0.61, 0.36, 1] }}
            src={src ?? undefined}
            poster={poster ?? fallbackImage}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            onLoadedData={onLoaded}
            onError={() => setFailed(true)}
            aria-hidden
          />
        )}
      </div>

      {/* ---------------------- the grade ---------------------- */}
      {/* Base darkening, so oversized white type always clears AA contrast. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-onyx"
        style={{ opacity: scrim }}
      />
      {/* Top band for the glass header, bottom band for the content block. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-onyx/85 via-transparent to-onyx/95"
      />
      {/* Vignette — pulls the eye to the centre and hides upscaling at the
          frame edges, where it is most visible. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 85% at 50% 45%, transparent 30%, rgba(8,12,22,0.55) 78%, rgba(8,12,22,0.9) 100%)",
        }}
      />
      {/* Warm light spill from the off-frame window, tying the footage to
          the champagne accent used everywhere else. */}
      <div
        aria-hidden
        className="spill spill-gold left-[-10%] top-[6%] h-[46vh] w-[46vh] opacity-40"
      />
      <div
        aria-hidden
        className="spill spill-bronze bottom-[-8%] right-[-6%] h-[40vh] w-[40vh] opacity-30"
      />

      {/* ---------------------- controls ---------------------- */}
      {useVideo && (
        <motion.div
          className="absolute bottom-5 right-5 z-40 flex items-center gap-2 sm:bottom-7 sm:right-7"
          initial={{ opacity: 0, y: 12 }}
          animate={{
            opacity: controlsVisible ? 1 : 0.42,
            y: 0,
          }}
          transition={spring}
        >
          <AnimatePresence initial={false}>
            {hasAudio && (
              <motion.div
                key="mute"
                initial={{ opacity: 0, scale: 0.85, width: 0 }}
                animate={{ opacity: 1, scale: 1, width: "auto" }}
                exit={{ opacity: 0, scale: 0.85, width: 0 }}
                transition={springSnappy}
              >
                <ControlButton
                  onClick={toggleMute}
                  label={muted ? "Unmute video" : "Mute video"}
                >
                  {muted ? <IconMuted /> : <IconSound />}
                </ControlButton>
              </motion.div>
            )}
          </AnimatePresence>

          <ControlButton
            onClick={togglePlay}
            label={playing ? "Pause video" : "Play video"}
          >
            {playing ? <IconPause /> : <IconPlay />}
          </ControlButton>
        </motion.div>
      )}
    </div>
  );
}

/* ------------------------------- bits ------------------------------- */

function ControlButton({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <motion.button
      onClick={onClick}
      aria-label={label}
      title={label}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      transition={springSnappy}
      className="glass-dark tap-clean edge-metal grid h-10 w-10 place-items-center rounded-full text-white/90 transition-colors duration-300 hover:text-white"
    >
      {children}
    </motion.button>
  );
}

function IconPlay() {
  return (
    <svg width="11" height="12" viewBox="0 0 11 12" fill="none" aria-hidden>
      <path d="M1 1.2v9.6L10 6 1 1.2Z" fill="currentColor" />
    </svg>
  );
}

function IconPause() {
  return (
    <svg width="10" height="12" viewBox="0 0 10 12" fill="none" aria-hidden>
      <path d="M1 0h2.2v12H1zM6.8 0H9v12H6.8z" fill="currentColor" />
    </svg>
  );
}

function IconSound() {
  return (
    <svg width="15" height="13" viewBox="0 0 15 13" fill="none" aria-hidden>
      <path
        d="M1 4.6h2.6L7 1.5v10L3.6 8.4H1V4.6Z"
        fill="currentColor"
      />
      <path
        d="M9.6 4.2a3.2 3.2 0 0 1 0 4.6M11.7 2.2a6 6 0 0 1 0 8.6"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconMuted() {
  return (
    <svg width="15" height="13" viewBox="0 0 15 13" fill="none" aria-hidden>
      <path d="M1 4.6h2.6L7 1.5v10L3.6 8.4H1V4.6Z" fill="currentColor" />
      <path
        d="M10 4.4l4 4.2M14 4.4l-4 4.2"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

import type { Transition, Variants } from "motion/react";

/* ------------------------------------------------------------------ *
 * One motion vocabulary for the whole site.
 *
 * Every spring in the build comes from this file. Components never
 * hand-roll a transition, which is what keeps a card hover, a drawer
 * and a filter reflow feeling like the same physical material.
 * ------------------------------------------------------------------ */

/**
 * House spring. Everything defaults to this.
 *
 * 90 / 22 / 0.8. Softer than the previous pass and slightly lighter,
 * which sounds contradictory until you watch it: the lower stiffness
 * lengthens the travel so movement reads as *considered*, while the
 * reduced mass keeps it from feeling sluggish. Damping 22 against
 * stiffness 90 sits just under critical, so it settles cleanly with a
 * trace of follow-through — the difference between a drawer that
 * closes and a drawer that is closed by someone.
 */
export const spring: Transition = {
  type: "spring",
  stiffness: 90,
  damping: 22,
  mass: 0.8,
};

/** Snappier variant for things attached to the pointer. */
export const springSnappy: Transition = {
  type: "spring",
  stiffness: 240,
  damping: 26,
  mass: 0.5,
};

/** Heavier variant for large surfaces — drawers, modals, plates. */
export const springHeavy: Transition = {
  type: "spring",
  stiffness: 80,
  damping: 24,
  mass: 1.1,
};

/** Slow, wide travel for parallax and depth layers. */
export const springDepth = { stiffness: 90, damping: 28, restDelta: 0.001 };

/** For scroll-linked values, where a spring smooths raw scroll input. */
export const springScroll = { stiffness: 100, damping: 30, restDelta: 0.001 };

/** Apple's easing curve, for the few places a spring would overshoot badly. */
export const ease = [0.22, 0.61, 0.36, 1] as const;

/* ------------------------------- variants ------------------------------- */

/** Parent that staggers its children in reading order. */
export const staggerParent = (stagger = 0.07, delay = 0): Variants => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: stagger, delayChildren: delay },
  },
});

/** Standard entrance: rise, fade, and settle out of a slight blur. */
export const riseIn: Variants = {
  hidden: { opacity: 0, y: 28, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: spring,
  },
};

/** Same, but for oversized display type where the travel should be larger. */
export const riseInDisplay: Variants = {
  hidden: { opacity: 0, y: 48, filter: "blur(10px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { ...spring, stiffness: 80, damping: 21 },
  },
};

/** Plain fade for backdrops and scrims. */
export const fade: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, ease } },
  exit: { opacity: 0, transition: { duration: 0.28, ease } },
};

/** Modal body: scales up from just under 1 so it never feels like a zoom. */
export const modalIn: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 24, filter: "blur(8px)" },
  visible: { opacity: 1, scale: 1, y: 0, filter: "blur(0px)", transition: springHeavy },
  exit: {
    opacity: 0,
    scale: 0.97,
    y: 12,
    filter: "blur(6px)",
    transition: { duration: 0.22, ease },
  },
};

/** Right-hand slide-over. */
export const drawerIn: Variants = {
  hidden: { x: "100%" },
  visible: { x: 0, transition: springHeavy },
  exit: { x: "100%", transition: { duration: 0.32, ease } },
};

/** Grid tile entering or leaving a filtered set. */
export const tileIn: Variants = {
  hidden: { opacity: 0, scale: 0.94, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: spring },
  exit: { opacity: 0, scale: 0.94, transition: { duration: 0.2, ease } },
};

/** Shared viewport trigger — fires once, a little before the edge. */
export const viewportOnce = { once: true, amount: 0.25, margin: "0px 0px -12% 0px" };

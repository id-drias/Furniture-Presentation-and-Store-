"use client";

import { motion } from "motion/react";
import type { Variants } from "motion/react";
import { riseIn, riseInDisplay, staggerParent, viewportOnce } from "@/lib/motion";

/* ------------------------------------------------------------------ *
 * Scroll-driven entrances.
 *
 * `Stagger` sets the rhythm, `StaggerItem` inherits it. `Reveal` is
 * the one-off version for elements with no siblings to march with.
 * ------------------------------------------------------------------ */

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** Seconds before this element begins. */
  delay?: number;
  /** Larger travel + blur, for oversized display type. */
  display?: boolean;
}

export function Reveal({ children, className, delay = 0, display }: RevealProps) {
  const variants: Variants = display ? riseInDisplay : riseIn;
  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}

interface StaggerProps {
  children: React.ReactNode;
  className?: string;
  /** Seconds between children. */
  stagger?: number;
  delay?: number;
  id?: string;
}

export function Stagger({
  children,
  className,
  stagger = 0.07,
  delay = 0,
  id,
}: StaggerProps) {
  return (
    <motion.div
      id={id}
      className={className}
      variants={staggerParent(stagger, delay)}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  display,
}: {
  children: React.ReactNode;
  className?: string;
  display?: boolean;
}) {
  return (
    <motion.div className={className} variants={display ? riseInDisplay : riseIn}>
      {children}
    </motion.div>
  );
}

/** Inline-level stagger item, for words inside a headline. */
export function StaggerWord({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.span
      className={`inline-block ${className ?? ""}`}
      variants={riseInDisplay}
    >
      {children}
    </motion.span>
  );
}

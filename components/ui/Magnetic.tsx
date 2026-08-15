"use client";

import { useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";

import { springSnappy } from "@/lib/motion";
import { useFinePointer } from "@/lib/hooks";

/* ------------------------------------------------------------------ *
 * Magnetic attraction.
 *
 * The wrapper drifts toward the cursor; the label inside drifts a
 * little further. That second-order offset is what reads as depth
 * rather than as a button sliding around.
 * ------------------------------------------------------------------ */

interface MagneticProps {
  children: React.ReactNode;
  /** Peak travel in pixels. */
  strength?: number;
  className?: string;
}

export function Magnetic({ children, strength = 14, className = "" }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const fine = useFinePointer();
  const reduced = useReducedMotion();

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, springSnappy);
  const y = useSpring(rawY, springSnappy);

  const enabled = fine && !reduced;

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!enabled || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
    const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
    rawX.set(Math.max(-1, Math.min(1, dx)) * strength);
    rawY.set(Math.max(-1, Math.min(1, dy)) * strength);
  };

  const reset = () => {
    rawX.set(0);
    rawY.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={reset}
      onPointerCancel={reset}
      style={enabled ? { x, y } : undefined}
      className={`inline-flex ${className}`}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ *
 * The house button. Pill, hairline, champagne on the dark variant.
 * ------------------------------------------------------------------ */

type Variant = "solid" | "outline" | "ghost" | "glass";
type Size = "md" | "lg";

interface ButtonProps
  extends Omit<React.ComponentPropsWithoutRef<"button">, "onAnimationStart" | "onDragStart" | "onDragEnd" | "onDrag"> {
  variant?: Variant;
  size?: Size;
  href?: string;
  magnetic?: boolean;
  strength?: number;
}

const base =
  "tap-clean relative inline-flex items-center justify-center gap-2.5 rounded-full font-medium " +
  "tracking-[0.01em] transition-colors duration-500 disabled:opacity-40 disabled:pointer-events-none " +
  "whitespace-nowrap select-none";

/*
 * Four variants, no fills beyond flat ink. The previous pass had a
 * struck-metal gradient here; a gold button is the fastest way to make
 * a page look like it is selling something rather than showing it.
 */
const variants: Record<Variant, string> = {
  solid: "bg-obsidian text-white hover:bg-[#1a2436]",
  outline:
    "bg-transparent text-obsidian hairline hover:border-[rgba(15,23,42,0.22)]",
  ghost: "text-obsidian hover:bg-obsidian/[0.04]",
  /* Over footage. */
  glass: "glass-dark text-white hover:bg-white/[0.16]",
};

/* Taller and wider than before. A button with generous internal margin
   reads as considered; a tight one reads as a control. */
const sizes: Record<Size, string> = {
  md: "h-12 px-7 text-[0.8125rem]",
  lg: "h-[3.75rem] px-10 text-[0.875rem]",
};

export function MagneticButton({
  children,
  variant = "solid",
  size = "md",
  href,
  magnetic = true,
  strength = 12,
  className = "",
  ...rest
}: ButtonProps) {
  const cls = `${base} ${variants[variant]} ${sizes[size]} ${className}`;

  const inner = href ? (
    <motion.a
      href={href}
      className={cls}
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.985 }}
      transition={springSnappy}
    >
      {children}
    </motion.a>
  ) : (
    <motion.button
      className={cls}
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.985 }}
      transition={springSnappy}
      {...rest}
    >
      {children}
    </motion.button>
  );

  return magnetic ? <Magnetic strength={strength}>{inner}</Magnetic> : inner;
}

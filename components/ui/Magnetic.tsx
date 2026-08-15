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

type Variant = "solid" | "outline" | "ghost" | "metal" | "glass";
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
  "tap-clean relative inline-flex items-center justify-center gap-2 rounded-full font-medium " +
  "tracking-[-0.01em] transition-colors duration-300 disabled:opacity-40 disabled:pointer-events-none " +
  "whitespace-nowrap select-none";

const variants: Record<Variant, string> = {
  solid:
    "bg-obsidian text-white hover:bg-[#1c2740] shadow-[0_1px_2px_rgba(15,23,42,0.16),0_16px_36px_-16px_rgba(15,23,42,0.55)]",
  outline:
    "bg-white/70 text-obsidian hairline backdrop-blur-xl hover:bg-white hover:border-[rgba(15,23,42,0.16)]",
  ghost: "text-obsidian hover:bg-obsidian/[0.05]",
  /* Struck metal: a real gradient fill with a bright specular band, dark
     ink on top for contrast, and a gold light-spill that blooms on hover. */
  metal:
    "text-onyx bg-[linear-gradient(100deg,#a8842a_0%,#d4af37_20%,#f6ecc4_46%,#d4af37_66%,#b0763d_100%)] " +
    "shadow-[inset_0_1px_0_rgba(255,255,255,0.65),0_10px_30px_-12px_rgba(212,175,55,0.7)] " +
    "hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_0_35px_rgba(212,175,55,0.4),0_12px_34px_-12px_rgba(212,175,55,0.8)]",
  /* For placement over footage. */
  glass: "glass-dark edge-metal edge-metal-on text-white hover:text-white",
};

const sizes: Record<Size, string> = {
  md: "h-11 px-6 text-[0.875rem]",
  lg: "h-14 px-8 text-[0.9375rem]",
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
      whileHover={{ scale: 1.025 }}
      whileTap={{ scale: 0.975 }}
      transition={springSnappy}
    >
      {children}
    </motion.a>
  ) : (
    <motion.button
      className={cls}
      whileHover={{ scale: 1.025 }}
      whileTap={{ scale: 0.975 }}
      transition={springSnappy}
      {...rest}
    >
      {children}
    </motion.button>
  );

  return magnetic ? <Magnetic strength={strength}>{inner}</Magnetic> : inner;
}

"use client";

import { useRef } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import { spring } from "@/lib/motion";
import { useFinePointer } from "@/lib/hooks";

/* ------------------------------------------------------------------ *
 * 3D plate tilt.
 *
 * Rotation is capped low (8° by default) — past about ten it stops
 * reading as a physical object under glass and starts reading as a
 * gimmick. A specular sweep tracks the pointer to sell the depth.
 * ------------------------------------------------------------------ */

interface TiltPlateProps {
  children: React.ReactNode;
  className?: string;
  /** Maximum rotation in degrees on either axis. */
  max?: number;
  /** Lift toward the viewer, in pixels of translateZ. */
  lift?: number;
  /** Render the moving specular highlight. */
  glare?: boolean;
}

export function TiltPlate({
  children,
  className = "",
  max = 8,
  lift = 24,
  glare = true,
}: TiltPlateProps) {
  const ref = useRef<HTMLDivElement>(null);
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  const enabled = fine && !reduced;

  /* -1 … 1 across each axis */
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const hover = useMotionValue(0);

  const sx = useSpring(px, spring);
  const sy = useSpring(py, spring);
  const sHover = useSpring(hover, spring);

  const rotateY = useTransform(sx, [-1, 1], [-max, max]);
  const rotateX = useTransform(sy, [-1, 1], [max, -max]);
  const z = useTransform(sHover, [0, 1], [0, lift]);

  /* Specular sweep position, in percent. */
  const gx = useTransform(sx, [-1, 1], [15, 85]);
  const gy = useTransform(sy, [-1, 1], [10, 90]);
  const glareBg = useMotionTemplate`radial-gradient(46% 40% at ${gx}% ${gy}%, rgba(255,255,255,0.55), rgba(255,255,255,0) 70%)`;
  const glareOpacity = useTransform(sHover, [0, 1], [0, 1]);

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!enabled || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    px.set(((e.clientX - r.left) / r.width) * 2 - 1);
    py.set(((e.clientY - r.top) / r.height) * 2 - 1);
  };

  const onEnter = () => enabled && hover.set(1);
  const onLeave = () => {
    px.set(0);
    py.set(0);
    hover.set(0);
  };

  if (!enabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div ref={ref} className={`stage-3d ${className}`}>
      <motion.div
        onPointerMove={onPointerMove}
        onPointerEnter={onEnter}
        onPointerLeave={onLeave}
        onPointerCancel={onLeave}
        style={{ rotateX, rotateY, z, transformStyle: "preserve-3d" }}
        className="relative h-full w-full"
      >
        {children}
        {glare && (
          <motion.div
            aria-hidden
            style={{ background: glareBg, opacity: glareOpacity }}
            className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] mix-blend-soft-light"
          />
        )}
      </motion.div>
    </div>
  );
}

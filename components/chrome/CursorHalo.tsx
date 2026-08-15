"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { useFinePointer } from "@/lib/hooks";

/* ------------------------------------------------------------------ *
 * A hairline ring that trails the cursor and swells over anything
 * interactive. Fine pointers only — never on touch, never under
 * prefers-reduced-motion.
 * ------------------------------------------------------------------ */

const RING = 26;

export function CursorHalo() {
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  const enabled = fine && !reduced;

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 520, damping: 42, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 520, damping: 42, mass: 0.5 });

  const [active, setActive] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const onMove = (e: PointerEvent) => {
      x.set(e.clientX - RING / 2);
      y.set(e.clientY - RING / 2);
      if (!visible) setVisible(true);

      const el = e.target as HTMLElement | null;
      setActive(
        Boolean(
          el?.closest?.(
            'a, button, [role="button"], input, textarea, select, [data-cursor="hover"]',
          ),
        ),
      );
    };

    const onLeave = () => setVisible(false);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, [enabled, visible, x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[200] rounded-full"
      style={{
        x: sx,
        y: sy,
        width: RING,
        height: RING,
        border: "1px solid rgba(15,23,42,0.32)",
        backgroundColor: "rgba(194,168,124,0.10)",
      }}
      animate={{
        scale: active ? 2.1 : 1,
        opacity: visible ? (active ? 0.9 : 0.5) : 0,
        borderColor: active ? "rgba(163,133,79,0.55)" : "rgba(15,23,42,0.32)",
      }}
      transition={{ type: "spring", stiffness: 320, damping: 26 }}
    />
  );
}

"use client";

import { forwardRef, useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { TiltPlate } from "@/components/ui/TiltPlate";
import { useStore } from "@/components/providers/StoreProvider";
import { formatPrice, pad2 } from "@/lib/format";
import { spring, springDepth, springSnappy, tileIn } from "@/lib/motion";
import { t } from "@/lib/i18n";
import type { Locale, Product } from "@/lib/types";

/* ------------------------------------------------------------------ *
 * Bento tile.
 *
 * Footprints are sequenced so every row lands at the same height: a
 * half-width plate at 3:2 is exactly as tall as a third-width plate at
 * 1:1, which keeps the grid calm however it is filtered.
 *
 * The previous pass hung three glass chips, a gold bloom, a scarcity
 * badge and a gold-filled add button on each of thirteen tiles. All of
 * it is gone. A tile is now a photograph, a rule, and two lines of type.
 * The only thing that happens on hover is that the image moves closer.
 * ------------------------------------------------------------------ */

const SPAN: Record<Product["tile"], string> = {
  full: "sm:col-span-2 lg:col-span-6",
  wide: "sm:col-span-2 lg:col-span-3",
  std: "sm:col-span-1 lg:col-span-2",
};

const RATIO: Record<Product["tile"], string> = {
  full: "aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9]",
  wide: "aspect-[4/3] lg:aspect-[3/2]",
  std: "aspect-[4/3] sm:aspect-square",
};

const SIZES: Record<Product["tile"], string> = {
  full: "(max-width: 640px) 92vw, 95vw",
  wide: "(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 48vw",
  std: "(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 32vw",
};

interface ProductCardProps {
  product: Product;
  index: number;
  locale: Locale;
}

/**
 * Ref-forwarding is load-bearing: `AnimatePresence` in `popLayout` mode
 * attaches a ref to every child so it can lift the exiting tile out of
 * flow. A plain function component swallows it and the exit never ends.
 */
export const ProductCard = forwardRef<HTMLElement, ProductCardProps>(
  function ProductCard({ product, index, locale }, ref) {
    const { openQuickView, add } = useStore();
    const plateRef = useRef<HTMLDivElement>(null);

    /* Parallax: the photograph drifts against its own frame as the card
       crosses the viewport. The plate is over-scaled so travel never
       exposes an edge. Halved from the previous pass — at 7% it read as
       an effect; at 3.5% it reads as depth. */
    const { scrollYProgress } = useScroll({
      target: plateRef,
      offset: ["start end", "end start"],
    });
    const drift = useSpring(
      useTransform(scrollYProgress, [0, 1], ["-3.5%", "3.5%"]),
      springDepth,
    );

    return (
      <motion.article
        ref={ref}
        /* `layout` (reflow) but never `layoutId` — these tiles have no
           shared-element counterpart in the next filter state. */
        layout
        variants={tileIn}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={spring}
        className={`group relative ${SPAN[product.tile]}`}
      >
        <TiltPlate max={4} lift={14} glare={false} className="w-full">
          <div ref={plateRef} className="relative">
            <button
              onClick={() => openQuickView(product)}
              aria-label={`${product.name} — ${t("quickView", locale)}`}
              className={`tap-clean relative block w-full overflow-hidden rounded-[4px] bg-ceramic ${RATIO[product.tile]}`}
            >
              <motion.span
                className="absolute inset-0 block scale-[1.08]"
                style={{ y: drift }}
              >
                <motion.span
                  className="absolute inset-0 block"
                  whileHover={{ scale: 1.035 }}
                  transition={spring}
                >
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes={SIZES[product.tile]}
                    priority={index === 0}
                    className="object-cover"
                  />
                </motion.span>
              </motion.span>
            </button>
          </div>
        </TiltPlate>

        {/* ------------------------- caption ------------------------- *
         * Index and price on one baseline, name and collection beneath.
         * A 0.5px rule does the work three chips were doing before.
         * ----------------------------------------------------------- */}
        <div className="pt-6">
          <div className="flex items-baseline justify-between gap-6">
            <span className="tnum label text-[10px]">{pad2(index + 1)}</span>
            <span className="tnum text-[0.8125rem] font-medium tracking-[-0.01em] text-obsidian">
              {formatPrice(product.price, locale)}
            </span>
          </div>

          <div className="rule mt-3" />

          <div className="flex items-start justify-between gap-6 pt-4">
            <div className="min-w-0">
              <h3 className="truncate text-[0.9375rem] font-medium tracking-[-0.015em] text-obsidian">
                {product.name}
              </h3>
              <p className="mt-1.5 truncate text-[0.8125rem] text-ink-faint">
                {product.collection}
              </p>
            </div>

            {/* Reveals on hover; keyboard users get it on focus. */}
            <motion.button
              onClick={() => add(product.id)}
              aria-label={`${t("addToCart", locale)} — ${product.name}`}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              transition={springSnappy}
              className="tap-clean mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink-faint opacity-0 transition-[opacity,color,background-color] duration-500 hover:bg-obsidian hover:text-white focus-visible:opacity-100 group-hover:opacity-100"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
                <path d="M5 0v10M0 5h10" stroke="currentColor" strokeWidth="1.2" />
              </svg>
            </motion.button>
          </div>
        </div>
      </motion.article>
    );
  },
);

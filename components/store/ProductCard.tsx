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
 * Footprints are chosen so every row lands at the same height: a
 * half-width plate at 3:2 is exactly as tall as a third-width plate
 * at 1:1, which keeps the grid calm however it is filtered.
 *
 * The metal is conditional. At rest the tile is a photograph on white;
 * the gold edge, the light spill and the material chip all arrive on
 * hover, so a grid of thirteen never looks like a jewellery counter.
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
 * Ref-forwarding is load-bearing, not ceremony: `AnimatePresence` in
 * `popLayout` mode attaches a ref to every child so it can lift the
 * exiting tile out of flow.
 */
export const ProductCard = forwardRef<HTMLElement, ProductCardProps>(
  function ProductCard({ product, index, locale }, ref) {
    const { openQuickView, add } = useStore();
    const scarce = product.stock <= 3;
    const plateRef = useRef<HTMLDivElement>(null);

    /* Per-card parallax: the photograph drifts against its own frame as
       the card crosses the viewport. The inner plate is over-scaled so
       the travel never exposes an edge. */
    const { scrollYProgress } = useScroll({
      target: plateRef,
      offset: ["start end", "end start"],
    });
    const drift = useSpring(
      useTransform(scrollYProgress, [0, 1], ["-7%", "7%"]),
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
        <TiltPlate max={7} lift={26} className="w-full">
          <div ref={plateRef} className="relative">
            <button
              onClick={() => openQuickView(product)}
              aria-label={`${product.name} — ${t("quickView", locale)}`}
              className={`tap-clean plate edge-metal glow-gold-hover relative block w-full overflow-hidden rounded-[22px] bg-ceramic sm:rounded-[26px] ${RATIO[product.tile]}`}
            >
              {/* over-scaled so parallax travel never reveals an edge */}
              <motion.span
                className="absolute inset-0 block scale-[1.16]"
                style={{ y: drift }}
              >
                <motion.span
                  className="absolute inset-0 block"
                  whileHover={{ scale: 1.04 }}
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

              {/* legibility wash + a warm bloom that only exists on hover */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-onyx/45 via-transparent to-onyx/10 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
              />
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
                style={{
                  background:
                    "radial-gradient(70% 50% at 50% 100%, rgba(212,175,55,0.22), transparent 70%)",
                }}
              />

              {/* catalogue index */}
              <span className="tnum absolute left-4 top-4 z-10 text-[10px] font-medium tracking-[0.2em] text-white/85 mix-blend-difference">
                {pad2(index + 1)}
              </span>

              {/* scarcity */}
              {scarce && (
                <span className="glass-dark edge-metal edge-metal-on absolute right-4 top-4 z-10 rounded-full px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-gold-light">
                  {t("lastPieces", locale)}
                </span>
              )}

              {/* ---- micro-badges: craft + material ---- */}
              <span className="pointer-events-none absolute inset-x-4 bottom-4 z-10 flex flex-wrap items-center gap-1.5 opacity-0 transition-all duration-500 ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:translate-y-0 group-hover:opacity-100 max-sm:hidden [transform:translateY(8px)]">
                <span className="glass-dark rounded-full px-3 py-1.5 text-[10px] font-medium tracking-[0.04em] text-white">
                  {t("quickView", locale)}
                </span>
                <span className="glass-dark flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-medium tracking-[0.04em] text-white/85">
                  <span
                    className="h-2 w-2 rounded-full ring-1 ring-white/40"
                    style={{ backgroundColor: product.materials[0].swatch }}
                    aria-hidden
                  />
                  {product.materials[0].name[locale]}
                </span>
                {product.edition && (
                  <span className="glass-dark rounded-full px-3 py-1.5 text-[10px] font-medium tracking-[0.04em] text-gold-light">
                    {product.edition}
                  </span>
                )}
              </span>
            </button>
          </div>
        </TiltPlate>

        {/* ------------------------- caption ------------------------- */}
        <div className="flex items-start justify-between gap-4 px-1 pt-5">
          <div className="min-w-0">
            <h3 className="truncate text-[0.9375rem] font-medium tracking-[-0.015em] text-obsidian transition-colors duration-500 group-hover:text-gold-deep">
              {product.name}
            </h3>
            {/* The collection name, not the tagline: a tagline long enough
                to be worth reading is long enough to truncate mid-sentence. */}
            <p className="mt-1 truncate text-[0.8125rem] text-ink-faint">
              {product.collection}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2.5">
            <span className="tnum text-[0.9375rem] font-medium tracking-[-0.015em] text-obsidian">
              {formatPrice(product.price, locale)}
            </span>
            <motion.button
              onClick={() => add(product.id)}
              aria-label={`${t("addToCart", locale)} — ${product.name}`}
              whileHover={{ scale: 1.14 }}
              whileTap={{ scale: 0.9 }}
              transition={springSnappy}
              className="tap-clean grid h-7 w-7 place-items-center rounded-full bg-obsidian/[0.055] text-obsidian transition-all duration-400 hover:bg-[linear-gradient(120deg,#d4af37,#f6ecc4_50%,#b0763d)] hover:text-onyx hover:shadow-[0_0_18px_rgba(212,175,55,0.55)]"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
                <path d="M5 0v10M0 5h10" stroke="currentColor" strokeWidth="1.3" />
              </svg>
            </motion.button>
          </div>
        </div>
      </motion.article>
    );
  },
);

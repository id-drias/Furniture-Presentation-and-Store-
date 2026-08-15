"use client";

import { forwardRef } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { TiltPlate } from "@/components/ui/TiltPlate";
import { useStore } from "@/components/providers/StoreProvider";
import { formatPrice, pad2 } from "@/lib/format";
import { spring, springSnappy, tileIn } from "@/lib/motion";
import { t } from "@/lib/i18n";
import type { Locale, Product } from "@/lib/types";

/* ------------------------------------------------------------------ *
 * Bento tile.
 *
 * Footprints are chosen so every row lands at the same height: a
 * half-width plate at 3:2 is exactly as tall as a third-width plate
 * at 1:1, which keeps the grid calm however it is filtered.
 * ------------------------------------------------------------------ */

const SPAN: Record<Product["tile"], string> = {
  full: "sm:col-span-2 lg:col-span-6",
  wide: "sm:col-span-2 lg:col-span-3",
  std: "sm:col-span-1 lg:col-span-2",
};

/* A half-width plate at 3:2 is the same height as a third-width plate
   at 1:1, so mixed rows sit perfectly level. */
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
 * exiting tile out of flow. A plain function component swallows that
 * ref, the exit never completes, and filtered-out tiles stay mounted.
 */
export const ProductCard = forwardRef<HTMLElement, ProductCardProps>(function ProductCard(
  { product, index, locale },
  ref,
) {
  const { openQuickView, add } = useStore();
  const scarce = product.stock <= 3;

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
      <TiltPlate max={6} lift={18} className="w-full">
        <button
          onClick={() => openQuickView(product)}
          aria-label={`${product.name} — ${t("quickView", locale)}`}
          className={`tap-clean plate relative block w-full overflow-hidden rounded-[22px] bg-ceramic sm:rounded-[26px] ${RATIO[product.tile]}`}
        >
          <motion.span
            className="absolute inset-0 block"
            whileHover={{ scale: 1.045 }}
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

          {/* legibility wash for the chips */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-obsidian/25 via-transparent to-obsidian/[0.06] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />

          {/* catalogue index */}
          <span className="tnum absolute left-4 top-4 text-[10px] font-medium tracking-[0.2em] text-white/85 mix-blend-difference">
            {pad2(index + 1)}
          </span>

          {scarce && (
            <span className="glass absolute right-4 top-4 rounded-full px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-champagne-deep">
              {t("lastPieces", locale)}
            </span>
          )}

          {/* quick-view affordance */}
          <span className="glass pointer-events-none absolute bottom-4 left-4 translate-y-2 rounded-full px-3.5 py-2 text-[11px] font-medium tracking-[-0.01em] text-obsidian opacity-0 transition-all duration-400 ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:translate-y-0 group-hover:opacity-100">
            {t("quickView", locale)}
          </span>
        </button>
      </TiltPlate>

      {/* ------------------------- caption ------------------------- */}
      <div className="flex items-start justify-between gap-4 px-1 pt-5">
        <div className="min-w-0">
          <h3 className="truncate text-[0.9375rem] font-medium tracking-[-0.015em] text-obsidian">
            {product.name}
          </h3>
          {/* The collection name, not the tagline. A tagline long enough to
              be worth reading is long enough to truncate mid-sentence, and a
              chopped sentence undersells a piece at this price. The full
              tagline opens with the quick view. */}
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
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.9 }}
            transition={springSnappy}
            className="tap-clean grid h-7 w-7 place-items-center rounded-full bg-obsidian/[0.055] text-obsidian transition-colors duration-300 hover:bg-obsidian hover:text-white"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
              <path d="M5 0v10M0 5h10" stroke="currentColor" strokeWidth="1.3" />
            </svg>
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
});

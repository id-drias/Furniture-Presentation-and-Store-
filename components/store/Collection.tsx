"use client";

import { useMemo } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ProductCard } from "@/components/store/ProductCard";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { useStore, type FilterId } from "@/components/providers/StoreProvider";
import { categories } from "@/lib/furnitureData";
import { spring, springSnappy } from "@/lib/motion";
import { t } from "@/lib/i18n";

/* ------------------------------------------------------------------ *
 * The Collection.
 *
 * A bento grid with a sticky filter rail. Filtering is a liquid
 * layout transition (`layout` + popLayout), not a re-render flash.
 * ------------------------------------------------------------------ */

export function Collection() {
  const { locale, catalogue, filter, setFilter } = useStore();

  const visible = useMemo(
    () => (filter === "all" ? catalogue : catalogue.filter((p) => p.category === filter)),
    [catalogue, filter],
  );

  return (
    <section id="collection" className="relative scroll-mt-28 bg-white pb-28 pt-24 sm:pb-36 sm:pt-32">
      <div className="mx-auto w-full max-w-[1480px] px-5 sm:px-8">
        {/* --------------------------- masthead --------------------------- */}
        <Stagger stagger={0.08} className="max-w-4xl">
          <StaggerItem>
            <p className="eyebrow">{t("collectionEyebrow", locale)}</p>
            <div className="rule-metal mt-4 w-16" />
          </StaggerItem>

          <StaggerItem display className="mt-7">
            <h2 className="display-section text-obsidian">
              {t("collectionTitle", locale)}{" "}
              <span className="accent-serif text-ink-faint">
                {t("collectionTitleAccent", locale)}
              </span>
            </h2>
          </StaggerItem>

          <StaggerItem className="mt-6">
            <p className="max-w-[52ch] text-pretty text-[0.9375rem] leading-relaxed text-ink-soft">
              {t("collectionSub", locale)}
            </p>
          </StaggerItem>
        </Stagger>

        {/* ---------------------------- filters ---------------------------- */}
        <Reveal className="sticky top-[86px] z-[60] -mx-5 mt-12 px-5 sm:-mx-8 sm:px-8 sm:mt-14">
          <div className="glass flex items-center justify-between gap-4 rounded-full py-1.5 pl-1.5 pr-4 sm:pr-5">
            <div
              className="scrollbar-none flex items-center gap-0.5 overflow-x-auto"
              role="tablist"
              aria-label={t("filterLabel", locale)}
            >
              {categories.map((cat) => {
                const active = filter === cat.id;
                return (
                  <button
                    key={cat.id}
                    role="tab"
                    aria-selected={active}
                    onClick={() => setFilter(cat.id as FilterId)}
                    className={`tap-clean relative shrink-0 rounded-full px-4 py-2.5 text-[13px] font-medium tracking-[-0.01em] transition-colors duration-300 sm:px-5 ${
                      active ? "text-white" : "text-ink-soft hover:text-obsidian"
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="filter-pill"
                        className="absolute inset-0 -z-10 rounded-full bg-obsidian"
                        transition={springSnappy}
                      />
                    )}
                    {cat.label[locale]}
                  </button>
                );
              })}
            </div>

            <motion.span
              key={visible.length}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={spring}
              className="tnum hidden shrink-0 text-[11px] font-medium uppercase tracking-[0.16em] text-ink-faint sm:block"
            >
              {visible.length}{" "}
              {visible.length === 1 ? t("resultsOne", locale) : t("resultsMany", locale)}
            </motion.span>
          </div>
        </Reveal>

        {/* ----------------------------- grid ----------------------------- */}
        {/* The grid container must stay a plain <div>. Giving it `layout`
            makes motion animate the container's own box with a scale
            transform, which both distorts the tiles (they inherit a
            counter-scale) and fights popLayout's measurement of exiting
            children — the exit never settles and filtered-out tiles stay
            mounted. Per-tile `layout` is what moves them into place. */}
        <div className="mt-10 grid grid-cols-1 gap-x-5 gap-y-12 [grid-auto-flow:dense] sm:mt-14 sm:grid-cols-2 sm:gap-y-14 lg:grid-cols-6">
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                index={i}
                locale={locale}
              />
            ))}
          </AnimatePresence>
        </div>

        {visible.length === 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-24 text-center text-sm text-ink-faint"
          >
            {t("empty", locale)}
          </motion.p>
        )}
      </div>
    </section>
  );
}

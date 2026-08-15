"use client";

import { useMemo } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ProductCard } from "@/components/store/ProductCard";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { useStore, type FilterId } from "@/components/providers/StoreProvider";
import { categories } from "@/lib/productsData";
import { spring, springSnappy } from "@/lib/motion";
import { t } from "@/lib/i18n";

/* ------------------------------------------------------------------ *
 * The Collection.
 *
 * A bento grid under a sticky filter rail. Filtering is a liquid layout
 * transition (`layout` + popLayout), not a re-render flash.
 *
 * The section's spatial rhythm carries the page: masthead, a long pause,
 * the rail, another pause, then the grid. Row gap is deliberately far
 * larger than column gap — vertical air is what makes a grid read as a
 * gallery hang rather than a product listing.
 * ------------------------------------------------------------------ */

export function Collection() {
  const { locale, catalogue, filter, setFilter } = useStore();

  const visible = useMemo(
    () => (filter === "all" ? catalogue : catalogue.filter((p) => p.category === filter)),
    [catalogue, filter],
  );

  return (
    <section
      id="collection"
      /* `overflow-clip`, never `overflow-hidden`: hidden makes this a
         scroll container and kills `position: sticky` on the rail. */
      className="relative scroll-mt-32 overflow-clip bg-white py-[var(--space-section)]"
    >
      <div className="mx-auto w-full max-w-[1480px] px-6 sm:px-10">
        {/* --------------------------- masthead --------------------------- */}
        <Stagger stagger={0.09} className="max-w-4xl">
          <StaggerItem>
            <p className="label">{t("collectionEyebrow", locale)}</p>
          </StaggerItem>

          <StaggerItem display className="mt-10">
            <h2 className="display-section text-obsidian">
              {t("collectionTitle", locale)}{" "}
              <span className="accent-serif text-ink-faint">
                {t("collectionTitleAccent", locale)}
              </span>
            </h2>
          </StaggerItem>

          <StaggerItem className="mt-9">
            <p className="max-w-[50ch] text-pretty text-[0.9375rem] leading-[1.7] text-ink-soft">
              {t("collectionSub", locale)}
            </p>
          </StaggerItem>
        </Stagger>

        {/* ---------------------------- filters ---------------------------- *
         * The moving indicator is a hairline underline rather than a filled
         * pill — the smallest thing that can still say "you are here".
         * ------------------------------------------------------------------ */}
        <Reveal className="sticky top-[92px] z-[60] -mx-6 mt-[var(--space-block)] px-6 sm:-mx-10 sm:px-10">
          <div className="glass flex items-center justify-between gap-6 rounded-full py-2 pl-3 pr-6">
            <div
              className="scrollbar-none flex items-center gap-1 overflow-x-auto"
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
                    className={`tap-clean relative shrink-0 rounded-full px-5 py-2.5 text-[0.8125rem] font-medium tracking-[-0.005em] transition-colors duration-500 ${
                      active ? "text-obsidian" : "text-ink-faint hover:text-ink-soft"
                    }`}
                  >
                    {cat.label[locale]}
                    {active && (
                      <motion.span
                        layoutId="filter-underline"
                        className="absolute inset-x-5 bottom-1 h-px bg-obsidian"
                        transition={springSnappy}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            <motion.span
              key={visible.length}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={spring}
              className="tnum label hidden shrink-0 text-[10px] sm:block"
            >
              {visible.length}{" "}
              {visible.length === 1 ? t("resultsOne", locale) : t("resultsMany", locale)}
            </motion.span>
          </div>
        </Reveal>

        {/* ----------------------------- grid ----------------------------- */}
        <div className="mt-[var(--space-block)] grid grid-cols-1 gap-x-6 gap-y-24 [grid-auto-flow:dense] sm:grid-cols-2 sm:gap-y-28 lg:grid-cols-6">
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
            className="py-32 text-center text-sm text-ink-faint"
          >
            {t("empty", locale)}
          </motion.p>
        )}
      </div>
    </section>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { MagneticButton } from "@/components/ui/Magnetic";
import {
  useEscape,
  useScrollLock,
  useStore,
} from "@/components/providers/StoreProvider";
import { formatCm, formatPrice } from "@/lib/format";
import { fade, modalIn, spring, springSnappy } from "@/lib/motion";
import { t } from "@/lib/i18n";

/* ------------------------------------------------------------------ *
 * Quick-view drawer.
 *
 * Left: the plate, with a thumbnail rail. Hovering a material in the
 * spec list swaps the plate to that material's macro — the fastest
 * way to answer "what is it actually made of".
 * ------------------------------------------------------------------ */

export function QuickView() {
  const { quickView, closeQuickView, add, openCart, locale } = useStore();
  const open = Boolean(quickView);

  useScrollLock(open);
  useEscape(open, closeQuickView);

  return (
    <AnimatePresence>
      {quickView && (
        <div className="fixed inset-0 z-[160] flex items-end justify-center sm:items-center">
          <motion.button
            aria-label={t("close", locale)}
            variants={fade}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={closeQuickView}
            className="absolute inset-0 cursor-default bg-obsidian/25 backdrop-blur-md"
          />
          <QuickViewPanel
            key={quickView.id}
            onClose={closeQuickView}
            onAdd={() => add(quickView.id)}
            onConsult={() => {
              add(quickView.id);
              closeQuickView();
              setTimeout(openCart, 180);
            }}
          />
        </div>
      )}
    </AnimatePresence>
  );
}

function QuickViewPanel({
  onClose,
  onAdd,
  onConsult,
}: {
  onClose: () => void;
  onAdd: () => void;
  onConsult: () => void;
}) {
  const { quickView: product, locale } = useStore();
  const [active, setActive] = useState(0);
  const [added, setAdded] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  /* Plate → gallery → one macro per material, in that order. */
  const plates = useMemo(() => {
    if (!product) return [];
    return [...new Set([product.image, ...product.gallery, ...product.materials.map((m) => m.macro)])];
  }, [product]);

  const materialOffset = product ? 1 + product.gallery.length : 0;

  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!added) return;
    const id = window.setTimeout(() => setAdded(false), 1500);
    return () => window.clearTimeout(id);
  }, [added]);

  if (!product) return null;

  const { dimensions: d } = product;

  return (
    <motion.div
      ref={panelRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label={product.name}
      variants={modalIn}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="relative z-10 flex max-h-[94svh] w-full max-w-[1180px] flex-col overflow-hidden rounded-t-[28px] bg-white shadow-[0_-8px_60px_-12px_rgba(15,23,42,0.3)] outline-none sm:mx-6 sm:max-h-[90svh] sm:flex-row sm:rounded-[32px] sm:shadow-[0_40px_100px_-30px_rgba(15,23,42,0.45)]"
    >
      {/* -------------------------- close -------------------------- */}
      <button
        onClick={onClose}
        aria-label={t("close", locale)}
        className="glass tap-clean absolute right-4 top-4 z-30 grid h-10 w-10 place-items-center rounded-full text-obsidian transition-transform duration-300 hover:scale-105"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
          <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.3" />
        </svg>
      </button>

      {/* --------------------------- plate --------------------------- */}
      <div className="relative shrink-0 bg-ceramic sm:w-[52%]">
        <div className="relative aspect-[4/3] w-full sm:aspect-auto sm:h-full sm:min-h-[540px]">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.div
              key={plates[active]}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ ...spring, stiffness: 130 }}
              className="absolute inset-0"
            >
              <Image
                src={plates[active]}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 100vw, 52vw"
                className="object-cover"
                priority
              />
            </motion.div>
          </AnimatePresence>

          {product.edition && (
            <span className="glass absolute left-4 top-4 rounded-full px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-champagne-deep">
              {product.edition}
            </span>
          )}
        </div>

        {/* thumbnail rail */}
        <div className="scrollbar-none absolute inset-x-0 bottom-0 flex gap-2 overflow-x-auto bg-gradient-to-t from-obsidian/25 to-transparent p-4">
          {plates.map((src, i) => (
            <button
              key={src}
              onClick={() => setActive(i)}
              aria-label={`View ${i + 1}`}
              className={`tap-clean relative h-12 w-12 shrink-0 overflow-hidden rounded-lg ring-1 transition-all duration-300 ${
                active === i
                  ? "ring-2 ring-white"
                  : "opacity-70 ring-white/40 hover:opacity-100"
              }`}
            >
              <Image src={src} alt="" fill sizes="48px" className="object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* -------------------------- details -------------------------- */}
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-4 pt-8 sm:px-9 sm:pt-12">
          <p className="eyebrow">{product.collection}</p>

          <h2 className="display mt-4 text-[clamp(2rem,4.4vw,3rem)] text-obsidian">
            {product.name}
          </h2>

          <p className="mt-3 max-w-[42ch] text-pretty text-[0.9375rem] leading-relaxed text-ink-soft">
            {product.tagline[locale]}
          </p>

          <p className="tnum mt-6 text-2xl font-medium tracking-[-0.025em] text-obsidian">
            {formatPrice(product.price, locale)}
          </p>

          <div className="rule-metal my-8" />

          <p className="max-w-[52ch] text-pretty text-[0.875rem] leading-[1.75] text-ink-soft">
            {product.story[locale]}
          </p>

          {/* dimensions */}
          <SpecBlock title={t("dimensions", locale)}>
            <div className="grid grid-cols-2 gap-x-8 sm:grid-cols-4">
              <Metric label={t("width", locale)} value={formatCm(d.w, locale)} />
              <Metric label={t("depth", locale)} value={formatCm(d.d, locale)} />
              <Metric label={t("height", locale)} value={formatCm(d.h, locale)} />
              {d.seat !== undefined && (
                <Metric label={t("seatHeight", locale)} value={formatCm(d.seat, locale)} />
              )}
            </div>
          </SpecBlock>

          {/* materials */}
          <SpecBlock title={t("materials", locale)}>
            <ul className="space-y-0">
              {product.materials.map((m, i) => (
                <li key={m.name.en}>
                  <button
                    onMouseEnter={() => setActive(materialOffset + i)}
                    onFocus={() => setActive(materialOffset + i)}
                    onClick={() => setActive(materialOffset + i)}
                    className="tap-clean hairline-t group flex w-full items-start gap-3.5 py-3.5 text-left first:border-t-0"
                  >
                    <span
                      className="mt-0.5 h-4 w-4 shrink-0 rounded-full ring-1 ring-inset ring-obsidian/10"
                      style={{ backgroundColor: m.swatch }}
                      aria-hidden
                    />
                    <span className="min-w-0">
                      <span className="block text-[0.8125rem] font-medium tracking-[-0.01em] text-obsidian transition-colors duration-300 group-hover:text-champagne-deep">
                        {m.name[locale]}
                      </span>
                      <span className="mt-0.5 block text-pretty text-[0.75rem] leading-relaxed text-ink-faint">
                        {m.detail[locale]}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </SpecBlock>

          {/* availability */}
          <div className="hairline-t mt-8 grid grid-cols-2 gap-6 pt-6">
            <Metric label={t("leadTime", locale)} value={product.leadTime[locale]} />
            <Metric
              label={t("availability", locale)}
              value={`${product.stock} ${t("inRun", locale)}`}
              accent={product.stock <= 3}
            />
          </div>
        </div>

        {/* --------------------------- actions --------------------------- */}
        <div className="hairline-t sticky bottom-0 flex flex-col items-stretch gap-2.5 bg-white/85 px-6 py-4 backdrop-blur-xl sm:flex-row sm:items-center sm:px-9 sm:py-5">
          <MagneticButton
            size="lg"
            className="flex-1"
            magnetic={false}
            onClick={() => {
              onAdd();
              setAdded(true);
            }}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={added ? "added" : "add"}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={springSnappy}
                className="flex items-center gap-2"
              >
                {added ? (
                  <>
                    <Check /> {t("added", locale)}
                  </>
                ) : (
                  t("addToCart", locale)
                )}
              </motion.span>
            </AnimatePresence>
          </MagneticButton>

          {/* Available on every breakpoint. On a piece at this price the
              enquiry is often the *more* likely action, so hiding it on
              mobile removed the primary path for half the audience. */}
          <MagneticButton
            size="lg"
            variant="outline"
            magnetic={false}
            className="flex-1"
            onClick={onConsult}
          >
            {t("requestConsultation", locale)}
          </MagneticButton>
        </div>
      </div>
    </motion.div>
  );
}

/* -------------------------------- bits -------------------------------- */

function SpecBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-9">
      <p className="eyebrow mb-4 text-[10px]">{title}</p>
      {children}
    </div>
  );
}

function Metric({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-ink-faint">
        {label}
      </p>
      <p
        className={`tnum mt-1.5 text-[0.9375rem] font-medium tracking-[-0.015em] ${
          accent ? "text-champagne-deep" : "text-obsidian"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function Check() {
  return (
    <svg width="12" height="10" viewBox="0 0 12 10" fill="none" aria-hidden>
      <path
        d="M1 5l3.5 3.5L11 1.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

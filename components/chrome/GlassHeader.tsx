"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
} from "motion/react";
import {
  useScrollLock,
  useStore,
  type FilterId,
} from "@/components/providers/StoreProvider";
import { spring, springSnappy, staggerParent, riseInDisplay } from "@/lib/motion";
import { t } from "@/lib/i18n";
import type { DictKey } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

/* ------------------------------------------------------------------ *
 * Floating glass header.
 *
 * Two skins. Over the cinematic hero it is dark glass with white type;
 * once the alabaster body arrives it crossfades to light glass. A single
 * fixed skin would have to lose one of the two — and a light pill on
 * near-black footage is the exact thing that makes a site look templated.
 * ------------------------------------------------------------------ */

interface NavLink {
  key: DictKey;
  filter: FilterId | null;
  target: string;
}

const NAV: NavLink[] = [
  { key: "navLiving", filter: "seating", target: "collection" },
  { key: "navDining", filter: "tables", target: "collection" },
  { key: "navLighting", filter: "lighting", target: "collection" },
  { key: "navAtelier", filter: null, target: "atelier" },
];

export function GlassHeader() {
  const { locale, setLocale, itemCount, openCart, setFilter, addPulse } = useStore();
  const [condensed, setCondensed] = useState(false);
  const [onDark, setOnDark] = useState(true);
  const [hovered, setHovered] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 30,
    restDelta: 0.001,
  });

  const evaluate = useCallback((v: number) => {
    setCondensed(v > 24);
    /* Hand over to the light skin just before the hero's last frame
       leaves, so the swap happens against dark and reads as intentional. */
    setOnDark(v < window.innerHeight * 0.82);
  }, []);

  useMotionValueEvent(scrollY, "change", evaluate);

  /*
   * A native listener backs up motion's rAF-driven scroll value, because
   * this particular state is a legibility guarantee rather than a flourish:
   * if the skin fails to swap, white type sits on the white body and the
   * header becomes unreadable. Scroll events fire independently of the
   * animation frame loop, so the fallback holds even when rAF is throttled
   * (backgrounded tab, low-power mode, headless browser).
   *
   * Also resolves the skin on mount — deep links and refreshes can land
   * mid-page, where waiting for a first scroll would be too late.
   */
  useEffect(() => {
    const onScroll = () => evaluate(window.scrollY);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [evaluate]);

  useScrollLock(menuOpen);

  const go = useCallback(
    (link: NavLink) => {
      if (link.filter) setFilter(link.filter);
      setMenuOpen(false);
      requestAnimationFrame(() => {
        document
          .getElementById(link.target)
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    },
    [setFilter],
  );

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-[120]">
        <div className="mx-auto w-full max-w-[1480px] px-3 sm:px-5">
          <motion.div
            className={`pointer-events-auto relative mt-4 flex items-center justify-between rounded-full transition-[background,border-color,box-shadow] duration-700 sm:mt-5 ${
              onDark ? "glass-dark" : "glass"
            }`}
            animate={{
              height: condensed ? 56 : 66,
              paddingLeft: condensed ? 18 : 24,
              paddingRight: condensed ? 10 : 14,
            }}
            transition={spring}
          >
            {/* ---------------- wordmark ---------------- */}
            <a
              href="#top"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="tap-clean flex shrink-0 items-center gap-2.5"
              aria-label="Aetheria Atelier — home"
            >
              <motion.span
                className={`grid place-items-center rounded-full transition-colors duration-700 ${
                  onDark ? "bg-white text-onyx" : "bg-obsidian text-white"
                }`}
                animate={{ width: condensed ? 26 : 30, height: condensed ? 26 : 30 }}
                transition={spring}
              >
                <span className="accent-serif translate-y-[0.5px] text-[13px] not-italic">
                  Æ
                </span>
              </motion.span>
              <span
                className={`hidden text-[11px] font-medium uppercase tracking-[0.3em] transition-colors duration-700 sm:block ${
                  onDark ? "text-white" : "text-obsidian"
                }`}
              >
                Aetheria
              </span>
            </a>

            {/* ---------------- centre nav ---------------- */}
            <nav
              className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 lg:flex"
              onMouseLeave={() => setHovered(null)}
            >
              {NAV.map((link) => (
                <button
                  key={link.key}
                  onClick={() => go(link)}
                  onMouseEnter={() => setHovered(link.key)}
                  className={`tap-clean relative rounded-full px-4 py-2 text-[13px] font-medium tracking-[-0.01em] transition-colors duration-500 ${
                    onDark
                      ? "text-white/70 hover:text-white"
                      : "text-ink-soft hover:text-obsidian"
                  }`}
                >
                  {hovered === link.key && (
                    <motion.span
                      layoutId="nav-hover"
                      className={`absolute inset-0 -z-10 rounded-full ${
                        onDark ? "bg-white/12" : "bg-obsidian/[0.055]"
                      }`}
                      transition={springSnappy}
                    />
                  )}
                  {t(link.key, locale)}
                </button>
              ))}
            </nav>

            {/* ---------------- right cluster ---------------- */}
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              <LocaleToggle locale={locale} onSelect={setLocale} onDark={onDark} />

              <CartButton
                count={itemCount}
                pulse={addPulse}
                label={t("openCart", locale)}
                onClick={openCart}
                condensed={condensed}
                onDark={onDark}
              />

              <button
                onClick={() => setMenuOpen(true)}
                aria-label={t("openMenu", locale)}
                className={`tap-clean grid h-9 w-9 place-items-center rounded-full transition-colors duration-500 lg:hidden ${
                  onDark
                    ? "text-white hover:bg-white/12"
                    : "text-obsidian hover:bg-obsidian/[0.055]"
                }`}
              >
                <svg width="16" height="10" viewBox="0 0 16 10" fill="none" aria-hidden>
                  <path d="M0 1h16M0 9h11" stroke="currentColor" strokeWidth="1.35" />
                </svg>
              </button>
            </div>

            {/* ---------------- read progress ---------------- */}
            <motion.div
              aria-hidden
              className="absolute bottom-0 left-6 right-6 h-px origin-left rounded-full"
              style={{
                scaleX: progress,
                background:
                  "linear-gradient(90deg, transparent, var(--color-champagne))",
              }}
            />
          </motion.div>
        </div>
      </header>

      <MobileMenu
        open={menuOpen}
        locale={locale}
        onClose={() => setMenuOpen(false)}
        onNavigate={go}
      />
    </>
  );
}

/* ------------------------------ locale ------------------------------ */

function LocaleToggle({
  locale,
  onSelect,
  onDark,
}: {
  locale: Locale;
  onSelect: (l: Locale) => void;
  onDark: boolean;
}) {
  return (
    <div
      className={`relative flex items-center rounded-full p-0.5 transition-colors duration-700 ${
        onDark ? "bg-white/10" : "bg-obsidian/[0.045]"
      }`}
      role="group"
      aria-label="Language"
    >
      {(["en", "fr"] as const).map((code) => (
        <button
          key={code}
          onClick={() => onSelect(code)}
          aria-pressed={locale === code}
          className={`tap-clean relative z-10 rounded-full px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] transition-colors duration-500 ${
            locale === code
              ? onDark
                ? "text-onyx"
                : "text-obsidian"
              : onDark
                ? "text-white/55 hover:text-white/85"
                : "text-ink-faint hover:text-ink-soft"
          }`}
        >
          {locale === code && (
            <motion.span
              layoutId="locale-pill"
              className={`absolute inset-0 -z-10 rounded-full ${
                onDark ? "bg-white" : "bg-white shadow-[0_1px_2px_rgba(15,23,42,0.08)]"
              }`}
              transition={springSnappy}
            />
          )}
          {code}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------- cart ------------------------------- */

function CartButton({
  count,
  pulse,
  label,
  onClick,
  condensed,
  onDark,
}: {
  count: number;
  pulse: number;
  label: string;
  onClick: () => void;
  condensed: boolean;
  onDark: boolean;
}) {
  return (
    <motion.button
      onClick={onClick}
      aria-label={label}
      className={`tap-clean relative grid place-items-center rounded-full transition-colors duration-700 ${
        onDark
          ? "bg-white/14 text-white ring-1 ring-white/25 backdrop-blur-xl hover:bg-white/22"
          : "bg-obsidian text-white"
      }`}
      animate={{ width: condensed ? 36 : 40, height: condensed ? 36 : 40 }}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      transition={spring}
    >
      <svg width="15" height="16" viewBox="0 0 15 16" fill="none" aria-hidden>
        <path
          d="M1 4.5h13l-1 10.5H2L1 4.5Z"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        <path
          d="M5 6V3.6a2.5 2.5 0 0 1 5 0V6"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>

      <AnimatePresence>
        {count > 0 && (
          <motion.span
            key="badge"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={springSnappy}
            className="tnum absolute -right-0.5 -top-0.5 grid h-[17px] min-w-[17px] place-items-center rounded-full bg-obsidian px-1 text-[10px] font-medium leading-none text-white ring-2 ring-white"
          >
            <motion.span
              key={pulse}
              initial={{ scale: 1.5 }}
              animate={{ scale: 1 }}
              transition={springSnappy}
            >
              {count}
            </motion.span>
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

/* ---------------------------- mobile sheet ---------------------------- */

function MobileMenu({
  open,
  locale,
  onClose,
  onNavigate,
}: {
  open: boolean;
  locale: Locale;
  onClose: () => void;
  onNavigate: (link: NavLink) => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[150] lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.24 }}
        >
          <motion.div
            className="glass-deep absolute inset-0"
            initial={{ clipPath: "circle(0% at 92% 5%)" }}
            animate={{ clipPath: "circle(150% at 92% 5%)" }}
            exit={{ clipPath: "circle(0% at 92% 5%)" }}
            transition={{ ...spring, stiffness: 90 }}
          />

          <div
            aria-hidden
            className="hidden absolute -right-16 top-10 h-72 w-72 opacity-40"
          />

          <button
            onClick={onClose}
            aria-label={t("closeMenu", locale)}
            className="tap-clean hairline absolute right-6 top-6 z-10 grid h-11 w-11 place-items-center rounded-full bg-white/70"
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
              <path d="M1 1l11 11M12 1L1 12" stroke="currentColor" strokeWidth="1.35" />
            </svg>
          </button>

          <motion.nav
            className="relative flex h-full flex-col justify-center gap-1 px-8"
            variants={staggerParent(0.06, 0.12)}
            initial="hidden"
            animate="visible"
          >
            {NAV.map((link) => (
              <motion.button
                key={link.key}
                variants={riseInDisplay}
                onClick={() => onNavigate(link)}
                className="tap-clean py-2 text-left"
              >
                <span className="display text-[clamp(2.4rem,13vw,4rem)]">
                  {t(link.key, locale)}
                </span>
              </motion.button>
            ))}
            <motion.div variants={riseInDisplay} className="rule mt-10 w-full" />
            <motion.p variants={riseInDisplay} className="label mt-6">
              {t("heroEyebrow", locale)}
            </motion.p>
          </motion.nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

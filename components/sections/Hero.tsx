"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { useStore } from "@/components/providers/StoreProvider";
import { HeroVideoBackground } from "@/components/sections/HeroVideoBackground";
import { MagneticButton } from "@/components/ui/Magnetic";
import { Stagger, StaggerItem } from "@/components/ui/Reveal";
import { editorial, products } from "@/lib/furnitureData";
import { formatPrice } from "@/lib/format";
import { unsplashSized } from "@/lib/imageLoader";
import { spring, springScroll } from "@/lib/motion";
import { t } from "@/lib/i18n";
import type { DictKey } from "@/lib/i18n";

/* ------------------------------------------------------------------ *
 * Hero.
 *
 * A full-bleed cinematic interior under a dark grade, with the type
 * floating over it. The drama here is *contrast* — a near-black opening
 * frame against the alabaster editorial body that follows. Gold is used
 * on exactly two words and one rule, and nowhere else.
 * ------------------------------------------------------------------ */

const BADGES: DictKey[] = ["badgeFounded", "badgeMakers", "badgeRun", "badgeWarranty"];

export function Hero() {
  const { locale, setFilter, openQuickView } = useStore();
  const sectionRef = useRef<HTMLElement>(null);
  const hero = products[0];

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  /* The whole opening frame recedes and dims as the collection arrives. */
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const contentScale = useTransform(scrollYProgress, [0, 1], [1, 0.93]);
  const contentBlur = useTransform(scrollYProgress, [0, 0.7], [0, 8]);
  const blurFilter = useTransform(contentBlur, (v) => `blur(${v}px)`);

  const goToCollection = () => {
    setFilter("all");
    document.getElementById("collection")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="top"
      ref={sectionRef}
      className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-onyx"
    >
      <HeroVideoBackground
        slot="heroInterior"
        fallbackImage={editorial.hero}
        scrim={0.56}
      />

      {/* ------------------------- content ------------------------- */}
      <motion.div
        style={{
          y: contentY,
          opacity: contentOpacity,
          scale: contentScale,
          filter: blurFilter,
        }}
        className="relative z-30 mx-auto flex w-full max-w-[1480px] flex-1 flex-col justify-center px-5 pb-28 pt-[clamp(8rem,17vh,11rem)] sm:px-8"
      >
        <Stagger stagger={0.09} className="w-full">
          <StaggerItem>
            <div className="flex items-center gap-4">
              <span className="rule-metal w-14 shrink-0" />
              <p className="eyebrow !text-white/55">{t("heroEyebrow", locale)}</p>
            </div>
          </StaggerItem>

          <StaggerItem display className="mt-8 sm:mt-10">
            <h1 className="display-hero max-w-[14ch] text-white">
              {t("heroLine1", locale)}
              <br />
              {t("heroLine2", locale)}{" "}
              <span className="accent-serif text-metal glow-gold">
                {t("heroLine2Accent", locale)}
              </span>
            </h1>
          </StaggerItem>

          <StaggerItem className="mt-8">
            <p className="max-w-[48ch] text-pretty text-[0.9375rem] leading-relaxed text-white/70 sm:text-base">
              {t("heroSub", locale)}
            </p>
          </StaggerItem>

          {/* ---- glass spec badges ---- */}
          <StaggerItem className="mt-9">
            <ul className="flex flex-wrap items-center gap-2.5">
              {BADGES.map((key) => (
                <li key={key} className="group">
                  <span className="glass-dark edge-metal flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-medium tracking-[0.06em] text-white/80 transition-colors duration-500 group-hover:text-white">
                    <span className="h-1 w-1 rounded-full bg-gold" aria-hidden />
                    {t(key, locale)}
                  </span>
                </li>
              ))}
            </ul>
          </StaggerItem>

          {/* ---- CTAs ---- */}
          <StaggerItem className="mt-11">
            <div className="flex flex-wrap items-center gap-3">
              <MagneticButton size="lg" variant="metal" onClick={goToCollection}>
                {t("heroCta", locale)}
                <Arrow />
              </MagneticButton>
              <MagneticButton size="lg" variant="glass" href="#story">
                <PlayGlyph />
                {t("heroCtaTour", locale)}
              </MagneticButton>
            </div>
          </StaggerItem>
        </Stagger>

        {/* ---- featured piece, bottom-right ---- */}
        <motion.button
          initial={{ opacity: 0, x: 40, filter: "blur(10px)" }}
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          transition={{ ...spring, delay: 0.75 }}
          onClick={() => openQuickView(hero)}
          className="glass-dark edge-metal group tap-clean absolute bottom-8 right-5 hidden max-w-[280px] items-center gap-4 rounded-2xl px-4 py-3.5 text-left sm:right-8 lg:flex"
        >
          <span
            className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-cover bg-center"
            /* 96px source for a 48px chip — not the 2000px original. */
            style={{ backgroundImage: `url(${unsplashSized(hero.image, 96)})` }}
            aria-hidden
          />
          <span className="min-w-0">
            <span className="block text-[10px] uppercase tracking-[0.2em] text-gold">
              {hero.collection}
            </span>
            <span className="mt-0.5 block truncate text-sm font-medium text-white">
              {hero.name}
            </span>
            <span className="tnum mt-0.5 block text-[12px] text-white/60">
              {formatPrice(hero.price, locale)}
            </span>
          </span>
        </motion.button>
      </motion.div>

      <ScrollHint label={t("scrollHint", locale)} />
    </section>
  );
}

/* ------------------------------- bits ------------------------------- */

function Arrow() {
  return (
    <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden>
      <path
        d="M1 5h11M8.5 1.5 12 5l-3.5 3.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlayGlyph() {
  return (
    <svg width="9" height="10" viewBox="0 0 9 10" fill="none" aria-hidden>
      <path d="M0.5 1v8L8 5 0.5 1Z" fill="currentColor" />
    </svg>
  );
}

function ScrollHint({ label }: { label: string }) {
  const { scrollY } = useScroll();
  const opacity = useSpring(useTransform(scrollY, [0, 180], [1, 0]), springScroll);

  return (
    <motion.div
      style={{ opacity }}
      className="pointer-events-none absolute inset-x-0 bottom-7 z-30 mx-auto flex w-full flex-col items-center gap-2"
    >
      <span className="eyebrow text-[10px] !text-white/45">{label}</span>
      <span className="relative block h-10 w-px overflow-hidden bg-white/15">
        <motion.span
          className="absolute inset-x-0 top-0 block h-4 bg-gold"
          animate={{ y: [-16, 40] }}
          transition={{ duration: 2.1, repeat: Infinity, ease: "easeInOut" }}
        />
      </span>
    </motion.div>
  );
}

"use client";

import { useRef } from "react";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { useStore } from "@/components/providers/StoreProvider";
import { AmbientVideo } from "@/components/ui/AmbientVideo";
import { MagneticButton } from "@/components/ui/Magnetic";
import { Stagger, StaggerItem } from "@/components/ui/Reveal";
import { editorial, products } from "@/lib/furnitureData";
import { formatPrice } from "@/lib/format";
import { spring, springScroll } from "@/lib/motion";
import { t } from "@/lib/i18n";
import { useFinePointer } from "@/lib/hooks";

/* ------------------------------------------------------------------ *
 * Hero.
 *
 * A white plaster room with caustic light moving across it, and one
 * plate floating in the middle that you can push around. No busy
 * photographic background — the product is the only image on screen.
 * ------------------------------------------------------------------ */

export function Hero() {
  const { locale, setFilter } = useStore();
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  /* The whole hero recedes as the collection arrives. */
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);
  const contentScale = useTransform(scrollYProgress, [0, 1], [1, 0.94]);

  const goToCollection = () => {
    setFilter("all");
    document.getElementById("collection")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="top"
      ref={sectionRef}
      className="grain relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-gradient-to-b from-white via-white to-ceramic"
    >
      {/* ---- ambient light on the wall ---- */}
      <AmbientVideo slot="heroCaustics" opacity={0.9} blend="screen" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[60vh] bg-[radial-gradient(60%_50%_at_50%_0%,rgba(239,230,212,0.5),transparent_70%)]"
      />

      <motion.div
        style={{ y: contentY, opacity: contentOpacity, scale: contentScale }}
        className="relative z-10 mx-auto flex w-full max-w-[1480px] flex-1 flex-col items-center px-5 pb-16 pt-[clamp(7.5rem,16vh,10.5rem)] sm:px-8"
      >
        <Stagger stagger={0.08} className="flex w-full flex-col items-center text-center">
          <StaggerItem>
            <p className="eyebrow">{t("heroEyebrow", locale)}</p>
            <div className="rule-metal mx-auto mt-4 w-24" />
          </StaggerItem>

          <StaggerItem display className="mt-7 sm:mt-9">
            <h1 className="display-hero max-w-[16ch] text-obsidian">
              {t("heroLine1", locale)}
              <br />
              {t("heroLine2", locale)}{" "}
              <span className="accent-serif text-metal">{t("heroLine2Accent", locale)}</span>
            </h1>
          </StaggerItem>

          <StaggerItem className="mt-7 sm:mt-8">
            <p className="mx-auto max-w-[46ch] text-pretty text-[0.9375rem] leading-relaxed text-ink-soft sm:text-base">
              {t("heroSub", locale)}
            </p>
          </StaggerItem>

          <StaggerItem className="mt-9">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <MagneticButton size="lg" onClick={goToCollection}>
                {t("heroCta", locale)}
                <Arrow />
              </MagneticButton>
              <MagneticButton size="lg" variant="outline" href="#atelier">
                {t("heroCtaAlt", locale)}
              </MagneticButton>
            </div>
          </StaggerItem>
        </Stagger>

        <HeroStage />
      </motion.div>

      <ScrollHint label={t("scrollHint", locale)} />
    </section>
  );
}

/* ------------------------------------------------------------------ *
 * The plate. Tilts under the pointer, orbits when you drag it, and
 * casts a matching contact shadow and reflection.
 * ------------------------------------------------------------------ */

function HeroStage() {
  const { locale, openQuickView } = useStore();
  const hero = products[0];
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  const plateRef = useRef<HTMLDivElement>(null);

  const interactive = fine && !reduced;

  /* drag → orbit */
  const dragX = useMotionValue(0);
  const rotateY = useSpring(useTransform(dragX, [-300, 300], [16, -16]), spring);

  /* pointer height → pitch */
  const pitch = useMotionValue(0);
  const rotateX = useSpring(useTransform(pitch, [-1, 1], [7, -7]), spring);

  /* shadow tracks the orbit so the object feels grounded */
  const shadowX = useTransform(dragX, [-300, 300], [40, -40]);
  const shadowScale = useSpring(useTransform(dragX, [-300, 0, 300], [0.86, 1, 0.86]), spring);

  const onPointerMove = (e: React.PointerEvent) => {
    if (!interactive || !plateRef.current) return;
    const r = plateRef.current.getBoundingClientRect();
    pitch.set(((e.clientY - r.top) / r.height) * 2 - 1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 72, scale: 0.95, filter: "blur(14px)" }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      transition={{ ...spring, stiffness: 70, damping: 20, delay: 0.45 }}
      className="stage-3d relative mt-14 w-full max-w-5xl sm:mt-20"
    >
      {/* contact shadow */}
      <motion.div
        aria-hidden
        style={{ x: shadowX, scaleX: shadowScale }}
        className="absolute inset-x-[12%] -bottom-6 h-16 rounded-[50%] bg-obsidian/20 blur-3xl"
      />

      <motion.div
        ref={plateRef}
        drag={interactive ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.16}
        dragTransition={{ bounceStiffness: 120, bounceDamping: 18 }}
        onPointerMove={onPointerMove}
        onPointerLeave={() => pitch.set(0)}
        style={{ x: dragX, rotateY, rotateX, transformStyle: "preserve-3d" }}
        whileTap={interactive ? { cursor: "grabbing" } : undefined}
        className={`plate-lift relative aspect-[16/10] w-full overflow-hidden rounded-[26px] bg-ceramic sm:rounded-[34px] ${
          interactive ? "cursor-grab" : ""
        }`}
      >
        <Image
          src={editorial.hero}
          alt=""
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 1024px"
          className="object-cover"
        />

        {/* glass caption chip */}
        <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-3 sm:inset-x-5 sm:bottom-5">
          <button
            onClick={() => openQuickView(hero)}
            className="glass tap-clean group flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-left transition-transform duration-300 hover:scale-[1.02] sm:gap-4 sm:px-4 sm:py-3"
          >
            <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg sm:h-11 sm:w-11">
              <Image src={hero.gallery[0]} alt="" fill sizes="44px" className="object-cover" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[13px] font-medium tracking-[-0.01em] text-obsidian sm:text-sm">
                {hero.name}
              </span>
              <span className="block truncate text-[11px] text-ink-faint">
                {hero.collection}
              </span>
            </span>
            <span className="tnum ml-1 hidden text-[13px] font-medium text-obsidian sm:block">
              {formatPrice(hero.price, locale)}
            </span>
          </button>

          <span className="glass hidden shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-[10px] font-medium uppercase tracking-[0.18em] text-ink-soft md:flex">
            <DragIcon />
            {t("dragHint", locale)}
          </span>
        </div>
      </motion.div>

      {/* reflection */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-full h-24 scale-y-[-1] overflow-hidden opacity-[0.16] [mask-image:linear-gradient(to_top,transparent,black)]"
      >
        <div className="relative h-full w-full">
          <Image
            src={editorial.hero}
            alt=""
            fill
            sizes="1024px"
            className="object-cover object-bottom"
          />
        </div>
      </div>
    </motion.div>
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

function DragIcon() {
  return (
    <svg width="16" height="8" viewBox="0 0 16 8" fill="none" aria-hidden>
      <path
        d="M3.5 1 1 4l2.5 3M12.5 1 15 4l-2.5 3M5.5 4h5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ScrollHint({ label }: { label: string }) {
  const { scrollY } = useScroll();
  const opacity = useSpring(useTransform(scrollY, [0, 160], [1, 0]), springScroll);

  return (
    <motion.div
      style={{ opacity }}
      className="pointer-events-none relative z-10 mx-auto flex flex-col items-center gap-2 pb-8"
    >
      <span className="eyebrow text-[10px]">{label}</span>
      <span className="relative block h-10 w-px overflow-hidden bg-obsidian/10">
        <motion.span
          className="absolute inset-x-0 top-0 block h-4 bg-champagne-deep"
          animate={{ y: [-16, 40] }}
          transition={{ duration: 2.1, repeat: Infinity, ease: "easeInOut" }}
        />
      </span>
    </motion.div>
  );
}

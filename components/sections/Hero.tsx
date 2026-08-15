"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { useStore } from "@/components/providers/StoreProvider";
import { HeroVideoBackground } from "@/components/sections/HeroVideoBackground";
import { MagneticButton } from "@/components/ui/Magnetic";
import { Stagger, StaggerItem } from "@/components/ui/Reveal";
import { editorial } from "@/lib/productsData";
import { spring, springScroll } from "@/lib/motion";
import { t } from "@/lib/i18n";
import type { DictKey } from "@/lib/i18n";

/* ------------------------------------------------------------------ *
 * Hero.
 *
 * One image, one sentence, two actions. Everything that was competing
 * with the headline in the previous pass — a gold gradient on the accent
 * word, four floating glass badges, a product card pinned to the corner,
 * a light spill at each edge — is gone. What carries the frame now is the
 * scale of the type against the amount of nothing around it.
 *
 * The house facts survive as a hairline-separated colophon at the foot of
 * the frame, set in the technical register. They are credentials, not
 * ornaments, and should read like the imprint on the back of a catalogue.
 * ------------------------------------------------------------------ */

const FACTS: DictKey[] = ["badgeFounded", "badgeMakers", "badgeRun", "badgeWarranty"];

export function Hero() {
  const { locale, setFilter } = useStore();
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  /* The frame recedes as the collection arrives — slower and shallower
     than before. A hero that leaves eagerly feels restless. */
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -90]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const contentScale = useTransform(scrollYProgress, [0, 1], [1, 0.96]);

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
        scrim={0.5}
      />

      {/* ------------------------- content ------------------------- */}
      <motion.div
        style={{ y: contentY, opacity: contentOpacity, scale: contentScale }}
        className="relative z-30 mx-auto flex w-full max-w-[1480px] flex-1 flex-col justify-center px-6 pb-36 pt-[clamp(9rem,20vh,13rem)] sm:px-10"
      >
        <Stagger stagger={0.1} className="w-full">
          <StaggerItem>
            <p className="label !text-white/50">{t("heroEyebrow", locale)}</p>
          </StaggerItem>

          <StaggerItem display className="mt-10 sm:mt-14">
            <h1 className="display-hero max-w-[13ch] text-white">
              {t("heroLine1", locale)}
              <br />
              {t("heroLine2", locale)}{" "}
              <span className="accent-serif text-white/55">
                {t("heroLine2Accent", locale)}
              </span>
            </h1>
          </StaggerItem>

          <StaggerItem className="mt-10 sm:mt-12">
            <p className="max-w-[44ch] text-pretty text-[0.9375rem] leading-[1.7] text-white/60">
              {t("heroSub", locale)}
            </p>
          </StaggerItem>

          <StaggerItem className="mt-12 sm:mt-14">
            <div className="flex flex-wrap items-center gap-3">
              <MagneticButton size="lg" variant="glass" onClick={goToCollection}>
                {t("heroCta", locale)}
              </MagneticButton>
              <MagneticButton
                size="lg"
                variant="ghost"
                href="#story"
                className="text-white/65 hover:bg-white/[0.06] hover:text-white"
              >
                {t("heroCtaTour", locale)}
              </MagneticButton>
            </div>
          </StaggerItem>
        </Stagger>
      </motion.div>

      {/* ---------------------- colophon ---------------------- */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ ...spring, delay: 0.9 }}
        className="relative z-30 mx-auto w-full max-w-[1480px] px-6 pb-10 sm:px-10 sm:pb-12"
      >
        <div className="h-px w-full bg-white/[0.12]" />
        <dl className="grid grid-cols-2 gap-y-5 pt-7 sm:grid-cols-4">
          {FACTS.map((key) => (
            <dd key={key} className="label !text-white/45">
              {t(key, locale)}
            </dd>
          ))}
        </dl>
      </motion.div>

      <ScrollHint label={t("scrollHint", locale)} />
    </section>
  );
}

/* ------------------------------- bits ------------------------------- */

function ScrollHint({ label }: { label: string }) {
  const { scrollY } = useScroll();
  const opacity = useSpring(useTransform(scrollY, [0, 200], [1, 0]), springScroll);

  return (
    <motion.div
      style={{ opacity }}
      className="pointer-events-none absolute bottom-40 right-6 z-30 hidden flex-col items-center gap-4 sm:right-10 lg:flex"
    >
      <span className="label text-[10px] !text-white/40 [writing-mode:vertical-rl]">
        {label}
      </span>
      <span className="relative block h-12 w-px overflow-hidden bg-white/[0.12]">
        <motion.span
          className="absolute inset-x-0 top-0 block h-5 bg-white/70"
          animate={{ y: [-20, 48] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        />
      </span>
    </motion.div>
  );
}

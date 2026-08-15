"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { useStore } from "@/components/providers/StoreProvider";
import { editorial } from "@/lib/furnitureData";
import { springScroll } from "@/lib/motion";
import type { Locale, Localized } from "@/lib/types";

/* ------------------------------------------------------------------ *
 * Scroll-pinned chapters.
 *
 * Each chapter owns 240vh of scroll. The viewport pins for the middle
 * of it while the plate scales into focus and the specs march in from
 * the side — the Apple product-page grammar, applied to a workshop.
 * ------------------------------------------------------------------ */

interface Spec {
  k: Localized;
  v: Localized;
}

interface Chapter {
  key: string;
  image: string;
  eyebrow: Localized;
  title: Localized;
  body: Localized;
  specs: readonly Spec[];
}

export function PinnedChapters() {
  const { locale } = useStore();

  return (
    <section id="story" className="relative bg-white">
      {editorial.pinned.map((chapter, i) => (
        <PinnedChapter
          key={chapter.key}
          chapter={chapter as Chapter}
          index={i}
          locale={locale}
          flip={i % 2 === 1}
        />
      ))}
    </section>
  );
}

function PinnedChapter({
  chapter,
  index,
  locale,
  flip,
}: {
  chapter: Chapter;
  index: number;
  locale: Locale;
  flip: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  /* Smooth the raw scroll so a trackpad flick doesn't judder the plate. */
  const p = useSpring(scrollYProgress, springScroll);

  /* plate: rises in, holds, settles back */
  const plateScale = useTransform(p, [0, 0.42, 1], [0.88, 1, 0.95]);
  const plateY = useTransform(p, [0, 1], [64, -48]);
  const plateRadius = useTransform(p, [0, 0.42], [56, 28]);

  /* inner photo: slow counter-push, so the crop breathes */
  const photoScale = useTransform(p, [0, 1], [1.22, 1.02]);

  /* copy */
  const copyOpacity = useTransform(p, [0.06, 0.24, 0.86, 1], [0, 1, 1, 0]);
  const copyY = useTransform(p, [0.06, 0.28], [44, 0]);
  const specsX = useTransform(p, [0.2, 0.46], [flip ? -36 : 36, 0]);
  const specsOpacity = useTransform(p, [0.2, 0.44], [0, 1]);

  /* the big chapter numeral drifting behind everything */
  const numeralY = useTransform(p, [0, 1], [80, -80]);

  return (
    <div ref={ref} className="relative h-[240vh]">
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
        {/* watermark numeral */}
        <motion.span
          aria-hidden
          style={{ y: numeralY }}
          className="pointer-events-none absolute -right-4 top-1/2 select-none text-[26vw] font-semibold leading-none tracking-tighter text-obsidian/[0.028] lg:right-8"
        >
          {String(index + 1).padStart(2, "0")}
        </motion.span>

        <div className="mx-auto grid w-full max-w-[1480px] items-center gap-10 px-5 sm:px-8 lg:grid-cols-12 lg:gap-16">
          {/* ------------------------- plate ------------------------- */}
          <motion.div
            style={{ scale: plateScale, y: plateY, borderRadius: plateRadius }}
            className={`plate-lift relative aspect-[4/3] w-full overflow-hidden bg-ceramic lg:col-span-7 lg:aspect-[5/4] ${
              flip ? "lg:order-2 lg:col-start-6" : ""
            }`}
          >
            <motion.div style={{ scale: photoScale }} className="absolute inset-0">
              <Image
                src={chapter.image}
                alt=""
                fill
                sizes="(max-width: 1024px) 100vw, 62vw"
                className="object-cover"
              />
            </motion.div>
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-obsidian/10 via-transparent to-transparent"
            />
          </motion.div>

          {/* -------------------------- copy -------------------------- */}
          <motion.div
            style={{ opacity: copyOpacity, y: copyY }}
            className={`lg:col-span-5 ${flip ? "lg:order-1 lg:col-start-1" : ""}`}
          >
            <p className="eyebrow">{chapter.eyebrow[locale]}</p>
            <div className="rule-metal mt-4 w-16" />

            <h2 className="display-section mt-6 text-obsidian">
              {chapter.title[locale]}
            </h2>

            <p className="mt-6 max-w-[46ch] text-pretty text-[0.9375rem] leading-relaxed text-ink-soft">
              {chapter.body[locale]}
            </p>

            <motion.dl
              style={{ x: specsX, opacity: specsOpacity }}
              className="mt-10 max-w-md"
            >
              {chapter.specs.map((spec) => (
                <div
                  key={spec.k.en}
                  className="hairline-t flex items-baseline justify-between gap-6 py-3.5 first:border-t-0"
                >
                  <dt className="text-[11px] font-medium uppercase tracking-[0.16em] text-ink-faint">
                    {spec.k[locale]}
                  </dt>
                  <dd className="tnum text-right text-sm font-medium tracking-[-0.01em] text-obsidian">
                    {spec.v[locale]}
                  </dd>
                </div>
              ))}
            </motion.dl>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

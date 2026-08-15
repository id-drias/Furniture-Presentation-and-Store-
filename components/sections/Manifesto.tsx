"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { AmbientVideo } from "@/components/ui/AmbientVideo";
import { useStore } from "@/components/providers/StoreProvider";
import { editorial } from "@/lib/furnitureData";
import { springScroll, viewportOnce } from "@/lib/motion";
import { t } from "@/lib/i18n";

/* ------------------------------------------------------------------ *
 * Manifesto — one full-bleed plate, one sentence, one name.
 * ------------------------------------------------------------------ */

export function Manifesto() {
  const { locale } = useStore();
  const ref = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const p = useSpring(scrollYProgress, springScroll);

  const imageY = useTransform(p, [0, 1], ["-12%", "12%"]);
  const scrimOpacity = useTransform(p, [0, 0.5, 1], [0.72, 0.55, 0.72]);

  return (
    <section
      ref={ref}
      className="grain relative isolate flex min-h-[86svh] items-center overflow-hidden bg-obsidian"
    >
      <motion.div style={{ y: imageY }} className="absolute inset-x-0 -inset-y-[12%]">
        <Image
          src={editorial.manifesto}
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
      </motion.div>

      <motion.div
        aria-hidden
        style={{ opacity: scrimOpacity }}
        className="absolute inset-0 bg-obsidian"
      />
      <AmbientVideo slot="manifestoLoop" opacity={0.28} blend="soft-light" />

      <div className="relative mx-auto w-full max-w-[1100px] px-6 text-center sm:px-8">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportOnce}
          transition={{ duration: 0.7 }}
          className="eyebrow !text-white/45"
        >
          {t("manifestoEyebrow", locale)}
        </motion.p>

        <motion.blockquote
          initial={{ opacity: 0, y: 44, filter: "blur(12px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={viewportOnce}
          transition={{ type: "spring", stiffness: 70, damping: 20, delay: 0.12 }}
          className="accent-serif mt-9 text-balance text-[clamp(1.9rem,5.4vw,4.25rem)] leading-[1.08] text-white"
        >
          “{t("manifestoQuote", locale)}”
        </motion.blockquote>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={viewportOnce}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-12 flex flex-col items-center gap-4"
        >
          <span className="rule-metal w-20" />
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-white/55">
            {t("manifestoAttr", locale)}
          </p>
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ *
 * Ethos marquee — a hairline strip of facts between the big sections.
 * ------------------------------------------------------------------ */

const ETHOS = [
  "Milano — 1974",
  "Thirty-one makers",
  "One collection a year",
  "Repaired, never replaced",
  "Nine hands per piece",
  "30-year warranty",
];

export function EthosMarquee() {
  return (
    <div className="hairline-y relative overflow-hidden border-y border-[rgba(15,23,42,0.08)] bg-white py-5">
      <div className="marquee-track flex w-max items-center gap-10 whitespace-nowrap will-change-transform">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex items-center gap-10" aria-hidden={copy === 1}>
            {ETHOS.map((item) => (
              <span key={item} className="flex items-center gap-10">
                <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-ink-faint">
                  {item}
                </span>
                <span className="h-1 w-1 rounded-full bg-champagne" />
              </span>
            ))}
          </div>
        ))}
      </div>

      {/* edge fades so the loop never visibly cuts */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white to-transparent" />
    </div>
  );
}

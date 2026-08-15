"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { AmbientVideo } from "@/components/ui/AmbientVideo";
import { Stagger, StaggerItem } from "@/components/ui/Reveal";
import { useStore } from "@/components/providers/StoreProvider";
import { editorial } from "@/lib/productsData";
import { spring } from "@/lib/motion";
import { t } from "@/lib/i18n";
import { useFinePointer } from "@/lib/hooks";

/* ------------------------------------------------------------------ *
 * Craftsmanship.
 *
 * Four macro plates in an expanding rail. The hovered panel takes the
 * room; the others compress to a spine of vertical type. On touch the
 * rail becomes a plain stack, because hover-to-expand is a lie there.
 * ------------------------------------------------------------------ */

export function Craftsmanship() {
  const { locale } = useStore();
  const [active, setActive] = useState(0);
  const fine = useFinePointer();

  return (
    <section
      id="atelier"
      className="grain relative scroll-mt-32 overflow-hidden bg-ceramic py-[var(--space-section)]"
    >
      <AmbientVideo slot="materialReveal" opacity={0.5} blend="soft-light" />

      <div className="relative mx-auto w-full max-w-[1480px] px-5 sm:px-8">
        <Stagger stagger={0.08} className="max-w-3xl">
          <StaggerItem>
            <p className="label">{t("craftEyebrow", locale)}</p>
            <div className="rule mt-6 w-20" />
          </StaggerItem>

          <StaggerItem display className="mt-7">
            <h2 className="display-section text-obsidian">
              {t("craftTitle", locale)}{" "}
              <span className="accent-serif text-ink-faint">
                {t("craftTitleAccent", locale)}
              </span>
            </h2>
          </StaggerItem>

          <StaggerItem className="mt-6">
            <p className="max-w-[48ch] text-pretty text-[0.9375rem] leading-relaxed text-ink-soft">
              {t("craftSub", locale)}
            </p>
          </StaggerItem>
        </Stagger>

        {/* --------------------------- the rail --------------------------- */}
        <div className="mt-12 flex flex-col gap-3 sm:mt-16 lg:h-[62vh] lg:min-h-[460px] lg:flex-row">
          {editorial.craft.map((panel, i) => {
            const isActive = active === i;
            return (
              <motion.button
                key={panel.key}
                onMouseEnter={() => fine && setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setActive(i)}
                aria-expanded={isActive}
                animate={{ flexGrow: isActive ? 2.9 : 1 }}
                transition={spring}
                className="group relative h-[340px] w-full shrink overflow-hidden rounded-[22px] bg-obsidian text-left sm:h-[380px] lg:h-full lg:w-auto lg:basis-0"
              >
                <motion.div
                  className="absolute inset-0"
                  animate={{ scale: isActive ? 1 : 1.12 }}
                  transition={spring}
                >
                  <Image
                    src={panel.macro}
                    /* The macro *is* the content of this panel, not decoration
                       beside it, so it carries a real description. */
                    alt={`${panel.title.en} — ${panel.body.en}`}
                    fill
                    sizes="(max-width: 1024px) 92vw, 46vw"
                    className="object-cover"
                  />
                </motion.div>

                <motion.div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-obsidian/80 via-obsidian/25 to-transparent"
                  animate={{ opacity: isActive ? 1 : 0.75 }}
                  transition={spring}
                />

                {/* index + metric */}
                <div className="absolute inset-x-0 top-0 flex items-start justify-between p-5">
                  <span className="tnum text-[10px] font-medium tracking-[0.22em] text-white/70">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <motion.span
                    animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : -6 }}
                    transition={spring}
                    className="rounded-full bg-white/12 px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-md"
                  >
                    {panel.metric[locale]}
                  </motion.span>
                </div>

                {/* caption */}
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                  <h3 className="display text-[clamp(1.5rem,3.4vw,2.5rem)] text-white">
                    {panel.title[locale]}
                  </h3>
                  <motion.p
                    animate={{
                      opacity: isActive ? 1 : 0,
                      height: isActive ? "auto" : 0,
                      y: isActive ? 0 : 10,
                    }}
                    transition={spring}
                    className="max-w-[38ch] overflow-hidden text-pretty text-[0.8125rem] leading-relaxed text-white/70"
                  >
                    <span className="block pt-3">{panel.body[locale]}</span>
                  </motion.p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

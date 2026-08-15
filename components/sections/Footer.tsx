"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { MagneticButton } from "@/components/ui/Magnetic";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { useStore, type FilterId } from "@/components/providers/StoreProvider";
import { categories } from "@/lib/productsData";
import { spring, viewportOnce } from "@/lib/motion";
import { t } from "@/lib/i18n";
import type { DictKey } from "@/lib/i18n";

/* ------------------------------------------------------------------ *
 * Footer.
 *
 * Manifesto, studios, catalogue shortcuts, newsletter, and a wordmark
 * cropped by the bottom edge of the page.
 * ------------------------------------------------------------------ */

/* Hardcoded so server and client markup are identical — a Date() here
   would be the one thing on the page that could mismatch on hydration. */
const YEAR = 2026;

const STUDIOS = [
  { city: "Milano", line: "Via Cesare Correnti 14", note: "Atelier & showroom" },
  { city: "London", line: "22 Charlotte Road, EC2A", note: "By appointment" },
  { city: "Kyoto", line: "Nakagyō-ku, Tominokōji", note: "By appointment" },
];

const HOUSE: DictKey[] = ["care", "trade", "press", "contact"];

export function Footer() {
  const { locale, setFilter } = useStore();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const jumpTo = (id: FilterId) => {
    setFilter(id);
    requestAnimationFrame(() => {
      document.getElementById("collection")?.scrollIntoView({ behavior: "smooth" });
    });
  };

  return (
    <footer className="grain relative overflow-hidden bg-white pt-[var(--space-section)]">
      <div className="mx-auto w-full max-w-[1480px] px-5 sm:px-8">
        {/* ------------------------- top block ------------------------- */}
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-10">
          <Reveal className="lg:col-span-5">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-obsidian text-white">
              <span className="accent-serif translate-y-[0.5px] text-[17px] not-italic">Æ</span>
            </span>
            <p className="mt-7 max-w-[42ch] text-pretty text-[0.9375rem] leading-relaxed text-ink-soft">
              {t("footerManifesto", locale)}
            </p>
          </Reveal>

          {/* studios */}
          <Stagger className="lg:col-span-3">
            <StaggerItem>
              <p className="label">{t("studios", locale)}</p>
            </StaggerItem>
            <div className="mt-6 space-y-5">
              {STUDIOS.map((s) => (
                <StaggerItem key={s.city}>
                  <p className="text-[0.875rem] font-medium tracking-[-0.01em] text-obsidian">
                    {s.city}
                  </p>
                  <p className="mt-0.5 text-[0.8125rem] text-ink-faint">{s.line}</p>
                  <p className="text-[0.75rem] text-ink-ghost">{s.note}</p>
                </StaggerItem>
              ))}
            </div>
          </Stagger>

          {/* catalogue + house */}
          <Stagger className="grid grid-cols-2 gap-8 lg:col-span-4">
            <div>
              <StaggerItem>
                <p className="label">{t("collectionCol", locale)}</p>
              </StaggerItem>
              <ul className="mt-6 space-y-3">
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <StaggerItem>
                      <button
                        onClick={() => jumpTo(cat.id as FilterId)}
                        className="tap-clean text-[0.875rem] text-ink-soft underline-offset-4 transition-colors duration-300 hover:text-obsidian hover:underline"
                      >
                        {cat.label[locale]}
                      </button>
                    </StaggerItem>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <StaggerItem>
                <p className="label">{t("houseCol", locale)}</p>
              </StaggerItem>
              <ul className="mt-6 space-y-3">
                {HOUSE.map((key) => (
                  <li key={key}>
                    <StaggerItem>
                      <a
                        href="#top"
                        className="tap-clean text-[0.875rem] text-ink-soft underline-offset-4 transition-colors duration-300 hover:text-obsidian hover:underline"
                      >
                        {t(key, locale)}
                      </a>
                    </StaggerItem>
                  </li>
                ))}
              </ul>
            </div>
          </Stagger>
        </div>

        {/* ------------------------- newsletter ------------------------- */}
        <Reveal className="mt-20">
          <div className="hairline rounded-[26px] bg-ceramic p-7 sm:p-10">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h3 className="display text-[clamp(1.6rem,3.4vw,2.5rem)] text-obsidian">
                  {t("newsletterTitle", locale)}
                </h3>
                <p className="mt-3 max-w-[44ch] text-pretty text-[0.875rem] leading-relaxed text-ink-soft">
                  {t("newsletterSub", locale)}
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (email.includes("@")) setSent(true);
                }}
                className="flex w-full max-w-md shrink-0 items-center gap-2"
              >
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("newsletterPlaceholder", locale)}
                  aria-label={t("newsletterPlaceholder", locale)}
                  className="h-14 min-w-0 flex-1 rounded-full bg-white px-6 text-[0.875rem] text-obsidian placeholder:text-ink-ghost focus:outline-none focus:ring-1 focus:ring-obsidian/15"
                />
                <MagneticButton size="lg" type="submit" magnetic={false}>
                  {t("subscribe", locale)}
                </MagneticButton>
              </form>
            </div>

            {sent && (
              <motion.p
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={spring}
                className="mt-5 text-[0.8125rem] text-champagne-deep"
              >
                {t("subscribed", locale)}
              </motion.p>
            )}
          </div>
        </Reveal>

        {/* ------------------------- bottom bar ------------------------- */}
        <div className="hairline-t mt-16 flex flex-col-reverse items-start justify-between gap-5 py-8 sm:flex-row sm:items-center">
          <p className="text-[0.75rem] text-ink-faint">
            © {YEAR} Aetheria Atelier. {t("rights", locale)}
          </p>
          <div className="flex items-center gap-6">
            <a href="#top" className="text-[0.75rem] text-ink-faint transition-colors duration-300 hover:text-obsidian">
              {t("privacy", locale)}
            </a>
            <a href="#top" className="text-[0.75rem] text-ink-faint transition-colors duration-300 hover:text-obsidian">
              {t("terms", locale)}
            </a>
          </div>
        </div>
      </div>

      {/* ---------------------- cropped wordmark ---------------------- */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={viewportOnce}
        transition={{ type: "spring", stiffness: 60, damping: 20 }}
        aria-hidden
        className="pointer-events-none select-none overflow-hidden"
      >
        <p className="translate-y-[22%] text-center text-[19vw] font-semibold leading-none tracking-[-0.055em] text-obsidian/[0.045]">
          AETHERIA
        </p>
      </motion.div>
    </footer>
  );
}

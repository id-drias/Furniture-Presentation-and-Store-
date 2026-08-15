import type { Locale } from "./types";

/* ------------------------------------------------------------------ *
 * Deterministic formatting.
 *
 * Every helper here is a pure function of (value, locale) — nothing
 * reads `navigator` or the system clock — so server and client markup
 * always agree and React never reports a hydration mismatch.
 * ------------------------------------------------------------------ */

/** Fixed book rate; the atelier re-publishes prices, it does not track FX. */
const EUR_PER_USD = 0.92;

export const currencyFor = (locale: Locale): "USD" | "EUR" =>
  locale === "fr" ? "EUR" : "USD";

/** Convert a USD base price into the locale's published currency. */
export const priceIn = (usd: number, locale: Locale): number =>
  locale === "fr" ? Math.round(usd * EUR_PER_USD) : usd;

/**
 * Group digits without Intl.NumberFormat — ICU data can differ between the
 * Node build and the browser, and a thin space vs. a normal space is exactly
 * the kind of mismatch that breaks hydration.
 */
const group = (n: number, sep: string): string => {
  const digits = Math.round(Math.abs(n)).toString();
  let out = "";
  for (let i = 0; i < digits.length; i++) {
    if (i > 0 && (digits.length - i) % 3 === 0) out += sep;
    out += digits[i];
  }
  return n < 0 ? `-${out}` : out;
};

/** `$12,400` in English; `11 408 €` in French. */
export const formatPrice = (usd: number, locale: Locale): string => {
  const value = priceIn(usd, locale);
  return locale === "fr"
    ? `${group(value, " ")} €`
    : `$${group(value, ",")}`;
};

/** Same as formatPrice but for an already-converted figure. */
export const formatConverted = (value: number, locale: Locale): string =>
  locale === "fr"
    ? `${group(value, " ")} €`
    : `$${group(value, ",")}`;

/** `244 cm` / `244 cm` — centimetres either way, comma decimal in French. */
export const formatCm = (cm: number, locale: Locale): string => {
  const body = Number.isInteger(cm)
    ? cm.toString()
    : cm.toFixed(1).replace(".", locale === "fr" ? "," : ".");
  return `${body} cm`;
};

/** Zero-padded catalogue index: 1 → "01". */
export const pad2 = (n: number): string => n.toString().padStart(2, "0");

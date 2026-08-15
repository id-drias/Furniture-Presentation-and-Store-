"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { MagneticButton } from "@/components/ui/Magnetic";
import {
  useEscape,
  useScrollLock,
  useStore,
} from "@/components/providers/StoreProvider";
import { formatConverted, formatPrice } from "@/lib/format";
import { drawerIn, fade, spring, springSnappy } from "@/lib/motion";
import { t } from "@/lib/i18n";
import type { CheckoutIntent, CheckoutResponse } from "@/lib/types";

/* ------------------------------------------------------------------ *
 * Cart & checkout slide-over.
 *
 * Three steps in one surface: selection → contact → confirmation.
 * Totals are recomputed server-side at submit; the client figure is
 * only ever a preview.
 * ------------------------------------------------------------------ */

type Step = "cart" | "details" | "done";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function CartDrawer() {
  const {
    cartOpen,
    closeCart,
    hydratedLines,
    itemCount,
    subtotal,
    setQty,
    remove,
    clear,
    locale,
  } = useStore();

  const [step, setStep] = useState<Step>("cart");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<CheckoutResponse | null>(null);

  useScrollLock(cartOpen);
  useEscape(cartOpen, closeCart);

  const reset = () => {
    setStep("cart");
    setError(null);
    setReceipt(null);
    setNote("");
  };

  const submit = async (intent: CheckoutIntent) => {
    if (!name.trim() || !EMAIL_RE.test(email)) {
      setError(t("requiredFields", locale));
      return;
    }
    setBusy(true);
    setError(null);

    try {
      /* Submit the *hydrated* lines, not the raw persisted ones. A cart
         restored from localStorage can still name a piece that has since
         left the catalogue; that line is invisible in the drawer, so the
         customer could never clear the 400 it would trigger. */
      const payloadLines = hydratedLines.map(({ productId, qty }) => ({
        productId,
        qty,
      }));

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intent,
          lines: payloadLines,
          contact: { name: name.trim(), email: email.trim(), note: note.trim() },
          locale,
        }),
      });
      const data: CheckoutResponse = await res.json();

      if (!res.ok || !data.ok) {
        setError(data.error ?? t("checkoutError", locale));
        return;
      }

      setReceipt(data);
      setStep("done");
      clear();
    } catch {
      setError(t("checkoutError", locale));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AnimatePresence onExitComplete={reset}>
      {cartOpen && (
        <div className="fixed inset-0 z-[170] flex justify-end">
          <motion.button
            aria-label={t("close", locale)}
            variants={fade}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={closeCart}
            className="absolute inset-0 cursor-default bg-obsidian/25 backdrop-blur-md"
          />

          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={t("cartTitle", locale)}
            variants={drawerIn}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative z-10 flex h-full w-full max-w-[470px] flex-col bg-white shadow-[var(--shadow-drawer)]"
          >
            {/* ----------------------- header ----------------------- */}
            <header className="hairline-b flex items-center justify-between px-6 py-5">
              <div>
                <h2 className="text-[0.9375rem] font-medium tracking-[-0.015em] text-obsidian">
                  {step === "done" ? t("orderPlaced", locale) : t("cartTitle", locale)}
                </h2>
                {step !== "done" && itemCount > 0 && (
                  <p className="tnum mt-0.5 text-[11px] uppercase tracking-[0.16em] text-ink-faint">
                    {itemCount}{" "}
                    {itemCount === 1 ? t("resultsOne", locale) : t("resultsMany", locale)}
                  </p>
                )}
              </div>

              <button
                onClick={closeCart}
                aria-label={t("close", locale)}
                className="tap-clean grid h-9 w-9 place-items-center rounded-full text-ink-soft transition-colors duration-300 hover:bg-obsidian/[0.055] hover:text-obsidian"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                  <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.3" />
                </svg>
              </button>
            </header>

            {/* ------------------------ body ------------------------ */}
            <div className="min-h-0 flex-1 overflow-y-auto">
              <AnimatePresence mode="wait" initial={false}>
                {step === "done" ? (
                  <motion.div
                    key="done"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={spring}
                    className="flex h-full flex-col items-center justify-center px-8 text-center"
                  >
                    <motion.span
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ ...spring, delay: 0.1 }}
                      className="grid h-14 w-14 place-items-center rounded-full bg-champagne-pale text-champagne-deep"
                    >
                      <svg width="18" height="14" viewBox="0 0 18 14" fill="none" aria-hidden>
                        <path
                          d="M1 7l5.5 5.5L17 1.5"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </motion.span>

                    <p className="mt-6 text-[10px] font-medium uppercase tracking-[0.2em] text-ink-faint">
                      {t("orderRef", locale)}
                    </p>
                    <p className="tnum mt-2 text-lg font-medium tracking-[-0.02em] text-obsidian">
                      {receipt?.reference}
                    </p>

                    {receipt?.message && (
                      <p className="mt-5 max-w-[34ch] text-pretty text-[0.8125rem] leading-relaxed text-ink-soft">
                        {receipt.message[locale]}
                      </p>
                    )}

                    {receipt?.total !== undefined && (
                      <p className="tnum mt-6 text-sm text-ink-soft">
                        {t("total", locale)}{" "}
                        <span className="font-medium text-obsidian">
                          {formatConverted(receipt.total, locale)}
                        </span>
                      </p>
                    )}
                  </motion.div>
                ) : hydratedLines.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex h-full flex-col items-center justify-center px-8 text-center"
                  >
                    <span className="grid h-14 w-14 place-items-center rounded-full bg-ceramic text-ink-faint">
                      <svg width="18" height="19" viewBox="0 0 15 16" fill="none" aria-hidden>
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
                    </span>
                    <p className="mt-5 text-[0.9375rem] font-medium text-obsidian">
                      {t("cartEmpty", locale)}
                    </p>
                    <p className="mt-2 max-w-[30ch] text-[0.8125rem] text-ink-faint">
                      {t("cartEmptySub", locale)}
                    </p>
                    <MagneticButton
                      variant="outline"
                      className="mt-7"
                      magnetic={false}
                      onClick={closeCart}
                    >
                      {t("cartBrowse", locale)}
                    </MagneticButton>
                  </motion.div>
                ) : step === "cart" ? (
                  <motion.ul
                    key="lines"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={spring}
                    className="px-6 py-2"
                  >
                    <AnimatePresence initial={false} mode="popLayout">
                      {hydratedLines.map((line) => (
                        <motion.li
                          key={line.productId}
                          layout
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0, x: -24 }}
                          transition={spring}
                          className="hairline-b overflow-hidden last:border-b-0"
                        >
                          <div className="flex gap-4 py-5">
                            <div className="relative h-[76px] w-[68px] shrink-0 overflow-hidden rounded-xl bg-ceramic">
                              <Image
                                src={line.product.image}
                                alt={line.product.name}
                                fill
                                sizes="68px"
                                className="object-cover"
                              />
                            </div>

                            <div className="flex min-w-0 flex-1 flex-col">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="truncate text-[0.875rem] font-medium tracking-[-0.01em] text-obsidian">
                                    {line.product.name}
                                  </p>
                                  <p className="mt-0.5 truncate text-[0.75rem] text-ink-faint">
                                    {line.product.collection}
                                  </p>
                                </div>
                                <p className="tnum shrink-0 text-[0.875rem] font-medium text-obsidian">
                                  {formatPrice(line.lineTotal, locale)}
                                </p>
                              </div>

                              <div className="mt-auto flex items-center justify-between gap-3 pt-3">
                                <Stepper
                                  qty={line.qty}
                                  max={line.product.stock}
                                  onChange={(q) => setQty(line.productId, q)}
                                />
                                <button
                                  onClick={() => remove(line.productId)}
                                  className="tap-clean text-[0.75rem] text-ink-faint underline-offset-4 transition-colors duration-300 hover:text-champagne-deep hover:underline"
                                >
                                  {t("remove", locale)}
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </motion.ul>
                ) : (
                  <motion.div
                    key="details"
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={spring}
                    className="space-y-4 px-6 py-6"
                  >
                    <Field
                      label={t("yourName", locale)}
                      value={name}
                      onChange={setName}
                      autoComplete="name"
                    />
                    <Field
                      label={t("yourEmail", locale)}
                      value={email}
                      onChange={setEmail}
                      type="email"
                      autoComplete="email"
                    />
                    <Field
                      label={t("yourNote", locale)}
                      value={note}
                      onChange={setNote}
                      multiline
                    />

                    <AnimatePresence>
                      {error && (
                        <motion.p
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="text-[0.8125rem] text-champagne-deep"
                        >
                          {error}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ----------------------- footer ----------------------- */}
            {step === "done" ? (
              <div className="hairline-t px-6 py-5">
                <MagneticButton
                  className="w-full"
                  magnetic={false}
                  size="lg"
                  onClick={closeCart}
                >
                  {t("continueBrowsing", locale)}
                </MagneticButton>
              </div>
            ) : (
              hydratedLines.length > 0 && (
                <div className="hairline-t px-6 py-5">
                  <dl className="space-y-2 text-[0.8125rem]">
                    <div className="flex justify-between">
                      <dt className="text-ink-soft">{t("subtotal", locale)}</dt>
                      <dd className="tnum font-medium text-obsidian">
                        {formatPrice(subtotal, locale)}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-ink-soft">{t("whiteGlove", locale)}</dt>
                      <dd className="text-champagne-deep">{t("included", locale)}</dd>
                    </div>
                    <div className="hairline-t flex justify-between pt-3">
                      <dt className="font-medium text-obsidian">{t("total", locale)}</dt>
                      <dd className="tnum text-base font-medium tracking-[-0.02em] text-obsidian">
                        {formatPrice(subtotal, locale)}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-5 flex flex-col gap-2.5">
                    {step === "cart" ? (
                      <MagneticButton
                        className="w-full"
                        size="lg"
                        magnetic={false}
                        onClick={() => setStep("details")}
                      >
                        {t("checkout", locale)}
                      </MagneticButton>
                    ) : (
                      <>
                        <MagneticButton
                          className="w-full"
                          size="lg"
                          magnetic={false}
                          disabled={busy}
                          onClick={() => submit("purchase")}
                        >
                          {busy ? t("processing", locale) : t("checkout", locale)}
                        </MagneticButton>
                        <MagneticButton
                          className="w-full"
                          variant="outline"
                          magnetic={false}
                          disabled={busy}
                          onClick={() => submit("consultation")}
                        >
                          {t("requestConsultation", locale)}
                        </MagneticButton>
                      </>
                    )}
                  </div>
                </div>
              )
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

/* -------------------------------- bits -------------------------------- */

function Stepper({
  qty,
  max,
  onChange,
}: {
  qty: number;
  max: number;
  onChange: (q: number) => void;
}) {
  return (
    <div className="flex items-center gap-1 rounded-full bg-obsidian/[0.045] p-0.5">
      <StepButton onClick={() => onChange(qty - 1)} label="−" />
      <motion.span
        key={qty}
        initial={{ scale: 1.25, opacity: 0.4 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={springSnappy}
        className="tnum w-6 text-center text-[0.75rem] font-medium text-obsidian"
      >
        {qty}
      </motion.span>
      <StepButton onClick={() => onChange(qty + 1)} label="+" disabled={qty >= max} />
    </div>
  );
}

function StepButton({
  onClick,
  label,
  disabled,
}: {
  onClick: () => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label === "+" ? "Increase quantity" : "Decrease quantity"}
      className="tap-clean grid h-6 w-6 place-items-center rounded-full text-[0.8125rem] leading-none text-ink-soft transition-colors duration-300 hover:bg-white hover:text-obsidian disabled:opacity-30 disabled:hover:bg-transparent"
    >
      {label}
    </button>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  multiline,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  multiline?: boolean;
  autoComplete?: string;
}) {
  const shared =
    "w-full rounded-2xl bg-ceramic px-4 py-3.5 text-[0.875rem] text-obsidian placeholder:text-ink-ghost " +
    "transition-shadow duration-300 focus:outline-none focus:ring-1 focus:ring-obsidian/15";

  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-medium uppercase tracking-[0.16em] text-ink-faint">
        {label}
      </span>
      {multiline ? (
        <textarea
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${shared} resize-none`}
        />
      ) : (
        <input
          type={type}
          value={value}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
          className={shared}
        />
      )}
    </label>
  );
}

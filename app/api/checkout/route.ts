import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { productById } from "@/lib/productsData";
import { currencyFor, priceIn } from "@/lib/format";
import type {
  CartLine,
  CheckoutIntent,
  CheckoutRequest,
  CheckoutResponse,
  Locale,
} from "@/lib/types";

/* ------------------------------------------------------------------ *
 * POST /api/checkout
 *
 * Accepts an order or a consultation request. Prices are re-derived
 * from the catalogue on the server — the client's figures are treated
 * as a display preview and never trusted.
 * ------------------------------------------------------------------ */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_LINES = 40;
const MAX_QTY = 99;

const bad = (error: string, status = 400) =>
  NextResponse.json<CheckoutResponse>({ ok: false, error }, { status });

export async function POST(request: Request) {
  let payload: Partial<CheckoutRequest>;

  try {
    payload = (await request.json()) as Partial<CheckoutRequest>;
  } catch {
    return bad("Malformed JSON body");
  }

  /* ------------------------------ validate ------------------------------ */

  const intent: CheckoutIntent =
    payload.intent === "consultation" ? "consultation" : "purchase";

  const locale: Locale = payload.locale === "fr" ? "fr" : "en";

  const contact = payload.contact;
  if (!contact || typeof contact.name !== "string" || !contact.name.trim()) {
    return bad("A name is required");
  }
  if (typeof contact.email !== "string" || !EMAIL_RE.test(contact.email)) {
    return bad("A valid email is required");
  }

  const rawLines = payload.lines;
  if (!Array.isArray(rawLines) || rawLines.length === 0) {
    return bad("The selection is empty");
  }
  if (rawLines.length > MAX_LINES) {
    return bad("Too many lines in one request");
  }

  /* --------------------- re-price against the catalogue --------------------- */

  let subtotalUsd = 0;
  let itemCount = 0;
  const resolved: Array<{ id: string; name: string; qty: number; unitUsd: number }> = [];

  for (const line of rawLines as CartLine[]) {
    if (!line || typeof line.productId !== "string") {
      return bad("Malformed line item");
    }

    const qty = Math.floor(Number(line.qty));
    if (!Number.isFinite(qty) || qty < 1 || qty > MAX_QTY) {
      return bad(`Invalid quantity for ${line.productId}`);
    }

    const product = productById(line.productId);
    if (!product) {
      return bad(`Unknown piece: ${line.productId}`);
    }

    /* A purchase cannot exceed what the current run holds; a consultation
       is only an enquiry, so it is allowed to ask for more. */
    if (intent === "purchase" && qty > product.stock) {
      return bad(`Only ${product.stock} of ${product.name} remain in this run`);
    }

    subtotalUsd += product.price * qty;
    itemCount += qty;
    resolved.push({ id: product.id, name: product.name, qty, unitUsd: product.price });
  }

  /* ------------------------------- respond ------------------------------- */

  const subtotal = priceIn(subtotalUsd, locale);
  const whiteGlove = 0; // included on every order, worldwide
  const total = subtotal + whiteGlove;
  const reference = `AE-${randomUUID().slice(0, 8).toUpperCase()}`;

  // Stands in for the atelier's order desk / CRM hand-off.
  console.info("[api/checkout]", {
    reference,
    intent,
    itemCount,
    subtotalUsd,
    email: contact.email,
    lines: resolved,
  });

  const message =
    intent === "consultation"
      ? {
          en: "A member of the atelier will write within one working day to arrange your consultation.",
          fr: "Un membre de l'atelier vous écrira sous un jour ouvré pour organiser votre rendez-vous.",
        }
      : {
          en: "Your pieces are reserved. We will confirm the maker's schedule and delivery window by email.",
          fr: "Vos pièces sont réservées. Nous confirmerons le planning de l'artisan et la fenêtre de livraison par courriel.",
        };

  const body: CheckoutResponse = {
    ok: true,
    reference,
    intent,
    currency: currencyFor(locale),
    subtotal,
    whiteGlove,
    total,
    itemCount,
    message,
  };

  return NextResponse.json(body, {
    status: 201,
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}

/** Anything other than POST is a client error, answered explicitly. */
export async function GET() {
  return NextResponse.json<CheckoutResponse>(
    { ok: false, error: "Use POST to submit an order or consultation request" },
    { status: 405, headers: { Allow: "POST" } },
  );
}

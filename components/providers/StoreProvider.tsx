"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type {
  CartLine,
  CategoryId,
  HydratedLine,
  Locale,
  Product,
} from "@/lib/types";

export type FilterId = CategoryId | "all";

/* ------------------------------------------------------------------ *
 * One store for locale + cart + overlay state.
 *
 * The cart persists to localStorage, but is only read back *after*
 * mount so the server and first client render always agree.
 * ------------------------------------------------------------------ */

const STORAGE_KEY = "aetheria.cart.v1";
const LOCALE_KEY = "aetheria.locale.v1";

interface StoreValue {
  /* locale */
  locale: Locale;
  setLocale: (l: Locale) => void;
  toggleLocale: () => void;

  /* catalogue (seeded server-side, refreshed from /api/products) */
  catalogue: Product[];
  setCatalogue: (p: Product[]) => void;

  /* active store filter — shared so the header nav can drive the grid */
  filter: FilterId;
  setFilter: (f: FilterId) => void;

  /* cart */
  lines: CartLine[];
  hydratedLines: HydratedLine[];
  itemCount: number;
  subtotal: number;
  add: (productId: string, qty?: number) => void;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;

  /* overlays */
  cartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  quickView: Product | null;
  openQuickView: (p: Product) => void;
  closeQuickView: () => void;

  /** Bumped on every add so the header badge can pulse. */
  addPulse: number;
  /** False until the persisted cart has been read back. */
  ready: boolean;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({
  children,
  initialCatalogue,
}: {
  children: React.ReactNode;
  initialCatalogue: Product[];
}) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [catalogue, setCatalogue] = useState<Product[]>(initialCatalogue);
  const [filter, setFilter] = useState<FilterId>("all");
  const [lines, setLines] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [quickView, setQuickView] = useState<Product | null>(null);
  const [addPulse, setAddPulse] = useState(0);
  const [ready, setReady] = useState(false);

  /* ---- rehydrate after mount (never during render) ---- */
  useEffect(() => {
    try {
      const rawCart = window.localStorage.getItem(STORAGE_KEY);
      if (rawCart) {
        const parsed: unknown = JSON.parse(rawCart);
        if (Array.isArray(parsed)) {
          setLines(
            parsed.filter(
              (l): l is CartLine =>
                typeof l === "object" &&
                l !== null &&
                typeof (l as CartLine).productId === "string" &&
                typeof (l as CartLine).qty === "number",
            ),
          );
        }
      }
      const rawLocale = window.localStorage.getItem(LOCALE_KEY);
      if (rawLocale === "en" || rawLocale === "fr") setLocaleState(rawLocale);
    } catch {
      /* private mode / quota — the cart simply starts empty */
    }
    setReady(true);
  }, []);

  /* ---- persist ---- */
  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* ignore */
    }
  }, [lines, ready]);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(LOCALE_KEY, locale);
    } catch {
      /* ignore */
    }
    document.documentElement.lang = locale;
  }, [locale, ready]);

  /* ---- catalogue refresh from the serverless route ---- */
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/products", { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.products) && data.products.length) {
          setCatalogue(data.products as Product[]);
        }
      })
      .catch(() => {
        /* offline or aborted — the SSR seed is already on screen */
      });
    return () => controller.abort();
  }, []);

  /* ---- cart operations ---- */
  /* Quantities are capped at what the current run holds, so the client can
     never assemble a basket the checkout route will reject. */
  const add = useCallback(
    (productId: string, qty = 1) => {
      const stock = catalogue.find((p) => p.id === productId)?.stock ?? 0;
      if (stock < 1) return;

      setLines((prev) => {
        const existing = prev.find((l) => l.productId === productId);
        if (existing) {
          return prev.map((l) =>
            l.productId === productId
              ? { ...l, qty: Math.min(l.qty + qty, stock) }
              : l,
          );
        }
        return [...prev, { productId, qty: Math.min(qty, stock) }];
      });
      setAddPulse((n) => n + 1);
    },
    [catalogue],
  );

  const setQty = useCallback((productId: string, qty: number) => {
    setLines((prev) =>
      qty <= 0
        ? prev.filter((l) => l.productId !== productId)
        : prev.map((l) =>
            l.productId === productId ? { ...l, qty: Math.min(qty, 99) } : l,
          ),
    );
  }, []);

  const remove = useCallback((productId: string) => {
    setLines((prev) => prev.filter((l) => l.productId !== productId));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  /* ---- derived ---- */
  const hydratedLines = useMemo<HydratedLine[]>(() => {
    return lines.flatMap((line) => {
      const product = catalogue.find((p) => p.id === line.productId);
      if (!product) return [];
      return [{ ...line, product, lineTotal: product.price * line.qty }];
    });
  }, [lines, catalogue]);

  const itemCount = useMemo(
    () => hydratedLines.reduce((n, l) => n + l.qty, 0),
    [hydratedLines],
  );

  const subtotal = useMemo(
    () => hydratedLines.reduce((n, l) => n + l.lineTotal, 0),
    [hydratedLines],
  );

  /* ---- overlays ---- */
  const openCart = useCallback(() => {
    setQuickView(null);
    setCartOpen(true);
  }, []);
  const closeCart = useCallback(() => setCartOpen(false), []);
  const openQuickView = useCallback((p: Product) => setQuickView(p), []);
  const closeQuickView = useCallback(() => setQuickView(null), []);

  const setLocale = useCallback((l: Locale) => setLocaleState(l), []);
  const toggleLocale = useCallback(
    () => setLocaleState((l) => (l === "en" ? "fr" : "en")),
    [],
  );

  const value = useMemo<StoreValue>(
    () => ({
      locale,
      setLocale,
      toggleLocale,
      catalogue,
      setCatalogue,
      filter,
      setFilter,
      lines,
      hydratedLines,
      itemCount,
      subtotal,
      add,
      setQty,
      remove,
      clear,
      cartOpen,
      openCart,
      closeCart,
      quickView,
      openQuickView,
      closeQuickView,
      addPulse,
      ready,
    }),
    [
      locale,
      setLocale,
      toggleLocale,
      catalogue,
      filter,
      lines,
      hydratedLines,
      itemCount,
      subtotal,
      add,
      setQty,
      remove,
      clear,
      cartOpen,
      openCart,
      closeCart,
      quickView,
      openQuickView,
      closeQuickView,
      addPulse,
      ready,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}

/* ------------------------------------------------------------------ *
 * Locks body scroll while an overlay is open, compensating for the
 * scrollbar so the page never shifts sideways as the drawer opens.
 * ------------------------------------------------------------------ */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const { body } = document;
    const prevOverflow = body.style.overflow;
    const prevPad = body.style.paddingRight;
    const gap = window.innerWidth - document.documentElement.clientWidth;

    body.style.overflow = "hidden";
    if (gap > 0) body.style.paddingRight = `${gap}px`;

    return () => {
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPad;
    };
  }, [active]);
}

/** Calls `onClose` on Escape while `active`. */
export function useEscape(active: boolean, onClose: () => void) {
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, onClose]);
}

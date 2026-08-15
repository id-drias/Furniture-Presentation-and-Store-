/* ------------------------------------------------------------------ *
 * Aetheria Atelier — shared domain types
 * ------------------------------------------------------------------ */

export type Locale = "en" | "fr";

/** A string that exists in every supported locale. */
export type Localized = Record<Locale, string>;

export type CategoryId = "seating" | "tables" | "lighting" | "decor";

/**
 * Bento footprint, in columns of a six-column grid:
 * `full` = 6, `wide` = 3, `std` = 2.
 *
 * The catalogue is sequenced so the unfiltered grid closes every row
 * exactly — 6 · (3+3) · (2+2+2) · (3+3) · (2+2+2) · (3+3).
 */
export type Tile = "full" | "wide" | "std";

export interface MaterialSpec {
  /** e.g. "Bouclé, undyed" */
  name: Localized;
  /** One line of provenance / process. */
  detail: Localized;
  /** Hex chip rendered in the quick-view swatch rail. */
  swatch: string;
  /** Macro photograph of the material itself. */
  macro: string;
}

export interface Dimensions {
  /** centimetres */
  w: number;
  d: number;
  h: number;
  /** seat height, seating only */
  seat?: number;
}

export interface Product {
  id: string;
  slug: string;
  /** Brand names are not translated. */
  name: string;
  collection: string;
  category: CategoryId;
  /** Base price in USD. EUR is derived at render time. */
  price: number;
  tagline: Localized;
  story: Localized;
  dimensions: Dimensions;
  materials: MaterialSpec[];
  leadTime: Localized;
  /** Pieces currently reserved in the atelier's run. */
  stock: number;
  edition?: string;
  image: string;
  gallery: string[];
  tile: Tile;
}

export interface Category {
  id: CategoryId | "all";
  label: Localized;
}

/* ---------------------------- commerce ---------------------------- */

export interface CartLine {
  productId: string;
  qty: number;
}

/** Cart line joined with its catalogue record, ready to render. */
export interface HydratedLine extends CartLine {
  product: Product;
  lineTotal: number;
}

export type CheckoutIntent = "purchase" | "consultation";

export interface CheckoutRequest {
  intent: CheckoutIntent;
  lines: CartLine[];
  contact: {
    name: string;
    email: string;
    note?: string;
  };
  locale: Locale;
}

export interface CheckoutResponse {
  ok: boolean;
  reference?: string;
  intent?: CheckoutIntent;
  currency?: "USD" | "EUR";
  subtotal?: number;
  whiteGlove?: number;
  total?: number;
  itemCount?: number;
  message?: Localized;
  error?: string;
}

export interface ProductsResponse {
  products: Product[];
  categories: Category[];
  count: number;
  generatedAt: string;
}

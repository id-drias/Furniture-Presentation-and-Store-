import { NextResponse } from "next/server";
import {
  categories,
  products,
  productsByCategory,
  searchProducts,
} from "@/lib/furnitureData";
import type { Product, ProductsResponse } from "@/lib/types";

/* ------------------------------------------------------------------ *
 * GET /api/products
 *
 * Serves the catalogue with pricing, inventory state and media URLs.
 *
 *   ?category=seating|tables|lighting|decor|all
 *   ?q=travertine            free text over name / collection / tagline
 *   ?slug=lumiere-sofa       single record
 *
 * Runs as a Netlify Function — never statically inlined, so inventory
 * can be swapped for a live source without touching the front end.
 * ------------------------------------------------------------------ */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_CATEGORIES = new Set(["all", ...categories.map((c) => c.id)]);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const slug = searchParams.get("slug");
    if (slug) {
      const found = products.find((p) => p.slug === slug);
      if (!found) {
        return NextResponse.json(
          { error: "Not found", slug },
          { status: 404, headers: noStore },
        );
      }
      return NextResponse.json({ product: found }, { headers: noStore });
    }

    const category = (searchParams.get("category") ?? "all").toLowerCase();
    if (!VALID_CATEGORIES.has(category)) {
      return NextResponse.json(
        { error: `Unknown category "${category}"` },
        { status: 400, headers: noStore },
      );
    }

    const query = searchParams.get("q") ?? "";

    let result: Product[] = productsByCategory(category);
    if (query.trim()) {
      const matches = new Set(searchProducts(query).map((p) => p.id));
      result = result.filter((p) => matches.has(p.id));
    }

    const body: ProductsResponse = {
      products: result,
      categories,
      count: result.length,
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json(body, { headers: noStore });
  } catch (err) {
    console.error("[api/products]", err);
    return NextResponse.json(
      { error: "Catalogue unavailable" },
      { status: 500, headers: noStore },
    );
  }
}

/* Inventory changes between requests — never let a CDN hold this. */
const noStore = {
  "Cache-Control": "no-store, max-age=0",
};

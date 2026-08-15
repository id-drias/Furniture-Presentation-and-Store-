/* ------------------------------------------------------------------ *
 * Custom next/image loader.
 *
 * Every photograph in this project is served from the Unsplash CDN,
 * which is itself an image CDN: it resizes, re-encodes and serves AVIF
 * or WebP from `w` / `q` / `auto=format` query params.
 *
 * Routing those through Next's own optimizer meant downloading a
 * 1600–2400px original and re-encoding it with sharp on every cold
 * request — 0.7–2.2s per image locally, against ~20 images on the page.
 * The result was a page whose photographs arrived long after its text,
 * which reads exactly like broken images.
 *
 * Delegating to the origin CDN removes that work entirely:
 *   · no sharp pass, no .next/cache/images writes, instant in dev
 *   · no Netlify function invocation per image in production
 *   · a genuine responsive srcset, because `width` maps to Unsplash's `w`
 *
 * Non-Unsplash and local sources are passed through untouched, so
 * anything added to /public keeps working.
 * ------------------------------------------------------------------ */

export interface ImageLoaderArgs {
  src: string;
  width: number;
  quality?: number;
}

/**
 * Same transform, callable directly.
 *
 * For the few places that use a CSS `background-image` instead of
 * `next/image` and therefore never reach the loader — without this, a
 * 48px avatar chip downloads a 2000px original.
 */
export function unsplashSized(src: string, width: number, quality = 75): string {
  return unsplashLoader({ src, width, quality });
}

export default function unsplashLoader({
  src,
  width,
  quality,
}: ImageLoaderArgs): string {
  // Local assets (/media, /public) have nothing to delegate to.
  if (!src.startsWith("http")) return src;

  try {
    const url = new URL(src);

    if (!url.hostname.endsWith("unsplash.com")) return src;

    url.searchParams.set("w", String(width));
    url.searchParams.set("q", String(quality ?? 75));
    // `auto=format` lets the CDN pick AVIF/WebP per Accept header.
    url.searchParams.set("auto", "format");
    if (!url.searchParams.has("fit")) url.searchParams.set("fit", "crop");

    return url.toString();
  } catch {
    // A malformed URL should degrade to the original, never throw during render.
    return src;
  }
}

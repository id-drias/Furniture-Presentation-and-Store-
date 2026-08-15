# Aetheria Atelier

An editorial brand showcase and interactive furniture gallery, built as a single
scrolling page. Next.js App Router · TypeScript · Tailwind v4 · motion.dev.

Alabaster canvas, ceramic surfaces, obsidian type, champagne metal. One serif
italic carries the accent half of every headline; everything else is Inter at
tight tracking.

---

## Run it

```bash
npm install
```

```bash
npm run dev
```

Then open <http://localhost:3000>.

Other scripts: `npm run build`, `npm start`, `npm run typecheck`.

---

## Architecture

```
app/
  layout.tsx              fonts, metadata, StoreProvider, chrome, overlays
  page.tsx                section composition
  globals.css             design tokens, glass, grain, caustics, keyframes
  api/products/route.ts   GET  — catalogue, filtering, search, single lookup
  api/checkout/route.ts   POST — orders & consultations, re-priced server-side
lib/
  furnitureData.ts        the catalogue — single source of truth
  types.ts  i18n.ts  format.ts  motion.ts  media.ts  hooks.ts
components/
  providers/StoreProvider.tsx   locale · catalogue · cart · overlays
  chrome/                       GlassHeader, CursorHalo
  sections/                     Hero, PinnedChapters, Craftsmanship, Manifesto, Footer
  store/                        Collection, ProductCard, QuickView, CartDrawer
  ui/                           Magnetic, TiltPlate, Reveal, AmbientVideo
```

**One motion vocabulary.** Every transition in the build comes from
`lib/motion.ts` (house spring: `stiffness: 100, damping: 20`). No component
hand-rolls a transition, which is what makes a card hover, a drawer and a filter
reflow feel like the same physical material.

**The catalogue drives everything.** Both API routes and the whole storefront
read `lib/furnitureData.ts`. Array order is *bento order* — the `tile`
footprints are sequenced so the unfiltered grid closes every row of the
six-column layout exactly: `6 · (3+3) · (2+2+2) · (3+3) · (2+2+2) · (3+3)`.
A half-width plate at 3:2 is the same height as a third-width plate at 1:1, so
mixed rows sit level.

**Prices are never trusted from the client.** `/api/checkout` re-derives every
line from the catalogue, enforces the current run's stock on purchases (but not
on consultation enquiries), and returns the total in the locale's currency.

**Bilingual for real.** The EN/FR toggle switches interface copy, product prose,
lead times, and currency (USD → EUR, French thousands separators). Formatting in
`lib/format.ts` is deliberately hand-rolled rather than `Intl.NumberFormat`:
ICU data can differ between the Node build and the browser, and a thin space vs.
a normal space is exactly the kind of mismatch that breaks hydration.

---

## Ambient video (Higgsfield MCP or any loop)

The site ships complete with a **pure-CSS caustics field**, so it is beautiful
with zero external media. Three slots in `lib/media.ts` upgrade themselves to
real video the moment you give them a URL — no component edits:

All four slots are wired:

| Slot | Used by | File | Treatment |
| --- | --- | --- | --- |
| `heroInterior` | `HeroVideoBackground` | `/media/hero-interior.mp4` | full-bleed, dark grade @ 0.56 |
| `materialReveal` | `sections/Craftsmanship` | `/media/material-macro.mp4` | `soft-light` @ 0.5 |
| `manifestoLoop` | `sections/Manifesto` | `/media/manifesto-atelier.mp4` | `soft-light` @ 0.28 |
| `heroCaustics` | *(unused — kept for reuse)* | `/media/hero-caustics.mp4` | `screen` @ 0.9 |

Each slot declares `hasAudio`. It is authored, never probed: the
`webkitAudioDecodedByteCount` family is non-standard, engine-specific and only
meaningful after playback starts, so probing yields a mute button that either
arrives late or sits there toggling nothing. The hero renders its unmute
control only when the wired clip actually carries audio.

Generated with Seedance 1.5 Pro at 854×480, 4 s, silent. The low resolution is
deliberate — each layer is blended at low opacity, so it reads as a light field
rather than as footage, and 480p costs nothing visually there while keeping all
three clips to ~4.6 MB total.

The clips are 4 s and loop with a hard cut. At these opacities the seam is
essentially invisible; if you ever want it perfect, the fix is a second stacked
`<video>` offset by half the duration and cross-faded, inside `AmbientVideo`.

```ts
// lib/media.ts
heroCaustics: {
  src: "/media/hero-caustics.mp4",   // or any absolute URL
  poster: "/media/hero-caustics.jpg",
  brief: "…",
},
```

`AmbientVideo` falls back to the CSS field automatically when `src` is `null`,
when the file fails to load, when autoplay is refused (low-power mode), or when
the visitor prefers reduced motion.

---

## Deploying to Netlify

`netlify.toml` is committed and complete:

- `@netlify/plugin-nextjs` runs the App Router — `/api/products` and
  `/api/checkout` become Netlify Functions.
- Both routes are `force-dynamic`, so nothing is statically inlined and
  inventory can be swapped for a live source without touching the front end.
- No static export, so no static-export limitations.

Connect the repo in Netlify and accept the detected settings, or:

```bash
netlify deploy --build --prod
```

### Images bypass the Next optimizer on purpose

Photography is served straight from the Unsplash CDN through a custom
`next/image` loader ([lib/imageLoader.ts](lib/imageLoader.ts)), not re-encoded
locally by sharp.

Unsplash is already an image CDN — it resizes, re-encodes and negotiates
AVIF/WebP from `w` / `q` / `auto=format`. Routing through Next's optimizer
meant downloading a 1600–2400px original and re-encoding it per request:
**0.7–2.2 s per image on a cold cache**, against ~20 photographs on the page.
Because `next/image` also lazy-loads, scrolling produced a trail of empty
frames — indistinguishable from broken images.

Delegating to the origin removes that work entirely: nothing to encode, no
`.next/cache/images`, instant in dev, and no Netlify function invocation per
image in production. `deviceSizes` is also trimmed from 8 breakpoints to 5,
since each one multiplies every srcset.

If you ever point `img()` at a non-Unsplash host, the loader passes the URL
through untouched — add the host to `remotePatterns` and it keeps working.

---

## Accessibility & motion

- Every ambient loop, marquee and caustic field stops under
  `prefers-reduced-motion`; entrances collapse to a plain fade.
- The magnetic cursor, plate tilt and cursor halo are fine-pointer only — they
  never engage on touch.
- Skip link, focus-visible rings in the metal accent, `aria-selected` tabs,
  labelled dialogs, Escape-to-close, and scroll locking that compensates for the
  scrollbar so the page never shifts sideways as a drawer opens.

---

## A note on verifying animation

`motion` drives its completion callbacks through `requestAnimationFrame`. In a
headless or non-compositing browser (`document.visibilityState === "hidden"`),
rAF never fires, so entrance animations stay at their initial state and
`AnimatePresence` never unmounts an exiting child. That is a property of the
environment, not of this code — if a grid appears not to filter, check
`document.visibilityState` before suspecting the component.

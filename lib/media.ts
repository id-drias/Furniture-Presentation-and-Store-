/* ------------------------------------------------------------------ *
 * Ambient motion sources.
 *
 * The site ships with a pure-CSS caustics field so it is complete and
 * beautiful with zero external media. Drop a generated loop URL (or a
 * local file in /public/media) into any slot below and the matching
 * <AmbientVideo> upgrades itself automatically — no component edits.
 *
 * Slots are consumed by:
 *   heroCaustics  → components/sections/Hero.tsx
 *   materialReveal→ components/sections/Craftsmanship.tsx
 *   manifestoLoop → components/sections/Manifesto.tsx
 *
 * Every slot is optional. `null` means "render the CSS field instead".
 * ------------------------------------------------------------------ */

export interface MotionSlot {
  /** MP4/WebM URL, or null to use the generated CSS field. */
  src: string | null;
  /** Poster frame shown before the loop decodes. */
  poster: string | null;
  /** The prompt this slot was authored against, kept for regeneration. */
  brief: string;
}

export const motionSlots = {
  /* Generated with Seedance 1.5 Pro — 854×480, 4s, silent, seed 613584.
     480p is deliberate: this layer is screen-blended at low opacity over a
     white wall, so it reads as a light field, not as footage. */
  heroCaustics: {
    src: "/media/hero-caustics.mp4",
    poster: null,
    brief:
      "Abstract water caustics drifting slowly across a bare white plaster " +
      "wall, warm late-afternoon sun from off frame, locked-off camera, no " +
      "objects, high-key and pale, photoreal with fine 35mm grain.",
  },
  /* Generated with Seedance 1.5 Pro — 854×480, 4s, silent. Runs at 0.5
     soft-light behind the Craftsmanship rail, under the macro plates. */
  materialReveal: {
    src: "/media/material-macro.mp4",
    poster: null,
    brief:
      "Extreme macro slow dolly across dark walnut grain giving way to honed " +
      "travertine, low raking sidelight revealing open pores, dust motes, " +
      "very shallow depth of field, photoreal with fine 35mm grain.",
  },
  /* Generated with Seedance 1.5 Pro — 854×480, 4s, silent, seed 825997. */
  manifestoLoop: {
    src: "/media/manifesto-atelier.mp4",
    poster: null,
    brief:
      "Static wide of an empty sunlit artisan workshop at golden hour, dust " +
      "motes in a shaft of light, linen curtain breathing, locked-off camera, " +
      "warm and dim, photoreal with fine 35mm grain.",
  },
} satisfies Record<string, MotionSlot>;

export type MotionSlotKey = keyof typeof motionSlots;

export const getSlot = (key: MotionSlotKey): MotionSlot => motionSlots[key];

/** True when a real video has been wired into the slot. */
export const slotHasVideo = (key: MotionSlotKey): boolean =>
  Boolean(motionSlots[key].src);

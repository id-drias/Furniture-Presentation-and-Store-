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
  /**
   * Whether the file carries an audio track.
   *
   * Declared rather than probed. `webkitAudioDecodedByteCount` and friends
   * are non-standard, engine-specific, and only meaningful after playback
   * has begun — probing them means a mute button that either flickers in
   * late or, worse, sits there toggling nothing. We author these clips, so
   * we already know the answer.
   */
  hasAudio: boolean;
  /** The prompt this slot was authored against, kept for regeneration. */
  brief: string;
}

export const motionSlots = {
  /* The hero plate. Generated with Seedance 1.5 Pro — 854×480, 4s, silent:
     a slow dolly through a glass-walled interior at golden hour.

     480p is a hard budget ceiling, not a preference. It survives full-bleed
     because the treatment is built for it — a heavy dark grade, a 1.06→1.14
     ken-burns push, and screen-blended film grain over the top. Grain is
     what makes an upscaled frame read as "cinematic" rather than "soft".
     Swap in a 1080p file here and the component needs no edit. */
  heroInterior: {
    src: "/media/hero-interior.mp4",
    poster: null,
    /* All four clips were generated with generate_audio: false. */
    hasAudio: false,
    brief:
      "Slow cinematic forward dolly through an ultra-luxurious modern " +
      "architectural living room at golden hour: floor-to-ceiling glass, " +
      "marble floor, travertine wall, cream bouclé sofa, floating " +
      "cantilevered staircase, volumetric light, no people.",
  },
  /* Generated with Seedance 1.5 Pro — 854×480, 4s, silent, seed 613584.
     480p is deliberate: this layer is screen-blended at low opacity over a
     white wall, so it reads as a light field, not as footage. */
  heroCaustics: {
    src: "/media/hero-caustics.mp4",
    poster: null,
    /* All four clips were generated with generate_audio: false. */
    hasAudio: false,
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
    /* All four clips were generated with generate_audio: false. */
    hasAudio: false,
    brief:
      "Extreme macro slow dolly across dark walnut grain giving way to honed " +
      "travertine, low raking sidelight revealing open pores, dust motes, " +
      "very shallow depth of field, photoreal with fine 35mm grain.",
  },
  /* Generated with Seedance 1.5 Pro — 854×480, 4s, silent, seed 825997. */
  manifestoLoop: {
    src: "/media/manifesto-atelier.mp4",
    poster: null,
    /* All four clips were generated with generate_audio: false. */
    hasAudio: false,
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

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    /*
     * Photography is delegated to the Unsplash CDN via a custom loader
     * rather than re-encoded locally by sharp. Re-optimising a 2400px
     * original per request cost 0.7–2.2s each on a cold cache, so the
     * page's ~20 photographs landed long after its text — indistinguishable
     * from broken images. See lib/imageLoader.ts.
     */
    loader: "custom",
    loaderFile: "./lib/imageLoader.ts",
    /* Trimmed from 8 breakpoints to 5: each one multiplies the srcset,
       and the gaps between these are already below a visible step. */
    deviceSizes: [640, 1080, 1600, 1920, 2560],
    imageSizes: [48, 96, 200, 384],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
    ],
  },
  // Deliberately not using `experimental.optimizePackageImports` for
  // "motion": the barrel rewrite is an experimental transform and this
  // app leans hard on motion's shared context (AnimatePresence, layout
  // projection). The bundle win is not worth that risk here.
};

export default nextConfig;

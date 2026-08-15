import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // Editorial photography is hot-linked from Unsplash's CDN and re-optimised
    // by the Next image pipeline (served through Netlify's image CDN in prod).
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [420, 640, 828, 1080, 1280, 1600, 1920, 2560],
  },
  // Deliberately not using `experimental.optimizePackageImports` for
  // "motion": the barrel rewrite is an experimental transform and this
  // app leans hard on motion's shared context (AnimatePresence, layout
  // projection). The bundle win is not worth that risk here.
};

export default nextConfig;

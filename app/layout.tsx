import type { Metadata, Viewport } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import { StoreProvider } from "@/components/providers/StoreProvider";
import { GlassHeader } from "@/components/chrome/GlassHeader";
import { CursorHalo } from "@/components/chrome/CursorHalo";
import { CartDrawer } from "@/components/store/CartDrawer";
import { QuickView } from "@/components/store/QuickView";
import { products } from "@/lib/productsData";
import "./globals.css";

/* Sans for everything structural; the serif carries the accent half of
   each headline and the wordmark. Two faces, no more. */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://aetheria-atelier.netlify.app"),
  title: {
    default: "Aetheria Atelier — Sculpted Comfort. Timeless Forms.",
    template: "%s — Aetheria Atelier",
  },
  description:
 "A workshop of thirty-one makers outside Milan. One collection a year: bouclé seating, travertine tables, brushed brass lighting and book-matched walnut case goods.",
  keywords: [
 "luxury furniture",
 "bouclé sofa",
 "travertine table",
 "brass lighting",
 "walnut cabinet",
 "Milan atelier",
  ],
  openGraph: {
    title: "Aetheria Atelier — Sculpted Comfort. Timeless Forms.",
    description:
 "Furniture drawn once, built to be repaired rather than replaced. One collection a year, from a workshop outside Milan.",
    type: "website",
    locale: "en_US",
    siteName: "Aetheria Atelier",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aetheria Atelier",
    description: "Sculpted Comfort. Timeless Forms.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${instrumentSerif.variable}`}>
      <body className="bg-alabaster text-obsidian antialiased">
        <StoreProvider initialCatalogue={products}>
          <a
            href="#collection"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[300] focus:rounded-full focus:bg-obsidian focus:px-5 focus:py-3 focus:text-sm focus:text-white"
          >
            Skip to the collection
          </a>

          <CursorHalo />
          <GlassHeader />

          <main>{children}</main>

          <QuickView />
          <CartDrawer />
        </StoreProvider>
      </body>
    </html>
  );
}

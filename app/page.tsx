import { Hero } from "@/components/sections/Hero";
import { PinnedChapters } from "@/components/sections/PinnedChapters";
import { Collection } from "@/components/store/Collection";
import { Craftsmanship } from "@/components/sections/Craftsmanship";
import { EthosMarquee, Manifesto } from "@/components/sections/Manifesto";
import { Footer } from "@/components/sections/Footer";

/* ------------------------------------------------------------------ *
 * The single page.
 *
 * Editorial first — the room, the three chapters, then the store, the
 * materials, and the manifesto. Category links in the header jump
 * straight into the grid for anyone who arrived to buy.
 * ------------------------------------------------------------------ */

export default function Page() {
  return (
    <>
      <Hero />
      <EthosMarquee />
      <PinnedChapters />
      <Collection />
      <Craftsmanship />
      <Manifesto />
      <Footer />
    </>
  );
}

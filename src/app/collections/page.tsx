import type { Metadata } from "next";
import { CollectionBrowser } from "@/components/collections/CollectionBrowser";
import { PageHero } from "@/components/ui/PageHero";
import { collections } from "@/lib/data/collections";
import { brands } from "@/lib/data/brands";

export const metadata: Metadata = {
  title: "All Collections",
  description:
    "Browse Wall King's full catalogue of imported wallpapers — filter by brand, style, colour, texture and application, or search any design number.",
  alternates: { canonical: "/collections" },
};

export default function CollectionsPage() {
  return (
    <>
      <PageHero
        eyebrow={`${collections.length} collections · ${brands.length} brands`}
        crumbs={[{ label: "Collections" }]}
        titleLines={["The catalogue."]}
        lede="Everything we import, in one place. Filter by brand, style, colour, texture or application — or type a design number straight into the search box."
        art={{
          kind: "arabesque",
          palette: ["#0a0c10", "#252c37", "#12171f", "#39434f"],
          scale: 1.3,
        }}
        seed="collections-hero"
        compact
      />
      <CollectionBrowser />
    </>
  );
}

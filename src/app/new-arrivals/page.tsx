import type { Metadata } from "next";
import Link from "next/link";
import { RoomPhoto as WallpaperSwatch } from "@/components/art/RoomPhoto";
import { PageHero } from "@/components/ui/PageHero";
import { CollectionBrowser } from "@/components/collections/CollectionBrowser";
import { CollectionCard } from "@/components/collections/CollectionCard";
import { Container, CTA, Eyebrow, Pill } from "@/components/ui/primitives";
import { Reveal } from "@/components/motion/Reveal";
import { byNewest, daysSinceAdded, tagLabel } from "@/lib/data/collections";

export const metadata: Metadata = {
  title: "New Arrivals & Latest Collections",
  description:
    "The newest wallpaper collections at Wall King — fresh launches from Europe, Japan and Korea, updated every month.",
  alternates: { canonical: "/new-arrivals" },
};

export default function NewArrivalsPage() {
  const recent = byNewest.filter((c) => daysSinceAdded(c) <= 120);
  const lead = recent[0] ?? byNewest[0];
  const rest = recent.slice(1);

  return (
    <>
      <PageHero
        eyebrow="Updated monthly"
        crumbs={[{ label: "Collections", href: "/collections" }, { label: "New Arrivals" }]}
        titleLines={["Just landed."]}
        lede="New books arrive from our mills throughout the year. These are the ranges that have reached the Hyderabad warehouse most recently — with stock on the shelf, not on a boat."
        art={{
          kind: "botanical",
          palette: ["#080a0d", "#26303a", "#111820", "#3b4653"],
          scale: 1.2,
        }}
        seed="arrivals-hero"
        compact
      >
        <div className="flex flex-wrap gap-2">
          {(["new", "trending", "best-seller", "limited"] as const).map((t) => (
            <Pill key={t} tone={t === "limited" ? "warn" : t === "new" ? "accent" : "default"}>
              {tagLabel[t]}
            </Pill>
          ))}
        </div>
      </PageHero>

      {/* Lead arrival, given a spread of its own */}
      <section className="py-16 lg:py-20">
        <Container wide>
          <Reveal variant="clip">
            <div className="grid gap-10 border border-line lg:grid-cols-2">
              <Link
                href={`/collections/${lead.slug}`}
                className="group relative block aspect-[4/3] overflow-hidden lg:aspect-auto lg:min-h-[30rem]"
                aria-label={`View ${lead.name}`}
              >
                <WallpaperSwatch
                  spec={lead.colourways[0].art}
                  seed={`arrival-lead-${lead.slug}`}
                  priority
                  className="absolute inset-0 h-full w-full transition-transform duration-[1600ms] [transition-timing-function:var(--ease-cut)] group-hover:scale-105"
                />
                <span className="eyebrow absolute left-4 top-4 bg-accent px-2.5 py-1.5 text-[0.5625rem] text-void">
                  {tagLabel[lead.tags[0] ?? "new"]}
                </span>
                <span className="tnum absolute bottom-4 right-4 bg-void/92 px-2.5 py-1.5 text-[0.6875rem] text-ink backdrop-blur-sm">
                  {lead.colourways[0].designNo}
                </span>
              </Link>
              <div className="flex flex-col justify-center p-8 lg:p-14">
                <Eyebrow className="mb-6">Latest arrival</Eyebrow>
                <h2 className="display-xl text-ink">{lead.name}</h2>
                <p className="lede mt-6">{lead.summary}</p>
                <p className="mt-6 max-w-lg text-[0.9375rem] leading-relaxed text-ink-2">
                  {lead.story[0]}
                </p>
                <div className="mt-9 flex flex-wrap gap-3">
                  <CTA href={`/collections/${lead.slug}`} size="lg">
                    View the collection
                  </CTA>
                  <CTA href="/contact" tone="outline" size="lg">
                    Request the catalogue
                  </CTA>
                </div>
                <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-4 border-t border-line pt-6 text-[0.8125rem]">
                  <div>
                    <dt className="eyebrow text-ink-3">Colourways</dt>
                    <dd className="tnum mt-1.5 text-ink">{lead.colourways.length}</dd>
                  </div>
                  <div>
                    <dt className="eyebrow text-ink-3">Roll</dt>
                    <dd className="tnum mt-1.5 text-ink">
                      {lead.spec.rollWidthCm}cm × {lead.spec.rollLengthM}m
                    </dd>
                  </div>
                  <div>
                    <dt className="eyebrow text-ink-3">Added</dt>
                    <dd className="tnum mt-1.5 text-ink">
                      {daysSinceAdded(lead)} days ago
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      {rest.length > 0 && (
        <section className="pb-8">
          <Container wide>
            <Reveal>
              <h2 className="display-lg mb-12 text-ink">
                Also new this season
              </h2>
            </Reveal>
            <div className="grid grid-cols-2 gap-x-6 gap-y-14 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-8">
              {rest.map((c) => (
                <CollectionCard key={c.slug} collection={c} aspect="tall" />
              ))}
            </div>
          </Container>
        </section>
      )}

      <section className="mt-20 border-t border-line pt-4">
        <Container wide className="pb-6 pt-12">
          <Reveal>
            <Eyebrow className="mb-6">Everything else</Eyebrow>
            <h2 className="display-lg max-w-xl text-ink">
              The rest of the catalogue, by date added.
            </h2>
          </Reveal>
        </Container>
        <CollectionBrowser initial={byNewest} />
      </section>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/ui/PageHero";
import { RoomPhoto as WallpaperSwatch } from "@/components/art/RoomPhoto";
import { Reveal } from "@/components/motion/Reveal";
import { Parallax } from "@/components/motion/Parallax";
import { Container, CTA, Eyebrow, Pill } from "@/components/ui/primitives";
import { brands, brandsByCountry } from "@/lib/data/brands";
import { collectionsByBrand } from "@/lib/data/collections";

export const metadata: Metadata = {
  title: "Brand Portfolio — 25 International Wallpaper Brands",
  description:
    "Wall King imports from 25 leading wallpaper manufacturers across Germany, Italy, the Netherlands, Belgium, the USA, Japan and South Korea.",
  alternates: { canonical: "/brands" },
};

export default function BrandsPage() {
  return (
    <>
      <PageHero
        eyebrow={`${brands.length} manufacturers · 7 countries`}
        crumbs={[{ label: "Brands" }]}
        titleLines={["The houses", "we represent."]}
        lede="Direct relationships with the mills themselves. We buy from the manufacturer, hold the stock in Hyderabad, and stand behind every batch we sell."
        art={{
          kind: "damask",
          palette: ["#090b0e", "#2b3440", "#141a22", "#46525f"],
          scale: 1.1,
        }}
        seed="brands-hero"
      >
        <nav aria-label="Jump to country" className="flex flex-wrap gap-2">
          {brandsByCountry.map((g) => (
            <a
              key={g.country}
              href={`#${g.country.toLowerCase().replace(/\s+/g, "-")}`}
              className="eyebrow border border-line px-3 py-2 text-[0.5625rem] text-ink-2 transition-colors hover:border-accent hover:text-accent"
            >
              {g.country} · {g.brands.length}
            </a>
          ))}
        </nav>
      </PageHero>

      {brandsByCountry.map((group, gi) => (
        <section
          key={group.country}
          id={group.country.toLowerCase().replace(/\s+/g, "-")}
          className={gi % 2 === 1 ? "bg-deep" : ""}
        >
          <Container wide>
            <div className="border-t border-line py-20 lg:py-24">
              <Reveal>
                <div className="mb-14 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div className="max-w-2xl">
                    <Eyebrow className="mb-5">
                      {String(gi + 1).padStart(2, "0")} · {group.brands.length} brands
                    </Eyebrow>
                    <h2 className="display-xl text-ink">{group.country}</h2>
                    <p className="lede mt-5 max-w-lg">{group.note}</p>
                  </div>
                </div>
              </Reveal>

              <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
                {group.brands.map((b, i) => {
                  const ranges = collectionsByBrand(b.slug);
                  return (
                    <Reveal key={b.slug} delay={i * 60}>
                      <article id={b.slug} className="group scroll-mt-28">
                        <div className="relative aspect-[16/10] overflow-hidden border border-line">
                          <Parallax speed={0.07} cover className="absolute inset-0">
                            <WallpaperSwatch
                              spec={b.art}
                              seed={`brand-${b.slug}`}
                              className="h-full w-full transition-transform duration-[1600ms] [transition-timing-function:var(--ease-cut)] group-hover:scale-105"
                            />
                          </Parallax>
                        </div>

                        <div className="mt-5">
                          <div className="flex items-baseline justify-between gap-3">
                            <h3 className="font-display text-2xl text-ink">
                              {b.name}
                            </h3>
                            {ranges.length > 0 && (
                              <Pill tone="accent">
                                {ranges.length} range{ranges.length > 1 ? "s" : ""}
                              </Pill>
                            )}
                          </div>
                          <p className="eyebrow mt-3 text-accent">{b.signature}</p>
                          <p className="mt-3 text-[0.875rem] leading-relaxed text-ink-2">
                            {b.note}
                          </p>

                          {ranges.length > 0 && (
                            <ul className="mt-5 flex flex-wrap gap-1.5">
                              {ranges.map((r) => (
                                <li key={r.slug}>
                                  <Link
                                    href={`/collections/${r.slug}`}
                                    className="border border-line px-2.5 py-1.5 text-[0.75rem] text-ink-2 transition-colors hover:border-accent hover:text-accent"
                                  >
                                    {r.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </article>
                    </Reveal>
                  );
                })}
              </div>
            </div>
          </Container>
        </section>
      ))}

      <section className="border-t border-line py-24">
        <Container wide>
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <Eyebrow className="mb-6 justify-center">Not seeing a name?</Eyebrow>
              <h2 className="display-lg text-ink">
                We can usually source it.
              </h2>
              <p className="lede mt-5">
                Forty years of trade relationships across Europe and Asia means
                we can often bring in a book we do not stock. Tell us the brand
                and the reference.
              </p>
              <div className="mt-9 flex flex-wrap justify-center gap-3">
                <CTA href="/contact" size="lg">
                  Ask about a brand
                </CTA>
                <CTA href="/collections" tone="outline" size="lg">
                  Browse what we stock
                </CTA>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}

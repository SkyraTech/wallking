import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/ui/PageHero";
import { RoomPhoto as WallpaperSwatch } from "@/components/art/RoomPhoto";
import { Reveal } from "@/components/motion/Reveal";
import { Container, CTA, Eyebrow } from "@/components/ui/primitives";
import { postsByNewest, formatPostDate, categories } from "@/lib/data/posts";

export const metadata: Metadata = {
  title: "The Journal — Wallpaper Trends, Ideas & Specification",
  description:
    "Wallpaper trends, room-by-room ideas, specification guidance and care advice from Wall King's design and projects teams.",
  alternates: { canonical: "/journal" },
};

export default function JournalPage() {
  const [lead, ...rest] = postsByNewest;

  return (
    <>
      <PageHero
        eyebrow="Design centre"
        crumbs={[{ label: "Journal" }]}
        titleLines={["Forty years of", "opinions, written down."]}
        lede="Trends worth acting on, rooms worth studying, and the specification detail that decides whether a wall still looks right in year eight."
        art={{
          kind: "stripe",
          palette: ["#0a0c10", "#252c37", "#12171f", "#39434f"],
          scale: 1.5,
        }}
        seed="journal-hero"
        compact
      >
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <span
              key={c}
              className="eyebrow border border-line px-3 py-2 text-[0.5625rem] text-ink-2"
            >
              {c}
            </span>
          ))}
        </div>
      </PageHero>

      <Container wide className="py-16 lg:py-20">
        {/* Lead article */}
        <Reveal variant="clip">
          <Link href={`/journal/${lead.slug}`} className="group grid gap-10 border-b border-line pb-16 lg:grid-cols-[1.2fr_1fr] lg:items-center lg:gap-16">
            <div className="relative aspect-[16/10] overflow-hidden border border-line">
              <WallpaperSwatch
                spec={lead.art}
                seed={`journal-lead-${lead.slug}`}
                priority
                className="h-full w-full transition-transform duration-[1600ms] [transition-timing-function:var(--ease-cut)] group-hover:scale-105"
              />
              <span className="eyebrow absolute left-4 top-4 bg-void/92 px-2.5 py-1.5 text-ink backdrop-blur-sm">
                {lead.category}
              </span>
            </div>
            <div>
              <Eyebrow className="mb-5">Latest</Eyebrow>
              <h2 className="display-lg text-ink transition-colors duration-500 group-hover:text-accent">
                {lead.title}
              </h2>
              <p className="lede mt-5">{lead.dek}</p>
              <p className="eyebrow mt-7 text-ink-3">
                {formatPostDate(lead.date)} · {lead.readingMinutes} min read ·{" "}
                {lead.author}
              </p>
            </div>
          </Link>
        </Reveal>

        {/* The rest */}
        <div className="grid gap-x-8 gap-y-14 pt-16 md:grid-cols-2 lg:grid-cols-3">
          {rest.map((p, i) => (
            <Reveal key={p.slug} delay={(i % 3) * 80}>
              <article>
                <Link href={`/journal/${p.slug}`} className="group block">
                  <div className="relative aspect-[4/3] overflow-hidden border border-line">
                    <WallpaperSwatch
                      spec={p.art}
                      seed={`journal-${p.slug}`}
                      className="h-full w-full transition-transform duration-[1500ms] [transition-timing-function:var(--ease-cut)] group-hover:scale-[1.06]"
                    />
                  </div>
                  <p className="eyebrow mt-5 text-accent">{p.category}</p>
                  <h3 className="mt-3 font-display text-2xl leading-snug text-ink transition-colors duration-500 group-hover:text-accent">
                    {p.title}
                  </h3>
                  <p className="mt-3 line-clamp-3 text-[0.875rem] leading-relaxed text-ink-2">
                    {p.dek}
                  </p>
                  <p className="mt-4 text-[0.6875rem] tracking-[0.06em] text-ink-3">
                    {formatPostDate(p.date)} · {p.readingMinutes} min
                  </p>
                </Link>
              </article>
            </Reveal>
          ))}
        </div>
      </Container>

      <section className="border-t border-line bg-deep py-20">
        <Container wide>
          <Reveal>
            <div className="mx-auto max-w-xl text-center">
              <Eyebrow className="mb-6 justify-center">Stuck on a decision?</Eyebrow>
              <h2 className="display-lg text-ink">
                Ask someone who has seen it go wrong.
              </h2>
              <p className="lede mt-5">
                Our consultants have specified these papers into thousands of
                rooms. Bring the question — there is no charge for an opinion.
              </p>
              <div className="mt-9 flex flex-wrap justify-center gap-3">
                <CTA href="/contact" size="lg">
                  Ask a question
                </CTA>
                <CTA href="/showrooms" tone="outline" size="lg">
                  Visit a gallery
                </CTA>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}

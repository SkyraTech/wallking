import Link from "next/link";
import { RoomPhoto as WallpaperSwatch } from "@/components/art/RoomPhoto";
import { Reveal } from "@/components/motion/Reveal";
import { Container, CTA, Eyebrow } from "@/components/ui/primitives";
import { SectionBackdrop } from "@/components/ui/SectionBackdrop";
import { postsByNewest, formatPostDate } from "@/lib/data/posts";

export function JournalStrip() {
  const [lead, ...rest] = postsByNewest.slice(0, 4);

  return (
    <section className="relative overflow-hidden py-20 lg:py-28">
      <SectionBackdrop seed="journal-strip" strength="whisper" />
      <Container wide>
        <Reveal>
          <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <Eyebrow className="mb-4">The Journal</Eyebrow>
              <h2 className="display-lg text-ink">
                Insights, trend guides &amp; craft notes.
              </h2>
            </div>
            <CTA href="/journal" tone="outline" size="md">
              All articles →
            </CTA>
          </div>
        </Reveal>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
          <Reveal variant="clip">
            <Link href={`/journal/${lead.slug}`} className="group block rounded-2xl border border-line bg-panel/85 p-5 backdrop-blur-md transition-all duration-400 hover:border-accent/50 hover:bg-panel hover:shadow-lg">
              <div className="relative aspect-[16/9] overflow-hidden rounded-xl border border-line">
                <WallpaperSwatch
                  spec={lead.art}
                  seed={`journal-${lead.slug}`}
                  className="h-full w-full transition-transform duration-[1600ms] [transition-timing-function:var(--ease-cut)] group-hover:scale-105"
                />
                <span className="eyebrow absolute left-3 top-3 rounded-full border border-line bg-panel/90 px-2.5 py-1 text-ink backdrop-blur-md">
                  {lead.category}
                </span>
              </div>
              <h3 className="mt-5 font-display text-2xl leading-tight text-ink transition-colors duration-500 group-hover:text-accent">
                {lead.title}
              </h3>
              <p className="mt-2.5 max-w-xl text-[0.875rem] leading-relaxed text-ink-2">
                {lead.dek}
              </p>
              <p className="eyebrow mt-4 text-ink-3">
                {formatPostDate(lead.date)} · {lead.readingMinutes} min read
              </p>
            </Link>
          </Reveal>

          <div className="flex flex-col gap-4">
            {rest.map((p, i) => (
              <Reveal key={p.slug} delay={i * 80}>
                <Link
                  href={`/journal/${p.slug}`}
                  className="group flex gap-4 rounded-xl border border-line bg-panel/80 p-4 backdrop-blur-md transition-all duration-400 hover:border-accent/50 hover:bg-panel"
                >
                  <div className="hidden h-20 w-16 shrink-0 overflow-hidden rounded-lg border border-line sm:block">
                    <WallpaperSwatch
                      spec={p.art}
                      seed={`journal-${p.slug}`}
                      className="h-full w-full"
                      lit={false}
                    />
                  </div>
                  <div>
                    <p className="eyebrow text-accent">{p.category}</p>
                    <h3 className="mt-1.5 font-display text-lg leading-snug text-ink transition-colors duration-300 group-hover:text-accent">
                      {p.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-[0.75rem] leading-relaxed text-ink-2">
                      {p.dek}
                    </p>
                    <p className="mt-2 text-[0.625rem] tracking-[0.05em] text-ink-3">
                      {formatPostDate(p.date)} · {p.readingMinutes} min
                    </p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

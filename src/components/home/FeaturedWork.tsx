import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { SectionBackdrop } from "@/components/ui/SectionBackdrop";
import { Container, CTA, cx } from "@/components/ui/primitives";
import { featured, collections } from "@/lib/data/collections";
import { brands } from "@/lib/data/brands";
import { srcFor, blurFor } from "@/lib/data/imagery";

const brandOf = (slug: string) => brands.find((b) => b.slug === slug);

/**
 * Four featured ranges.
 *
 * Rebuilt from a staggered layout that opened a 2400px column of dead space
 * between cards. Now it is an honest asymmetric grid — two large, two small,
 * all photographic, nothing floating in a void.
 */
export function FeaturedWork() {
  // Pad from the catalogue if fewer than four carry the `featured` tag, so the
  // grid is never short a cell.
  const picks = [
    ...featured,
    ...collections.filter((c) => !featured.includes(c)),
  ].slice(0, 4);

  return (
    <section className="relative overflow-hidden py-24 lg:py-32">
      <SectionBackdrop seed="featured-work" strength="whisper" />

      <Container wide>
        <Reveal>
          <div className="mb-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="eyebrow mb-6 inline-flex items-center gap-2.5 rounded-full border border-line bg-panel/70 px-4 py-2 text-ink-2 backdrop-blur-md">
                <span aria-hidden className="block h-1.5 w-1.5 rounded-full bg-accent" />
                Featured collections
              </p>
              <h2 className="display-xl text-ink">
                Four rooms that <em className="italic text-accent">changed</em>{" "}
                when the wall did.
              </h2>
            </div>
            <p className="max-w-sm text-[0.9375rem] leading-relaxed text-ink-2">
              A cross-section of what we are specifying most this year — from a
              Japanese functional plain to an Italian flock that has been in
              production for a century.
            </p>
          </div>
        </Reveal>

        <div className="grid gap-5 lg:grid-cols-12 lg:gap-6">
          {picks.map((c, i) => {
            const brand = brandOf(c.brand);
            // 0 and 3 are the wide cells; 1 and 2 the narrow ones.
            const wide = i === 0 || i === 3;
            return (
              <Reveal
                key={c.slug}
                variant="scale"
                delay={i * 90}
                className={cx(wide ? "lg:col-span-7" : "lg:col-span-5")}
              >
                <Link
                  href={`/collections/${c.slug}`}
                  className="group block h-full overflow-hidden rounded-[var(--radius-card)] border border-line"
                >
                  <div
                    className={cx(
                      "relative",
                      wide ? "aspect-[16/10]" : "aspect-[4/3.4]",
                    )}
                  >
                    <Image
                      src={srcFor(c.slug, wide ? 1400 : 1000)}
                      alt={`${c.name} in situ`}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      placeholder="blur"
                      blurDataURL={blurFor(c.slug)}
                      className="object-cover transition-transform duration-[1500ms] [transition-timing-function:var(--ease-out)] group-hover:scale-[1.05]"
                    />
                    {/* Only as much scrim as the caption needs. */}
                    <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 p-6 lg:p-8">
                      <div>
                        <p className="eyebrow text-white/70">
                          {brand?.name} · {brand?.country}
                        </p>
                        <h3
                          className={cx(
                            "font-display mt-2 text-white",
                            wide ? "text-4xl lg:text-5xl" : "text-3xl",
                          )}
                        >
                          {c.name}
                        </h3>
                        <p className="mt-2 max-w-md text-[0.875rem] leading-relaxed text-white/75">
                          {c.summary}
                        </p>
                      </div>
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/40 text-white transition-colors duration-500 group-hover:border-white group-hover:bg-white group-hover:text-black">
                        <ArrowUpRight className="h-4 w-4" strokeWidth={1.6} />
                      </span>
                    </div>

                    <div className="absolute left-6 top-6 flex gap-1.5 lg:left-8 lg:top-8">
                      {c.colourways.slice(0, 4).map((cw) => (
                        <span
                          key={cw.designNo}
                          title={`${cw.name} · ${cw.designNo}`}
                          className="h-6 w-6 rounded-full border border-white/60"
                          style={{ background: cw.art.palette[1] }}
                        />
                      ))}
                    </div>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>

        <Reveal>
          <div className="mt-14 flex justify-center">
            <CTA href="/collections" size="lg" tone="outline">
              Browse the full catalogue
            </CTA>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

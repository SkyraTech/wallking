import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { RoomPhoto as WallpaperSwatch } from "@/components/art/RoomPhoto";
import { Parallax } from "@/components/motion/Parallax";
import { CountUp, Reveal } from "@/components/motion/Reveal";
import { Container, CTA, Eyebrow } from "@/components/ui/primitives";
import { strengths } from "@/lib/site";

export const metadata: Metadata = {
  title: "About — Four Decades of Wall King",
  description:
    "Established in 1984 by Mr. Tarun Parekh, Wall King is a family-owned business and India's largest importer and distributor of international wallpapers.",
  alternates: { canonical: "/about" },
};

const specialisms = [
  "Project Wallpapers",
  "Residential & Domestic",
  "Handmade Wallpapers",
  "Luxury Designer Ranges",
  "Commercial & Hospitality",
  "Custom Wall Murals",
  "Textured & Specialty Coverings",
];

const timeline = [
  {
    year: "1984",
    title: "A shop in Abids",
    body: "Mr. Tarun Parekh opens Wall King in Jagdish Market, Abids, at a time when imported wallpaper in India was a curiosity rather than a category.",
  },
  {
    year: "1990s",
    title: "Building the import channel",
    body: "Direct relationships with European mills replace agents and intermediaries. Mr. Chandresh Parekh joins his brother, and the business begins supplying dealers beyond Hyderabad.",
  },
  {
    year: "2000s",
    title: "A national network",
    body: "The distribution network extends across India. Project supply — hotels, corporate offices, healthcare — becomes a distinct arm of the business alongside retail.",
  },
  {
    year: "2010s",
    title: "Asia joins the portfolio",
    body: "Japanese and Korean manufacturers are added to the European book, bringing functional substrates and a faster design cycle to the Indian market.",
  },
  {
    year: "Today",
    title: "Twenty-five brands, ninety cities",
    body: "Three Hyderabad galleries, a nationwide dealer network and the largest imported wallpaper inventory in the country — still run by the same family.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="Established 1984 · Family owned"
        crumbs={[{ label: "About" }]}
        titleLines={["We have been", "choosing walls", "for forty years."]}
        lede="Wall King began as a single shop in Abids and became India's largest importer and distributor of international wallpapers — without ever becoming a company that buys by the container and hopes."
        art={{
          kind: "arabesque",
          palette: ["#0a0c10", "#252c37", "#12171f", "#39434f"],
          scale: 1.3,
        }}
        seed="about-hero"
      />

      {/* The narrative */}
      <section className="py-16 lg:py-24">
        <Container wide>
          <div className="grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
            <div>
              <Reveal>
                <div className="prose-body max-w-2xl text-[0.9375rem]">
                  <p>
                    Established in 1984, Wall King is a proud family-owned
                    company and one of India&rsquo;s pioneering names in the
                    wallpaper industry. Over four decades we have been at the
                    forefront of introducing premium international wallpapers to
                    the Indian market, setting benchmarks in quality, innovation
                    and design.
                  </p>
                  <p>
                    Today we are recognised as India&rsquo;s largest importer and
                    distributor of leading wallpaper brands from across the
                    world. That global network is what lets us bring the latest
                    international trends, exclusive collections and premium wall
                    décor solutions to customers throughout India — usually
                    before anyone else does.
                  </p>
                  <p>
                    <strong>
                      Every Wall King collection is personally handpicked.
                    </strong>{" "}
                    Not sampled from a PDF, not chosen from a container list —
                    seen, handled and argued over. Our passion for excellence
                    drives us to keep sourcing from the finest manufacturers
                    worldwide, which is how we have ended up with one of the most
                    diverse wallpaper portfolios in the country.
                  </p>
                </div>
              </Reveal>

              <Reveal>
                <div className="mt-10">
                  <Eyebrow className="mb-4">What we specialise in</Eyebrow>
                  <ul className="grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
                    {specialisms.map((s) => (
                      <li
                        key={s}
                        className="flex items-baseline gap-2.5 border-b border-line-faint pb-2.5 text-[0.875rem] text-ink"
                      >
                        <span aria-hidden className="text-accent">
                          —
                        </span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            </div>

            <div className="lg:sticky lg:top-24 lg:self-start">
              <Parallax speed={0.05}>
                <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-line shadow-md">
                  <WallpaperSwatch
                    spec={{
                      kind: "damask",
                      palette: ["#08090c", "#2e3846", "#12181f", "#5b6a7a"],
                      scale: 1.05,
                    }}
                    seed="about-portrait"
                    className="h-full w-full"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-6 pt-20">
                    <p className="on-media font-display text-2xl">
                      Since 1984
                    </p>
                    <p className="on-media mt-2 text-[0.8125rem] leading-relaxed opacity-85">
                      Two brothers, one showroom in Abids, and a conviction that
                      Indian interiors deserved what Europe was putting on its
                      walls.
                    </p>
                  </div>
                </div>
              </Parallax>

              <dl className="mt-6 grid grid-cols-2 gap-3">
                {[
                  { to: 40, suffix: "+", label: "Years" },
                  { to: 25, suffix: "+", label: "Brands" },
                  { to: 90, suffix: "+", label: "Cities" },
                  { to: 3, suffix: "", label: "Showrooms" },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl border border-line bg-panel/85 p-5 backdrop-blur-md">
                    <dt className="font-display text-3xl text-ink">
                      <CountUp to={s.to} suffix={s.suffix} />
                    </dt>
                    <dd className="eyebrow mt-1 text-ink-3">{s.label}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </Container>
      </section>

      {/* Timeline */}
      <section className="border-t border-line bg-deep/50 py-16 lg:py-24">
        <Container wide>
          <Reveal>
            <div className="mb-12 max-w-2xl">
              <Eyebrow className="mb-4">The long version</Eyebrow>
              <h2 className="display-xl text-ink">Four decades, briefly.</h2>
            </div>
          </Reveal>

          <ol className="grid gap-4">
            {timeline.map((t, i) => (
              <Reveal key={t.year} delay={i * 60}>
                <li className="grid gap-4 rounded-2xl border border-line bg-panel/80 p-6 backdrop-blur-md md:grid-cols-[8rem_1fr] md:items-start">
                  <p className="font-display text-3xl text-accent">{t.year}</p>
                  <div>
                    <h3 className="font-display text-xl text-ink">{t.title}</h3>
                    <p className="mt-2 text-[0.875rem] leading-relaxed text-ink-2">
                      {t.body}
                    </p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        </Container>
      </section>

      {/* Strengths */}
      <section className="py-16 lg:py-24">
        <Container wide>
          <Reveal>
            <div className="mb-10 max-w-2xl">
              <Eyebrow className="mb-4">Why it matters</Eyebrow>
              <h2 className="display-xl text-ink">
                What forty years actually buys you.
              </h2>
            </div>
          </Reveal>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {strengths.map((s, i) => (
              <Reveal key={s.title} delay={i * 50}>
                <div className="flex h-full flex-col justify-between rounded-2xl border border-line bg-panel/80 p-6 backdrop-blur-md transition-colors hover:border-accent/50 hover:bg-panel">
                  <div>
                    <p className="eyebrow tnum mb-3 text-accent">
                      {String(i + 1).padStart(2, "0")}
                    </p>
                    <h3 className="font-display text-xl text-ink">{s.title}</h3>
                    <p className="mt-2.5 text-[0.8125rem] leading-relaxed text-ink-2">
                      {s.body}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <div className="mt-12 flex flex-wrap gap-3">
              <CTA href="/showrooms" size="md">
                Visit a showroom
              </CTA>
              <CTA href="/brands" tone="outline" size="md">
                See the brand portfolio
              </CTA>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}

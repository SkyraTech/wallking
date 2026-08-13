import type { Metadata } from "next";
import { MapPin, Clock, Phone, ArrowUpRight } from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";
import { RoomPhoto as WallpaperSwatch } from "@/components/art/RoomPhoto";
import { Parallax } from "@/components/motion/Parallax";
import { Reveal } from "@/components/motion/Reveal";
import { Container, CTA, Eyebrow, cx } from "@/components/ui/primitives";
import { showrooms, mapsLink, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Showrooms in Hyderabad — Abids, Secunderabad & Jubilee Hills",
  description:
    "Visit Wall King's three Hyderabad showrooms: the Abids head office, the Secunderabad branch, and the Jubilee Hills flagship Experience Centre.",
  alternates: { canonical: "/showrooms" },
};

const swatchFor = [
  { kind: "ashlar", palette: ["#0a0c10", "#252c37", "#12171f", "#39434f"] },
  { kind: "herringbone", palette: ["#090b0f", "#232a34", "#11161d", "#333c48"] },
  { kind: "moire", palette: ["#080a0e", "#222934", "#10151c", "#37404c"] },
] as const;

const visitNotes = [
  {
    title: "Bring a photograph",
    body: "A picture of the room, taken in daylight, tells us more in ten seconds than a description does in ten minutes. Include the flooring and any joinery.",
  },
  {
    title: "Bring a measurement",
    body: "Wall width and ceiling height are enough. We will tell you the roll count before you leave, and you will know the real cost rather than a per-roll price.",
  },
  {
    title: "Ask for full drops",
    body: "A sample book shows you a 20cm square. Ask to see the paper at full height — the scale of a repeat is impossible to judge any other way.",
  },
  {
    title: "Take samples home",
    body: "Colour changes completely between showroom lighting and your own. We are happy for you to borrow samples and live with them for a few days.",
  },
];

export default function ShowroomsPage() {
  return (
    <>
      <PageHero
        eyebrow="Three galleries · Hyderabad"
        crumbs={[{ label: "Showrooms" }]}
        titleLines={["Come and see", "it properly."]}
        lede="A 5cm swatch tells you the colour and nothing else. Our galleries hold current books at full drop, with consultants who have been specifying these papers for years."
        art={{
          kind: "arabesque",
          palette: ["#0a0c10", "#252c37", "#12171f", "#39434f"],
          scale: 1.4,
        }}
        seed="showrooms-hero"
      >
        <div className="flex flex-wrap gap-3">
          <CTA href="/contact" size="lg">
            Book a consultation
          </CTA>
          <CTA href={`tel:${site.primaryPhone}`} tone="outline" size="lg" external arrow={false}>
            Call {site.primaryPhoneDisplay}
          </CTA>
        </div>
      </PageHero>

      {showrooms.map((s, i) => (
        <section
          key={s.id}
          id={s.id}
          className={cx("scroll-mt-24 border-t border-line", i % 2 === 1 && "bg-deep")}
        >
          <Container wide>
            <div
              className={cx(
                "grid items-center gap-12 py-20 lg:grid-cols-2 lg:gap-20 lg:py-28",
              )}
            >
              <Reveal
                variant="clip"
                className={cx(i % 2 === 1 && "lg:order-2")}
              >
                <div className="relative aspect-[4/3] overflow-hidden border border-line">
                  <Parallax speed={0.1} cover className="absolute inset-0">
                    <WallpaperSwatch
                      spec={{
                        kind: swatchFor[i].kind,
                        palette: swatchFor[i].palette as unknown as [string, string, string, string],
                        scale: 1.2,
                      }}
                      seed={`showroom-${s.id}`}
                      className="h-full w-full"
                    />
                  </Parallax>
                  {s.flagship && (
                    <span className="eyebrow absolute left-5 top-5 bg-accent px-3 py-2 text-void">
                      Flagship Experience Centre
                    </span>
                  )}
                </div>
              </Reveal>

              <Reveal delay={120}>
                <div>
                  <Eyebrow className="mb-5">{s.role}</Eyebrow>
                  <h2 className="display-xl text-ink">{s.name}</h2>
                  <p className="lede mt-6 max-w-lg">{s.blurb}</p>

                  <dl className="mt-9 space-y-5 border-t border-line pt-7">
                    <div className="flex gap-4">
                      <dt className="shrink-0">
                        <span className="sr-only">Address</span>
                        <MapPin className="h-4 w-4 text-accent" strokeWidth={1.5} />
                      </dt>
                      <dd className="text-[0.9375rem] leading-relaxed text-ink">
                        {s.lines.map((l) => (
                          <span key={l} className="block">
                            {l}
                          </span>
                        ))}
                        <span className="block">
                          {s.city} — {s.pin}
                        </span>
                      </dd>
                    </div>
                    <div className="flex gap-4">
                      <dt className="shrink-0">
                        <span className="sr-only">Opening hours</span>
                        <Clock className="h-4 w-4 text-accent" strokeWidth={1.5} />
                      </dt>
                      <dd className="text-[0.9375rem] text-ink">{s.hours}</dd>
                    </div>
                    <div className="flex gap-4">
                      <dt className="shrink-0">
                        <span className="sr-only">Telephone</span>
                        <Phone className="h-4 w-4 text-accent" strokeWidth={1.5} />
                      </dt>
                      <dd className="flex flex-wrap gap-x-5 gap-y-1 text-[0.9375rem] text-ink">
                        {s.phones.map((p) => (
                          <a
                            key={p}
                            href={`tel:${p.replace(/\s/g, "")}`}
                            className="link-draw hover:text-accent"
                          >
                            {p}
                          </a>
                        ))}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-9 flex flex-wrap gap-3">
                    <CTA href={mapsLink(s.mapQuery)} external arrow={false}>
                      Directions
                      <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.6} />
                    </CTA>
                    <CTA href="/contact" tone="outline">
                      Book a visit
                    </CTA>
                  </div>
                </div>
              </Reveal>
            </div>

            {/* Embedded map — lazy so it never blocks the page */}
            <div className="pb-20 lg:pb-28">
              <div className="aspect-[21/9] w-full overflow-hidden border border-line bg-deep">
                <iframe
                  title={`Map — Wall King ${s.name}`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-full w-full grayscale-[35%] transition-[filter] duration-700 hover:grayscale-0"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(s.mapQuery)}&output=embed`}
                />
              </div>
            </div>
          </Container>
        </section>
      ))}

      <section className="border-t border-line py-24 lg:py-32">
        <Container wide>
          <Reveal>
            <div className="mb-14 max-w-2xl">
              <Eyebrow className="mb-6">Making the most of a visit</Eyebrow>
              <h2 className="display-xl text-ink">
                Four things to bring with you.
              </h2>
            </div>
          </Reveal>

          <div className="grid gap-px border border-line bg-line sm:grid-cols-2 xl:grid-cols-4">
            {visitNotes.map((n, i) => (
              <Reveal key={n.title} delay={i * 70}>
                <div className="h-full bg-void p-8">
                  <p className="eyebrow tnum mb-5 text-accent">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3 className="font-display text-xl text-ink">{n.title}</h3>
                  <p className="mt-3 text-[0.875rem] leading-relaxed text-ink-2">
                    {n.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}

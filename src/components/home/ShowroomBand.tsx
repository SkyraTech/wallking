import { MapPin, Clock, Phone } from "lucide-react";
import { RoomPhoto as WallpaperSwatch } from "@/components/art/RoomPhoto";
import { Parallax } from "@/components/motion/Parallax";
import { Reveal } from "@/components/motion/Reveal";
import { Container, CTA, Eyebrow, cx } from "@/components/ui/primitives";
import { showrooms, mapsLink } from "@/lib/site";

export function ShowroomBand() {
  return (
    <section className="relative overflow-hidden">
      {/* Full-bleed parallax ground, deliberately over-scaled so it never
          reveals an edge as it travels. */}
      <div className="absolute inset-0 -z-10">
        <Parallax speed={0.16} cover className="absolute inset-0">
          <WallpaperSwatch
            spec={{
              kind: "arabesque",
              palette: ["#080a0d", "#242c38", "#101620", "#3a4552"] as [
                string,
                string,
                string,
                string,
              ],
              scale: 1.4,
            }}
            seed="showroom-band"
            className="h-full w-full"
            lit={false}
          />
        </Parallax>
        <div className="absolute inset-0 bg-void/50" />
      </div>

      <Container wide className="relative py-20 lg:py-28">
        <Reveal>
          <div className="max-w-3xl">
            <Eyebrow className="mb-4" tone="accent">
              Three galleries · Hyderabad
            </Eyebrow>
            <h2 className="display-xl text-ink">
              Some things have to be
              <br />
              seen at full drop.
            </h2>
            <p className="lede mt-4 max-w-xl text-ink-2">
              A 5cm sample tells you the colour. A full drop tells you the
              scale, the sheen and how it behaves in the light. All three of our
              Hyderabad showrooms hold current books, and the Jubilee Hills
              Experience Centre holds nearly everything.
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {showrooms.map((s, i) => (
            <Reveal key={s.id} delay={i * 90}>
              <div
                className={cx(
                  "relative flex h-full flex-col justify-between rounded-2xl border border-line bg-panel/90 p-6 backdrop-blur-md transition-all duration-400 hover:border-accent/60 hover:bg-panel hover:shadow-lg",
                  s.flagship && "border-accent/40 shadow-md",
                )}
              >
                <div>
                  {s.flagship && (
                    <span className="eyebrow absolute right-5 top-6 rounded-full border border-accent/40 bg-accent-soft px-2.5 py-1 text-accent">
                      Flagship
                    </span>
                  )}
                  <p className="eyebrow text-ink-3">{s.role}</p>
                  <h3 className="mt-2.5 font-display text-2xl text-ink">
                    {s.name}
                  </h3>
                  <p className="mt-3 text-[0.8125rem] leading-relaxed text-ink-2">
                    {s.blurb}
                  </p>

                  <dl className="mt-6 space-y-2.5 text-[0.8125rem] text-ink-2">
                    <div className="flex gap-2.5">
                      <dt className="sr-only">Address</dt>
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-3" strokeWidth={1.4} />
                      <dd>
                        {s.lines.join(", ")}
                        <br />
                        {s.city} {s.pin}
                      </dd>
                    </div>
                    <div className="flex gap-2.5">
                      <dt className="sr-only">Hours</dt>
                      <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-3" strokeWidth={1.4} />
                      <dd>{s.hours}</dd>
                    </div>
                    <div className="flex gap-2.5">
                      <dt className="sr-only">Telephone</dt>
                      <Phone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-3" strokeWidth={1.4} />
                      <dd className="flex flex-wrap gap-x-3">
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
                </div>

                <a
                  href={mapsLink(s.mapQuery)}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="eyebrow mt-6 inline-flex items-center gap-2 text-accent transition-opacity hover:opacity-70"
                >
                  Open in Maps →
                </a>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="mt-10 flex flex-wrap gap-3">
            <CTA href="/showrooms" tone="solid" size="md">
              Plan a visit
            </CTA>
            <CTA href="/contact" tone="outline" size="md">
              Book a consultation
            </CTA>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

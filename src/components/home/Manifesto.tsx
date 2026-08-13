"use client";

import { Parallax } from "@/components/motion/Parallax";
import { CountUp, Reveal, RevealLines } from "@/components/motion/Reveal";
import { RoomPhoto as WallpaperSwatch } from "@/components/art/RoomPhoto";
import { Container, CTA, Eyebrow } from "@/components/ui/primitives";
import { strengths } from "@/lib/site";

const counters = [
  { to: 40, suffix: "+", label: "Years in the trade", note: "Founded 1984" },
  { to: 25, suffix: "+", label: "International brands", note: "Seven countries" },
  { to: 90, suffix: "+", label: "Cities served", note: "Nationwide network" },
  { to: 3, suffix: "", label: "Hyderabad galleries", note: "Abids · Secunderabad · Jubilee Hills" },
];

export function Manifesto() {
  return (
    <section className="relative overflow-hidden py-28 lg:py-40">
      <Container wide>
        <div className="grid gap-16 lg:grid-cols-[1fr_minmax(0,26rem)] lg:gap-24">
          <div>
            <Reveal>
              <Eyebrow className="mb-8">Why Wall King</Eyebrow>
            </Reveal>

            <RevealLines
              className="display-xl max-w-4xl text-ink"
              stagger={95}
              lines={[
                "We do not sell",
                <span key="2">
                  wallpaper. We{" "}
                  <em className="not-italic text-accent">choose</em> it.
                </span>,
              ]}
            />

            <Reveal delay={280}>
              <p className="lede mt-8 max-w-2xl">
                Every collection in this catalogue was seen in person, at the
                mill, by someone whose surname is on the door. That is the
                whole business model, and it has not changed since 1984.
              </p>
            </Reveal>

            <div className="mt-16 grid gap-x-12 gap-y-10 sm:grid-cols-2">
              {strengths.map((s, i) => (
                <Reveal key={s.title} delay={i * 70}>
                  <div className="border-t border-line pt-5">
                    <p className="eyebrow tnum mb-4 text-accent">
                      {String(i + 1).padStart(2, "0")}
                    </p>
                    <h3 className="font-display text-xl text-ink">{s.title}</h3>
                    <p className="mt-2.5 text-[0.875rem] leading-relaxed text-ink-2">
                      {s.body}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={200}>
              <div className="mt-14">
                <CTA href="/about" tone="outline" size="lg">
                  Read our story
                </CTA>
              </div>
            </Reveal>
          </div>

          {/* counter column — sticky so the numbers hold while the list scrolls */}
          <div className="lg:sticky lg:top-32 lg:self-start">
            <Parallax speed={0.06} className="relative">
              <div className="relative aspect-[3/4] overflow-hidden border border-line">
                <WallpaperSwatch
                  spec={{
                    kind: "damask",
                    palette: ["#090b0f", "#28303b", "#131922", "#3d4753"],
                    scale: 1.1,
                  }}
                  seed="manifesto-panel"
                  className="h-full w-full"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-6 pt-20">
                  <p className="on-media font-display text-lg">
                    Zambaiti Parati · Palazzo
                  </p>
                  <p className="on-media mt-1 text-[0.75rem] opacity-80">
                    Bergamo, Italy — a Wall King partner
                  </p>
                </div>
              </div>
            </Parallax>

            <dl className="mt-10 grid grid-cols-2 gap-4">
              {counters.map((c) => (
                <div key={c.label} className="rounded-xl border border-line bg-panel/90 p-5 backdrop-blur-md">
                  <dt className="font-display text-4xl text-ink">
                    <CountUp to={c.to} suffix={c.suffix} />
                  </dt>
                  <dd className="mt-2">
                    <span className="block text-[0.75rem] font-medium text-ink">
                      {c.label}
                    </span>
                    <span className="mt-0.5 block text-[0.6875rem] leading-snug text-ink-3">
                      {c.note}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Container>
    </section>
  );
}

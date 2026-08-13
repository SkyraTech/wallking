"use client";

import Image from "next/image";
import { ArrowDown } from "lucide-react";
import { useParallax } from "@/components/motion/Parallax";
import { Reveal, RevealLines } from "@/components/motion/Reveal";
import { Container, CTA } from "@/components/ui/primitives";
import { BlobRevealCTA } from "@/components/ui/TextRevealBlur";
import { journeySrc, journeyBlur } from "@/lib/data/imagery";

/**
 * The first room.
 *
 * Full-bleed photography with the headline set over it, and a slow push-in as
 * you scroll away — which hands off directly into the ScenicJourney below, so
 * the whole top of the page reads as one continuous walk through the house
 * rather than a hero followed by sections.
 */
/* Deliberately NOT the room the journey opens on — the hero and scene 01
   sitting back to back on the same photograph reads as a loading bug. */
const OPENING_ROOM = "photo-1618221195710-dd6b41faaea6";

export function Hero() {
  const mediaRef = useParallax<HTMLDivElement>({
    speed: 0.08,
    zoom: 0.02,
    cover: true,
    max: 180,
  });

  return (
    <section className="relative isolate -mt-16 flex min-h-[92svh] flex-col justify-end overflow-hidden pb-6 pt-24 lg:-mt-20 lg:pt-28">
      <div ref={mediaRef} className="absolute inset-0 -z-10">
        <Image
          src={journeySrc(OPENING_ROOM, 2400)}
          alt="A Wall King interior — wallpapered living room"
          fill
          priority
          sizes="100vw"
          placeholder="blur"
          blurDataURL={journeyBlur(OPENING_ROOM)}
          className="object-cover"
        />
      </div>

      {/* Gentle soft scrim — allows full background photo brightness & transparency */}
      <div className="absolute inset-0 -z-10 bg-void/10" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-gradient-to-t from-void via-void/30 to-transparent" />

      <Container wide className="relative pb-8 lg:pb-10">
        <Reveal>
          <p className="eyebrow mb-4 inline-flex items-center gap-1.5 rounded-full border border-line bg-panel/85 px-3 py-1 text-[0.5625rem] text-ink-2 backdrop-blur-md">
            <span className="rec-dot block h-1.5 w-1.5 rounded-full bg-accent" />
            Est. 1984 — India&rsquo;s largest wallpaper importer
          </p>
        </Reveal>

        <RevealLines
          as="h1"
          className="display-hero max-w-[13ch] text-ink"
          stagger={110}
          lines={[
            "Architecture begins",
            <span key="2">
              at the <em className="italic text-accent">surface.</em>
            </span>,
          ]}
        />

        <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <Reveal delay={360}>
            <p className="lede max-w-md text-ink-2">
              Twenty-five international houses. Ninety-plus cities. Three
              Hyderabad galleries. Four decades spent deciding what deserves to
              go on an Indian wall — and what does not.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <BlobRevealCTA href="/collections" className="h-11 min-w-56" />
              <CTA href="/showrooms" tone="outline" size="md">
                Visit a gallery →
              </CTA>
            </div>
          </Reveal>

          <Reveal delay={520}>
            <dl className="flex flex-wrap gap-x-8 gap-y-3">
              {[
                ["25+", "Brands"],
                ["90+", "Cities"],
                ["03", "Showrooms"],
                ["40+", "Years"],
              ].map(([v, k]) => (
                <div key={k}>
                  <dt className="font-display text-2xl lg:text-3xl text-ink">{v}</dt>
                  <dd className="eyebrow mt-1 text-[0.5625rem] text-ink-3">{k}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        <Reveal delay={680}>
          <p className="eyebrow mt-14 inline-flex items-center gap-2.5 text-ink-3">
            Scroll — five rooms ahead
            <ArrowDown className="h-3.5 w-3.5 animate-bounce" strokeWidth={1.5} />
          </p>
        </Reveal>
      </Container>
    </section>
  );
}

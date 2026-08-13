"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { srcFor, blurFor } from "@/lib/data/imagery";
import { clamp, scrollEngine } from "@/lib/scroll-engine";
import { Reveal } from "@/components/motion/Reveal";
import { Container, CTA, Eyebrow, Pill } from "@/components/ui/primitives";
import { byNewest, daysSinceAdded, tagLabel } from "@/lib/data/collections";
import { brands } from "@/lib/data/brands";

const arrivals = byNewest.slice(0, 8);
const brandName = (slug: string) => brands.find((b) => b.slug === slug)?.name ?? slug;

/**
 * Vertical scroll drives a horizontal track.
 *
 * The section is given a pixel height equal to `viewport + horizontal travel`,
 * so one pixel of page scroll moves the track exactly one pixel sideways —
 * the movement feels connected to the wheel rather than multiplied by an
 * arbitrary factor.
 *
 * Only mounted at lg and up. Below that the same cards render as an ordinary
 * swipeable rail, because commandeering touch scroll on a phone is hostile.
 */
function PinnedRail() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    const sticky = stickyRef.current;
    if (!section || !track || !sticky) return;

    const geom = { top: 0, travel: 0 };

    const measure = () => {
      // Below `lg` this whole section is display:none. Measuring it then
      // yields zero widths, and setting a height would reserve a full empty
      // viewport on every phone. Bail out and clear anything left over.
      if (section.offsetParent === null || sticky.clientWidth === 0) {
        geom.travel = 0;
        section.style.height = "";
        return;
      }
      // Travel = how far the track must move to bring its right edge in.
      const travel = Math.max(0, track.scrollWidth - sticky.clientWidth);
      geom.travel = travel;
      section.style.height = `${window.innerHeight + travel}px`;
      geom.top = section.getBoundingClientRect().top + window.scrollY;
    };

    const render = (s: { smooth: number }) => {
      if (geom.travel <= 0) {
        track.style.transform = "";
        return;
      }
      const p = clamp((s.smooth - geom.top) / geom.travel, 0, 1);
      track.style.transform = `translate3d(${(-p * geom.travel).toFixed(2)}px, 0, 0)`;
      if (fillRef.current) {
        fillRef.current.style.transform = `scaleX(${p.toFixed(4)})`;
      }
    };

    track.style.willChange = "transform";

    const offMeasure = scrollEngine.onMeasure(measure);
    const offFrame = scrollEngine.onFrame(render);
    const ro = new ResizeObserver(() => {
      measure();
      scrollEngine.kick();
    });
    ro.observe(track);

    return () => {
      offMeasure();
      offFrame();
      ro.disconnect();
      section.style.height = "";
      track.style.transform = "";
      track.style.willChange = "";
    };
  }, []);

  return (
    <div ref={sectionRef} className="relative hidden lg:block">
      <div
        ref={stickyRef}
        className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden"
      >
        <Container wide className="mb-10">
          <div className="flex items-end justify-between gap-8">
            <div>
              <Eyebrow className="mb-5">New Arrivals · Updated monthly</Eyebrow>
              <h2 className="display-lg max-w-xl text-ink">
                Landed this season
              </h2>
            </div>
            <div className="flex items-center gap-8">
              <div className="hidden w-48 xl:block">
                <span className="block h-px w-full bg-line">
                  <span
                    ref={fillRef}
                    className="block h-px w-full origin-left scale-x-0 bg-accent"
                  />
                </span>
                <span className="eyebrow mt-3 block text-ink-3">
                  Scroll to browse
                </span>
              </div>
              <CTA href="/new-arrivals" tone="outline">
                View all
              </CTA>
            </div>
          </div>
        </Container>

        {/* `rail-viewport` degrades to a horizontal scroller when JS is
            absent — without it the untranslated track would be clipped and
            the later cards unreachable. */}
        <div className="rail-viewport w-full overflow-hidden">
          <div ref={trackRef} className="flex gap-6 pl-12 pr-[12vw]">
            {arrivals.map((c, i) => (
              <RailCard key={c.slug} c={c} index={i} />
            ))}
            <ClosingCard />
          </div>
        </div>
      </div>
    </div>
  );
}

function RailCard({
  c,
  index,
}: {
  c: (typeof arrivals)[number];
  index: number;
}) {
  const days = daysSinceAdded(c);
  return (
    <Link
      href={`/collections/${c.slug}`}
      className="group relative w-[clamp(18rem,23vw,24rem)] shrink-0"
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-[var(--radius-card)] border border-line bg-deep">
        <Image
          src={srcFor(c.slug, 900)}
          alt={`${c.name} in situ`}
          fill
          sizes="(max-width: 1024px) 80vw, 24rem"
          placeholder="blur"
          blurDataURL={blurFor(c.slug)}
          className="object-cover transition-transform duration-[1600ms] [transition-timing-function:var(--ease-out)] group-hover:scale-[1.08]"
        />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />
        <span className="eyebrow absolute left-3 top-3 rounded-full bg-panel/85 px-2.5 py-1.5 text-[0.5625rem] text-ink backdrop-blur-md">
          {c.tags[0] ? tagLabel[c.tags[0]] : `${days} days ago`}
        </span>
        <span className="tnum absolute right-3 top-3 font-display text-2xl text-white/80">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>
      <div className="flex items-baseline justify-between gap-4 pt-4">
        <h3 className="font-display text-2xl text-ink transition-colors duration-500 group-hover:text-accent">
          {c.name}
        </h3>
        <span className="text-[0.6875rem] tracking-[0.05em] text-ink-3">
          {brandName(c.brand)}
        </span>
      </div>
      <p className="mt-2 line-clamp-2 text-[0.8125rem] leading-relaxed text-ink-2">
        {c.summary}
      </p>
    </Link>
  );
}

function ClosingCard() {
  return (
    <div className="flex w-[clamp(18rem,23vw,24rem)] shrink-0 flex-col justify-center border border-dashed border-line-2 p-10">
      <p className="display-md text-ink">Something new every month.</p>
      <p className="mt-4 text-[0.875rem] leading-relaxed text-ink-2">
        New books land from Europe, Japan and Korea throughout the year. Ask us
        to put you on the launch list and you will see them before they reach
        the floor.
      </p>
      <div className="mt-8 flex flex-col gap-3">
        <CTA href="/new-arrivals">Browse new arrivals</CTA>
        <CTA href="/contact" tone="outline">
          Join the launch list
        </CTA>
      </div>
    </div>
  );
}

/** Touch-friendly fallback: an ordinary snapping scroller. */
function SwipeRail() {
  return (
    <div className="lg:hidden">
      <Container className="mb-8">
        <Eyebrow className="mb-5">New Arrivals · Updated monthly</Eyebrow>
        <div className="flex items-end justify-between gap-6">
          <h2 className="display-lg text-ink">Landed this season</h2>
          <CTA href="/new-arrivals" tone="outline" size="sm">
            All
          </CTA>
        </div>
      </Container>
      <div className="flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {arrivals.map((c, i) => (
          <div key={c.slug} className="snap-start">
            <RailCard c={c} index={i} />
          </div>
        ))}
      </div>
    </div>
  );
}

import { Smooth3DSlideshow } from "@/components/home/Smooth3DSlideshow";

export function NewArrivalsRail() {
  return (
    <section className="relative overflow-hidden py-20 lg:py-28" aria-label="New arrivals">
      <Container wide>
        <Reveal>
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <Eyebrow className="mb-3">New Arrivals · Updated monthly</Eyebrow>
              <h2 className="display-lg text-ink">Landed this season</h2>
            </div>
            <CTA href="/new-arrivals" tone="outline" size="sm">
              View all new arrivals →
            </CTA>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <Smooth3DSlideshow cardWidth={420} cardHeight={420} tilt={10} sideTilt={8} gap={9} opacity={60} />
        </Reveal>
      </Container>
    </section>
  );
}

export function ArrivalsBadgeLegend() {
  return (
    <div className="flex flex-wrap gap-2">
      {(["new", "trending", "best-seller", "limited"] as const).map((t) => (
        <Pill key={t} tone={t === "limited" ? "warn" : "default"}>
          {tagLabel[t]}
        </Pill>
      ))}
    </div>
  );
}

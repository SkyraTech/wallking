"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { clamp, scrollEngine } from "@/lib/scroll-engine";
import { Container, cx } from "@/components/ui/primitives";
import { journey, journeySrc, journeyBlur } from "@/lib/data/imagery";
import { collections } from "@/lib/data/collections";
import { brands } from "@/lib/data/brands";

const brandName = (slug: string) =>
  brands.find((b) => b.slug === slug)?.name ?? slug;

/**
 * The scroll-through.
 *
 * Eight full-viewport rooms stacked as sticky panels. Each one pins while you
 * scroll its share of the page, then the next rises over it — so you travel
 * *through* the rooms rather than past a list of them.
 *
 * Three depths move at once inside every scene, which is where the parallax
 * actually comes from:
 *   1. the photograph, scaled and drifting slowly upward
 *   2. the caption block, moving faster and fading at the edges
 *   3. the room number, moving fastest, almost off-screen
 *
 * All of it is driven from the shared scroll engine — one rAF for the whole
 * page — and every transform is a translate/scale, so nothing triggers layout.
 */
export function ScenicJourney() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const panels = Array.from(
      root.querySelectorAll<HTMLElement>("[data-scene]"),
    );
    if (!panels.length) return;

    const layers = panels.map((p) => ({
      panel: p,
      media: p.querySelector<HTMLElement>("[data-layer='media']"),
      caption: p.querySelector<HTMLElement>("[data-layer='caption']"),
      index: p.querySelector<HTMLElement>("[data-layer='index']"),
      veil: p.querySelector<HTMLElement>("[data-layer='veil']"),
      top: 0,
      height: 1,
    }));

    const measure = () => {
      for (const l of layers) {
        const r = l.panel.getBoundingClientRect();
        l.top = r.top + window.scrollY;
        l.height = l.panel.offsetHeight || window.innerHeight;
      }
    };

    let lastActive = -1;

    const render = (s: { smooth: number; vh: number }) => {
      for (let i = 0; i < layers.length; i++) {
        const l = layers[i];
        // 0 when the scene starts pinning, 1 when it is fully scrolled through
        const p = clamp((s.smooth - l.top) / Math.max(l.height - s.vh, 1), 0, 1);

        if (l.media) {
          // Subtle push in and gentle drift — keeping the room wide and spacious.
          const scale = 1.03 - p * 0.03;
          l.media.style.transform = `translate3d(0, ${(-p * 3).toFixed(2)}%, 0) scale(${scale.toFixed(4)})`;
        }
        if (l.caption) {
          l.caption.style.transform = `translate3d(0, ${(-p * 58).toFixed(1)}px, 0)`;
          // Arrive fast, hold, leave late. A slow ramp at either end means the
          // reader spends most of the scene looking at half-visible text.
          l.caption.style.opacity = clamp(
            Math.min(p / 0.07, (1 - p) / 0.16),
            0,
            1,
          ).toFixed(3);
        }
        if (l.index) {
          l.index.style.transform = `translate3d(0, ${(-p * 130).toFixed(1)}px, 0)`;
        }
        if (l.veil) {
          // Wash the scene back slightly as it is left behind. The veil is
          // --void, so on the light act this fades toward bone rather than
          // toward black — which means it must stay SHALLOW. At 0.6 the
          // product bleached out completely and the room disappeared.
          l.veil.style.opacity = (0.05 + p * 0.26).toFixed(3);
        }

        if (p > 0.02 && p < 0.98 && lastActive !== i) {
          lastActive = i;
          setActive(i);
        }
      }
    };

    const offMeasure = scrollEngine.onMeasure(measure);
    const offFrame = scrollEngine.onFrame(render);
    return () => {
      offMeasure();
      offFrame();
    };
  }, []);

  if (!journey.length) return null;

  return (
    <section
      ref={rootRef}
      aria-label="A walk through five rooms"
      className="relative"
    >
      {/* progress rail */}
      <div className="pointer-events-none fixed right-6 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-end gap-3 lg:flex">
        {journey.map((s, i) => (
          <span key={s.slug} className="flex items-center gap-2.5">
            <span
              className={cx(
                "eyebrow text-[0.5625rem] transition-opacity duration-500",
                i === active ? "opacity-100 text-ink" : "opacity-0",
              )}
            >
              {s.place}
            </span>
            <span
              className={cx(
                "block h-px transition-all duration-500",
                i === active ? "w-8 bg-accent" : "w-4 bg-line-2",
              )}
            />
          </span>
        ))}
      </div>

      {journey.map((scene, i) => {
        const collection = collections.find((c) => c.slug === scene.slug)!;
        const way = collection.colourways[0];

        return (
          <div
            key={scene.slug}
            data-scene={i}
            /* Each scene owns 180vh of scroll: 100vh pinned + 80vh of travel. */
            className="relative h-[150svh]"
          >
            <div className="sticky top-0 h-[100svh] overflow-hidden">
              {/* 1 — photograph */}
              <div
                data-layer="media"
                className="absolute inset-0 will-change-transform"
              >
                <Image
                  src={journeySrc(scene.room)}
                  alt={`${collection.name} — ${scene.place}`}
                  fill
                  priority={i === 0}
                  sizes="100vw"
                  placeholder="blur"
                  blurDataURL={journeyBlur(scene.room)}
                  className="object-cover"
                />
              </div>

              {/* veil + bottom scrim so type always holds */}
              <div
                data-layer="veil"
                className="absolute inset-0 bg-void transition-opacity duration-200"
                style={{ opacity: 0.08 }}
              />
              <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-void via-void/45 to-transparent" />

              {/* 3 — room number, fastest layer */}
              <div
                data-layer="index"
                className="pointer-events-none absolute right-6 top-24 will-change-transform lg:right-16"
              >
                <span className="font-display text-[18vw] leading-none text-ink/10 lg:text-[12vw]">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>

              {/* 2 — caption */}
              <Container wide className="relative flex h-full items-end pb-20 lg:pb-28">
                <div data-layer="caption" className="max-w-3xl will-change-transform">
                  <p className="eyebrow mb-6 inline-flex items-center gap-2.5 rounded-full border border-line bg-panel/70 px-4 py-2 text-ink-2 backdrop-blur-md">
                    <span className="block h-1.5 w-1.5 rounded-full bg-accent" />
                    {scene.place}
                  </p>

                  <h2 className="display-xl text-ink">{scene.line}</h2>

                  <div className="mt-9 flex flex-wrap items-end gap-x-10 gap-y-5">
                    <Link
                      href={`/collections/${collection.slug}`}
                      className="group flex items-center gap-4"
                    >
                      <span className="relative h-16 w-13 shrink-0 overflow-hidden rounded-lg border border-line" style={{ width: "3.25rem" }}>
                        <Image
                          src={journeySrc(scene.room, 200)}
                          alt=""
                          fill
                          sizes="52px"
                          className="object-cover"
                        />
                      </span>
                      <span>
                        <span className="font-display block text-2xl text-ink transition-colors duration-500 group-hover:text-accent">
                          {collection.name}
                        </span>
                        <span className="mt-0.5 block text-[0.8125rem] text-ink-3">
                          {brandName(collection.brand)} · {way.designNo}
                        </span>
                      </span>
                      <ArrowRight
                        className="ml-1 h-4 w-4 text-ink-3 transition-transform duration-500 [transition-timing-function:var(--ease-out)] group-hover:translate-x-1.5 group-hover:text-accent"
                        strokeWidth={1.5}
                      />
                    </Link>
                  </div>
                </div>
              </Container>
            </div>
          </div>
        );
      })}
    </section>
  );
}

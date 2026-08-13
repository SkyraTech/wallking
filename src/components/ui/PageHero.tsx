import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import type { SwatchSpec } from "@/components/art/WallpaperSwatch";
import { Parallax } from "@/components/motion/Parallax";
import { Reveal, RevealLines } from "@/components/motion/Reveal";
import { Container, cx } from "@/components/ui/primitives";
import { roomSrc, blurRoom, heroRoomFor } from "@/lib/data/imagery";

export type Crumb = { label: string; href?: string };

/**
 * Page opener.
 *
 * Real wallpapered-room photography behind every page header, knocked back by
 * a THEME-AWARE scrim rather than a hardcoded black one. That is the fix for
 * "the themes look identical": this band is on every inner page, and when it
 * was permanently dark it held most of the page's surface area hostage.
 */
export function PageHero({
  eyebrow,
  titleLines,
  lede,
  crumbs = [],
  seed,
  children,
  compact = false,
  /** Legacy prop from the procedural era — ignored, kept so pages still compile. */
  art: _art,
}: {
  eyebrow: string;
  titleLines: ReactNode[];
  lede?: ReactNode;
  crumbs?: Crumb[];
  seed?: string;
  children?: ReactNode;
  compact?: boolean;
  art?: SwatchSpec;
}) {
  const room = heroRoomFor(seed ?? eyebrow);

  return (
    <section className="relative isolate -mt-20 overflow-hidden bg-deep pt-20 lg:-mt-24 lg:pt-24">
      <div className="absolute inset-0 -z-10">
        <Parallax speed={0.16} zoom={0.05} cover className="absolute inset-0">
          <Image
            src={roomSrc(room, 2000)}
            alt=""
            fill
            priority
            sizes="100vw"
            placeholder="blur"
            blurDataURL={blurRoom(room)}
            className="object-cover"
          />
        </Parallax>
        {/* Theme-aware wash: a pale veil on the light act, a deep one on dark. */}
        <div className="absolute inset-0 bg-void/72 light:bg-void/78" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-void to-transparent" />
      </div>

      <Container wide>
        <div className={cx(compact ? "py-16 lg:py-24" : "py-24 lg:py-36")}>
          {crumbs.length > 0 && (
            <Reveal>
              <nav aria-label="Breadcrumb" className="mb-10">
                <ol className="eyebrow flex flex-wrap items-center gap-2.5 text-ink-3">
                  <li>
                    <Link href="/" className="link-draw hover:text-ink">
                      Home
                    </Link>
                  </li>
                  {crumbs.map((c) => (
                    <li key={c.label} className="flex items-center gap-2.5">
                      <span aria-hidden className="opacity-40">
                        —
                      </span>
                      {c.href ? (
                        <Link href={c.href} className="link-draw hover:text-ink">
                          {c.label}
                        </Link>
                      ) : (
                        <span className="text-ink">{c.label}</span>
                      )}
                    </li>
                  ))}
                </ol>
              </nav>
            </Reveal>
          )}

          <Reveal>
            <p className="eyebrow mb-8 inline-flex items-center gap-2.5 rounded-full border border-line bg-panel/70 px-4 py-2 text-ink-2 backdrop-blur-md">
              <span aria-hidden className="block h-1.5 w-1.5 rounded-full bg-accent" />
              {eyebrow}
            </p>
          </Reveal>

          <RevealLines
            as="h1"
            className="display-xl max-w-[18ch] text-ink"
            stagger={110}
            lines={titleLines}
          />

          {lede && (
            <Reveal delay={320}>
              <p className="lede mt-8 max-w-2xl">{lede}</p>
            </Reveal>
          )}

          {children && (
            <Reveal delay={440}>
              <div className="mt-10">{children}</div>
            </Reveal>
          )}
        </div>
      </Container>
    </section>
  );
}

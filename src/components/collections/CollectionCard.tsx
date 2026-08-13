import Link from "next/link";
import Image from "next/image";
import { RoomPhoto as WallpaperSwatch } from "@/components/art/RoomPhoto";
import { srcFor, blurFor } from "@/lib/data/imagery";
import { Pill, StockDot, cx } from "@/components/ui/primitives";
import {
  daysSinceAdded,
  stockLabel,
  tagLabel,
  type Collection,
} from "@/lib/data/collections";
import { brands } from "@/lib/data/brands";

const brandOf = (slug: string) => brands.find((b) => b.slug === slug);

export function CollectionCard({
  collection: c,
  priority = false,
  aspect = "portrait",
  className,
}: {
  collection: Collection;
  priority?: boolean;
  aspect?: "portrait" | "tall" | "square";
  className?: string;
}) {
  const brand = brandOf(c.brand);
  const recent = daysSinceAdded(c) <= 60;
  const lead = c.colourways[0];
  const aspectClass = {
    portrait: "aspect-[4/5]",
    tall: "aspect-[3/4.6]",
    square: "aspect-square",
  }[aspect];

  // Arva's quilt: each card is backed by one of four rotating surface tones so
  // a grid reads as a series of tiles rather than a row of identical frames.
  const tile = ["bg-tile-1", "bg-tile-2", "bg-tile-3", "bg-tile-4"][
    Math.abs(
      c.slug.split("").reduce((a, ch) => a + ch.charCodeAt(0), 0),
    ) % 4
  ];

  return (
    <article className={cx("group/card relative", className)}>
      <Link href={`/collections/${c.slug}`} className="block">
        <div
          className={cx(
            "relative overflow-hidden rounded-2xl border border-line bg-panel/80 p-2 backdrop-blur-md transition-all duration-500 hover:border-accent/60 hover:shadow-md",
            tile,
          )}
        >
          <div
            className={cx(
              "relative overflow-hidden rounded-xl",
              aspectClass,
            )}
          >
            <Image
              src={srcFor(c.slug, 800)}
              alt={`${c.name} — room set`}
              fill
              priority={priority}
              sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
              placeholder="blur"
              blurDataURL={blurFor(c.slug)}
              className="object-cover transition-transform duration-[1200ms] [transition-timing-function:var(--ease-out)] group-hover/card:scale-[1.05]"
            />

            {/* tags, top-left */}
            <div className="pointer-events-none absolute left-2.5 top-2.5 flex flex-col items-start gap-1">
              {recent && !c.tags.includes("new") && (
                <span className="eyebrow rounded-full bg-panel/90 px-2 py-1 text-[0.5625rem] text-ink backdrop-blur-md">
                  Recently added
                </span>
              )}
              {c.tags
                .filter((t) => t !== "featured")
                .map((t) => (
                  <span
                    key={t}
                    className={cx(
                      "eyebrow rounded-full px-2 py-1 text-[0.5625rem] backdrop-blur-md",
                      t === "new"
                        ? "bg-accent text-white"
                        : t === "limited"
                          ? "bg-panel/90 text-alert"
                          : "bg-panel/90 text-ink",
                    )}
                  >
                    {tagLabel[t]}
                  </span>
                ))}
            </div>

            {/* colourway chips, bottom-right */}
            <div className="pointer-events-none absolute bottom-2.5 right-2.5 flex -space-x-1">
              {c.colourways.slice(0, 4).map((cw) => (
                <span
                  key={cw.designNo}
                  title={cw.name}
                  className="h-3.5 w-3.5 rounded-full border border-white/60 shadow-sm"
                  style={{ background: cw.art.palette[1] }}
                />
              ))}
            </div>

            {/* hover plate */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-full bg-panel/95 px-3 py-2 backdrop-blur-md transition-transform duration-[500ms] [transition-timing-function:var(--ease-out)] group-hover/card:translate-y-0">
              <p className="tnum text-[0.625rem] text-ink-2">
                {c.colourways.length} colourway
                {c.colourways.length > 1 ? "s" : ""} · from {lead.designNo}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-start justify-between gap-3 pt-3">
          <div className="min-w-0">
            <h3 className="font-display text-lg leading-tight text-ink transition-colors duration-400 group-hover/card:text-accent">
              {c.name}
            </h3>
            <p className="mt-0.5 truncate text-[0.6875rem] tracking-[0.04em] text-ink-3">
              {brand?.name} · {brand?.country}
            </p>
          </div>
          <span className="mt-0.5 flex shrink-0 items-center gap-1 text-[0.625rem] text-ink-3">
            <StockDot stock={lead.stock} />
            <span className="hidden sm:inline">{stockLabel[lead.stock]}</span>
          </span>
        </div>

        <p className="mt-1.5 line-clamp-2 text-[0.75rem] leading-relaxed text-ink-2">
          {c.summary}
        </p>
      </Link>
    </article>
  );
}

/** Compact horizontal variant for rails and "related" strips. */
export function CollectionRow({ collection: c }: { collection: Collection }) {
  const brand = brandOf(c.brand);
  return (
    <Link
      href={`/collections/${c.slug}`}
      className="group flex items-center gap-4 border-b border-line-faint py-4 transition-colors hover:bg-deep/60"
    >
      <div className="h-16 w-[3.25rem] shrink-0 overflow-hidden border border-line">
        <WallpaperSwatch spec={c.colourways[0].art} seed={c.slug} className="h-full w-full" lit={false} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-display text-lg text-ink transition-colors group-hover:text-accent">
          {c.name}
        </p>
        <p className="truncate text-[0.75rem] text-ink-3">
          {brand?.name} · {c.styles.join(", ")}
        </p>
      </div>
      <Pill>{c.colourways.length} ways</Pill>
    </Link>
  );
}

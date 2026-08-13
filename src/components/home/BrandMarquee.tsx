import Link from "next/link";
import { brands } from "@/lib/data/brands";

/**
 * Two counter-running bands of brand names.
 *
 * Pure CSS animation — no JS, no scroll subscription — because this runs the
 * whole time it is on screen and does not need to know anything about scroll.
 * The duplicate half is what makes the loop seamless; it is aria-hidden so
 * screen readers hear the list once.
 */
type MarqueeItem = { slug: string; name: string; country: string };

function Row({
  items,
  duplicate = false,
}: {
  items: MarqueeItem[];
  duplicate?: boolean;
}) {
  return (
    <div
      className="flex shrink-0 items-center"
      aria-hidden={duplicate || undefined}
    >
      {items.map((b) => (
        <Link
          key={`${duplicate ? "d" : "o"}-${b.slug}`}
          href={`/brands#${b.slug}`}
          tabIndex={duplicate ? -1 : undefined}
          className="group flex shrink-0 items-baseline gap-3 px-8 py-1"
        >
          <span className="font-display whitespace-nowrap text-[clamp(1.25rem,2.1vw,1.9rem)] text-ink transition-colors duration-500 group-hover:text-accent">
            {b.name}
          </span>
          <span className="eyebrow whitespace-nowrap text-[0.5625rem] text-ink-3">
            {b.country}
          </span>
        </Link>
      ))}
    </div>
  );
}

function Band({
  items,
  reverse = false,
  duration,
}: {
  items: MarqueeItem[];
  reverse?: boolean;
  duration: string;
}) {
  return (
    <div className="marquee mask-fade-x overflow-hidden py-3">
      <div
        className="marquee-track"
        data-direction={reverse ? "reverse" : undefined}
        style={{ ["--marquee-duration" as string]: duration }}
      >
        <Row items={items} />
        <Row items={items} duplicate />
      </div>
    </div>
  );
}

export function BrandMarquee() {
  const half = Math.ceil(brands.length / 2);
  const top = brands.slice(0, half).map((b) => ({ slug: b.slug, name: b.name, country: b.country }));
  const bottom = brands.slice(half).map((b) => ({ slug: b.slug, name: b.name, country: b.country }));

  return (
    <section
      className="rule-t rule-b relative overflow-hidden py-10"
      aria-label="Our international brand partners"
    >
      <div className="mb-6 text-center">
        <span className="eyebrow text-ink-3">
          Twenty-five houses · Seven countries · One importer
        </span>
      </div>
      <Band items={top} duration="58s" />
      <Band items={bottom} reverse duration="72s" />
    </section>
  );
}

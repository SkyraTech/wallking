"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Check, Copy, Mail, ZoomIn, X } from "lucide-react";
import { RoomPhoto as WallpaperSwatch } from "@/components/art/RoomPhoto";
import { useParallax } from "@/components/motion/Parallax";
import {
  ButtonEl,
  CTA,
  Pill,
  StockDot,
  cx,
} from "@/components/ui/primitives";
import {
  stockLabel,
  tagLabel,
  type Collection,
} from "@/lib/data/collections";
import { site, whatsappLink } from "@/lib/site";
import type { Brand } from "@/lib/data/brands";

/**
 * Colourway gallery with zoom, plus the enquiry and share actions.
 *
 * The selected colourway is reflected in ?design= so a dealer can send a
 * colleague a link to the exact reference rather than "the blue one".
 */
export function CollectionDetail({
  collection: c,
  brand,
  url,
}: {
  collection: Collection;
  brand: Brand | undefined;
  url: string;
}) {
  const params = useSearchParams();
  const requested = params.get("design");
  const initial = Math.max(
    0,
    c.colourways.findIndex((cw) => cw.designNo === requested),
  );

  const [index, setIndex] = useState(initial);
  const [zoom, setZoom] = useState(false);
  const [copied, setCopied] = useState(false);
  const imageRef = useParallax<HTMLDivElement>({ speed: 0.05, max: 90 });

  const cw = c.colourways[index];
  const shareUrl = `${url}?design=${encodeURIComponent(cw.designNo)}`;

  // Keep the address bar in step without pushing history entries.
  useEffect(() => {
    const next = new URL(window.location.href);
    next.searchParams.set("design", cw.designNo);
    window.history.replaceState(null, "", next.toString());
  }, [cw.designNo]);

  useEffect(() => {
    if (!zoom) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setZoom(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [zoom]);

  const enquiry = `Hello Wall King — I'd like to enquire about ${c.name} (${brand?.name ?? ""}), colourway ${cw.name}, design no. ${cw.designNo}. ${shareUrl}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      /* clipboard blocked — the link is visible in the address bar anyway */
    }
  };

  return (
    <>
      <div className="grid gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16 xl:gap-24">
        {/* -------------------------------------------------- gallery */}
        <div>
          <div ref={imageRef} className="relative">
            <button
              onClick={() => setZoom(true)}
              className="group relative block w-full cursor-zoom-in overflow-hidden border border-line bg-deep"
              aria-label={`Zoom into ${c.name} ${cw.name}`}
            >
              <div className="aspect-[4/5]">
                <WallpaperSwatch
                  spec={cw.art}
                  seed={`${c.slug}-${cw.designNo}`}
                  priority
                  className="h-full w-full transition-transform duration-[1600ms] [transition-timing-function:var(--ease-cut)] group-hover:scale-[1.04]"
                />
              </div>
              <span className="absolute bottom-4 right-4 flex items-center gap-2 bg-void/90 px-3 py-2 text-[0.6875rem] text-ink backdrop-blur-sm transition-opacity duration-500 group-hover:opacity-100 sm:opacity-0">
                <ZoomIn className="h-3.5 w-3.5" strokeWidth={1.5} /> View at scale
              </span>
            </button>
          </div>

          <div className="mt-5 grid grid-cols-4 gap-3 sm:grid-cols-5">
            {c.colourways.map((v, i) => (
              <button
                key={v.designNo}
                onClick={() => setIndex(i)}
                aria-pressed={i === index}
                className={cx(
                  "group relative aspect-[3/4] overflow-hidden border transition-all duration-500",
                  i === index
                    ? "border-accent ring-1 ring-accent ring-offset-2 ring-offset-void"
                    : "border-line hover:border-ink-3",
                )}
              >
                <WallpaperSwatch
                  spec={v.art}
                  seed={`${c.slug}-${v.designNo}`}
                  className="h-full w-full"
                  lit={false}
                />
                <span className="sr-only">
                  {v.name} — {v.designNo}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* -------------------------------------------------- detail */}
        <div>
          <div className="flex flex-wrap items-center gap-2">
            {c.tags.map((t) => (
              <Pill key={t} tone={t === "limited" ? "warn" : t === "new" ? "accent" : "default"}>
                {tagLabel[t]}
              </Pill>
            ))}
            <Pill tone={cw.stock === "in" ? "live" : cw.stock === "limited" ? "warn" : "out"}>
              <StockDot stock={cw.stock} />
              {stockLabel[cw.stock]}
            </Pill>
          </div>

          <h1 className="display-xl mt-6 text-ink">{c.name}</h1>

          {brand && (
            <Link
              href={`/brands#${brand.slug}`}
              className="link-draw mt-4 inline-block text-[0.875rem] tracking-[0.04em] text-ink-2 hover:text-accent"
            >
              {brand.name} — {brand.country}
            </Link>
          )}

          <div className="mt-8 flex flex-wrap items-baseline gap-x-8 gap-y-3 border-y border-line py-5">
            <div>
              <p className="eyebrow text-ink-3">Colourway</p>
              <p className="mt-1.5 font-display text-2xl text-ink">{cw.name}</p>
            </div>
            <div>
              <p className="eyebrow text-ink-3">Design no.</p>
              <p className="tnum mt-1.5 font-display text-2xl text-accent">
                {cw.designNo}
              </p>
            </div>
          </div>

          <div className="prose-body mt-8">
            {c.story.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          {/* actions */}
          <div className="mt-9 flex flex-wrap gap-3">
            <CTA href={whatsappLink(enquiry)} size="lg" external arrow={false}>
              Enquire on WhatsApp
            </CTA>
            <CTA
              href={`mailto:${site.email}?subject=${encodeURIComponent(
                `Enquiry — ${c.name} ${cw.designNo}`,
              )}&body=${encodeURIComponent(enquiry)}`}
              tone="outline"
              size="lg"
              external
              arrow={false}
            >
              <Mail className="h-4 w-4" strokeWidth={1.5} /> Email enquiry
            </CTA>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            {c.catalogue ? (
              <CTA href={c.catalogue} tone="ghost" size="sm" external className="px-0">
                Download catalogue (PDF)
              </CTA>
            ) : (
              <CTA href="/downloads" tone="ghost" size="sm" className="px-0">
                Request the catalogue
              </CTA>
            )}
            <ButtonEl tone="ghost" size="sm" onClick={copy} className="px-0">
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" strokeWidth={1.8} /> Link copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" strokeWidth={1.5} /> Copy link
                </>
              )}
            </ButtonEl>
          </div>

          {/* specification */}
          <div className="mt-12">
            <h2 className="eyebrow mb-5 text-ink-3">Specification</h2>
            <dl className="grid grid-cols-2 gap-px border border-line bg-line text-[0.8125rem]">
              {[
                ["Roll width", `${c.spec.rollWidthCm} cm`],
                ["Roll length", `${c.spec.rollLengthM} m`],
                ["Pattern repeat", c.spec.repeatCm === 0 ? "Free match" : `${c.spec.repeatCm} cm`],
                ["Match", c.spec.match],
                ["Substrate", c.spec.substrate],
                ["Cleaning", c.spec.washability],
                ...(c.spec.fireRating ? [["Fire rating", c.spec.fireRating]] : []),
                ["Coverage per roll", `${((c.spec.rollWidthCm / 100) * c.spec.rollLengthM).toFixed(1)} m²`],
              ].map(([k, v]) => (
                <div key={k} className="bg-void p-4">
                  <dt className="text-[0.6875rem] uppercase tracking-[0.12em] text-ink-3">
                    {k}
                  </dt>
                  <dd className="mt-1.5 text-ink">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* taxonomy */}
          <div className="mt-10 space-y-4">
            {[
              ["Style", c.styles],
              ["Colour", c.colours],
              ["Texture", c.textures],
              ["Application", c.applications],
            ].map(([label, values]) => (
              <div key={label as string} className="flex flex-wrap items-baseline gap-3">
                <span className="eyebrow w-24 shrink-0 text-ink-3">{label as string}</span>
                <span className="flex flex-wrap gap-1.5">
                  {(values as string[]).map((v) => (
                    <Link
                      key={v}
                      href="/collections"
                      className="border border-line px-2.5 py-1 text-[0.75rem] text-ink-2 transition-colors hover:border-accent hover:text-accent"
                    >
                      {v}
                    </Link>
                  ))}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* -------------------------------------------------- zoom overlay */}
      {zoom && (
        <div className="fixed inset-0 z-[220] flex items-center justify-center bg-ink/92 p-4 backdrop-blur-sm">
          <button
            onClick={() => setZoom(false)}
            aria-label="Close"
            className="absolute right-6 top-6 grid h-11 w-11 place-items-center border border-white/25 text-white transition-colors hover:border-accent hover:text-accent"
          >
            <X className="h-5 w-5" strokeWidth={1.4} />
          </button>

          <figure className="max-h-full w-full max-w-4xl overflow-auto">
            <div className="aspect-[4/5] w-full">
              {/* Scaled up 2.5× so the repeat reads at close to true wall size */}
              <WallpaperSwatch
                spec={{ ...cw.art, scale: (cw.art.scale ?? 1) * 2.5 }}
                seed={`${c.slug}-${cw.designNo}-zoom`}
                className="h-full w-full"
              />
            </div>
            <figcaption className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[0.8125rem] text-white/70">
              <span>
                {c.name} · {cw.name}
              </span>
              <span className="tnum">{cw.designNo} — shown at approx. wall scale</span>
            </figcaption>
          </figure>
        </div>
      )}
    </>
  );
}

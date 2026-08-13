import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import QRCode from "qrcode";

import { CollectionDetail } from "@/components/collections/CollectionDetail";
import { CollectionCard } from "@/components/collections/CollectionCard";
import { Container, CTA, Eyebrow } from "@/components/ui/primitives";
import { Reveal } from "@/components/motion/Reveal";
import { collections, getCollection } from "@/lib/data/collections";
import { getBrand } from "@/lib/data/brands";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return collections.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata(
  props: PageProps<"/collections/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const c = getCollection(slug);
  if (!c) return { title: "Collection not found" };
  const brand = getBrand(c.brand);
  return {
    title: `${c.name} — ${brand?.name ?? "Wall King"}`,
    description: c.summary,
    alternates: { canonical: `/collections/${c.slug}` },
    openGraph: {
      title: `${c.name} · ${brand?.name}`,
      description: c.summary,
      url: `/collections/${c.slug}`,
    },
  };
}

export default async function CollectionPage(
  props: PageProps<"/collections/[slug]">,
) {
  const { slug } = await props.params;
  const c = getCollection(slug);
  if (!c) notFound();

  const brand = getBrand(c.brand);
  const url = `${site.url}/collections/${c.slug}`;

  // Rendered at build time as an inline SVG — no image request, no external
  // QR service, and it scales cleanly when printed onto a sample card.
  const qrSvg = await QRCode.toString(url, {
    type: "svg",
    margin: 0,
    errorCorrectionLevel: "M",
    color: { dark: "#14181d", light: "#0000" },
  });

  const related = collections
    .filter(
      (o) =>
        o.slug !== c.slug &&
        (o.brand === c.brand || o.styles.some((s) => c.styles.includes(s))),
    )
    .slice(0, 4);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: c.name,
    description: c.summary,
    brand: { "@type": "Brand", name: brand?.name },
    category: c.styles.join(", "),
    url,
    sku: c.colourways[0].designNo,
    offers: c.colourways.map((cw) => ({
      "@type": "Offer",
      sku: cw.designNo,
      name: cw.name,
      availability:
        cw.stock === "in"
          ? "https://schema.org/InStock"
          : cw.stock === "limited"
            ? "https://schema.org/LimitedAvailability"
            : "https://schema.org/OutOfStock",
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />

      <Container wide className="pt-12 lg:pt-16">
        <nav aria-label="Breadcrumb" className="mb-10">
          <ol className="flex flex-wrap items-center gap-2 text-[0.6875rem] uppercase tracking-[0.08em] text-ink-3">
            <li>
              <Link href="/" className="link-draw hover:text-ink">
                Home
              </Link>
            </li>
            <li className="flex items-center gap-2">
              <span aria-hidden className="opacity-40">/</span>
              <Link href="/collections" className="link-draw hover:text-ink">
                Collections
              </Link>
            </li>
            <li className="flex items-center gap-2">
              <span aria-hidden className="opacity-40">/</span>
              <span className="text-ink">{c.name}</span>
            </li>
          </ol>
        </nav>

        <Suspense fallback={<div className="min-h-[60vh]" />}>
          <CollectionDetail collection={c} brand={brand} url={url} />
        </Suspense>
      </Container>

      {/* QR + sample strip */}
      <section className="mt-24 border-y border-line bg-deep">
        <Container wide>
          <div className="grid gap-10 py-14 md:grid-cols-[auto_1fr_auto] md:items-center">
            <div className="flex items-center gap-6">
              <div
                className="h-24 w-24 shrink-0 [&>svg]:h-full [&>svg]:w-full"
                dangerouslySetInnerHTML={{ __html: qrSvg }}
                aria-hidden
              />
              <div>
                <Eyebrow className="mb-3">Scan to share</Eyebrow>
                <p className="max-w-xs text-[0.8125rem] leading-relaxed text-ink-2">
                  Point a phone at this code to open {c.name} instantly. Print
                  it on a sample card so a client can find the range again from
                  their sofa.
                </p>
              </div>
            </div>

            <div className="hidden h-16 w-px justify-self-center bg-line md:block" />

            <div className="flex flex-col gap-3 sm:flex-row md:justify-end">
              <CTA href="/calculator" tone="outline">
                Calculate rolls needed
              </CTA>
              <CTA href="/showrooms">See it at full drop</CTA>
            </div>
          </div>
        </Container>
      </section>

      {related.length > 0 && (
        <section className="py-24">
          <Container wide>
            <Reveal>
              <div className="mb-12 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                <div>
                  <Eyebrow className="mb-5">You may also consider</Eyebrow>
                  <h2 className="display-lg text-ink">Related ranges</h2>
                </div>
                <CTA href="/collections" tone="outline">
                  All collections
                </CTA>
              </div>
            </Reveal>
            <div className="grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4 lg:gap-x-8">
              {related.map((r) => (
                <CollectionCard key={r.slug} collection={r} />
              ))}
            </div>
          </Container>
        </section>
      )}
    </>
  );
}

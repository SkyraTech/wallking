import type { Metadata } from "next";
import { FileText, BookOpen, Wrench, Droplets, ShieldCheck } from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { Reveal } from "@/components/motion/Reveal";
import { Container, CTA, Eyebrow, Pill } from "@/components/ui/primitives";
import { brandsByCountry } from "@/lib/data/brands";

export const metadata: Metadata = {
  title: "Download Centre — Catalogues, Guides & Technical Data",
  description:
    "Wall King catalogues, installation guides, care instructions and technical data sheets for imported wallpapers and contract wallcoverings.",
  alternates: { canonical: "/downloads" },
};

/**
 * PDFs are requested rather than served directly until the files are supplied.
 * Drop a PDF into /public/downloads and set `file` on the matching entry —
 * the card switches from "Request" to a direct download automatically.
 */
type Doc = {
  title: string;
  body: string;
  meta: string;
  file?: string;
  icon: typeof FileText;
};

const groups: { heading: string; note: string; docs: Doc[] }[] = [
  {
    heading: "Catalogues",
    note: "Full range books by brand, plus our curated project and residential selections.",
    docs: [
      {
        title: "Wall King Brand Portfolio",
        body: "All 25 international brands, grouped by country, with the ranges we currently stock in India.",
        meta: "PDF · updated quarterly",
        icon: BookOpen,
      },
      {
        title: "Project & Contract Selection",
        body: "Contract-grade wallcoverings for hospitality, healthcare, retail and corporate, with ratings against each range.",
        meta: "PDF · specification pack",
        icon: BookOpen,
      },
      {
        title: "Residential Collections",
        body: "The ranges we specify most often into homes and apartments, arranged by room and by style.",
        meta: "PDF · seasonal",
        icon: BookOpen,
      },
      {
        title: "New Arrivals — Current Season",
        body: "This season's launches from Europe, Japan and Korea, with design numbers and stock position.",
        meta: "PDF · monthly",
        icon: BookOpen,
      },
    ],
  },
  {
    heading: "Installation",
    note: "Method statements for our substrates, written for fitters rather than for lawyers.",
    docs: [
      {
        title: "Installation Guide — Non-woven (paste the wall)",
        body: "Surface preparation, adhesive selection, hanging sequence, seam treatment and drying times.",
        meta: "PDF · 12 pages",
        icon: Wrench,
      },
      {
        title: "Installation Guide — Paper-backed vinyl",
        body: "Booking times, trimming, overlap-and-double-cut technique and corner handling.",
        meta: "PDF · 10 pages",
        icon: Wrench,
      },
      {
        title: "Mural & Panel Installation",
        body: "Panel sequencing, wall setting-out, horizon alignment and trimming for made-to-measure murals.",
        meta: "PDF · 8 pages",
        icon: Wrench,
      },
      {
        title: "Substrate Preparation Standard",
        body: "What a wall must be before paper goes on it — moisture content, sizing, filling and priming.",
        meta: "PDF · 6 pages",
        icon: ShieldCheck,
      },
    ],
  },
  {
    heading: "Care & technical",
    note: "Hand these to the client at handover and to the consultant at tender.",
    docs: [
      {
        title: "Care & Cleaning Instructions",
        body: "The four cleaning classes, what each will tolerate, and the products that destroy a surface.",
        meta: "PDF · 4 pages",
        icon: Droplets,
      },
      {
        title: "Technical Data Sheets",
        body: "Weight, width, backing, fire classification, abrasion and scrub ratings by range.",
        meta: "PDF · by collection",
        icon: FileText,
      },
      {
        title: "Fire Certification Pack",
        body: "EN 13501-1 and ASTM E84 certificates for contract ranges, current issue.",
        meta: "PDF · on request",
        icon: ShieldCheck,
      },
      {
        title: "Warranty & Batch Policy",
        body: "Our position on dye lots, attic stock, shortfalls and claims — in plain language.",
        meta: "PDF · 2 pages",
        icon: FileText,
      },
    ],
  },
];

export default function DownloadsPage() {
  return (
    <>
      <PageHero
        eyebrow="Catalogues · Guides · Technical data"
        crumbs={[{ label: "Download Centre" }]}
        titleLines={["Everything, on", "one page."]}
        lede="Catalogues for choosing, installation guides for fitting, care sheets for handover and technical data for the tender pack."
        art={{
          kind: "geometric",
          palette: ["#0a0c10", "#252c37", "#12171f", "#39434f"],
          scale: 1.5,
        }}
        seed="downloads-hero"
        compact
      />

      <Container wide className="py-16 lg:py-20">
        {groups.map((g, gi) => (
          <section key={g.heading} className="mb-20 last:mb-0">
            <Reveal>
              <div className="mb-10 flex flex-col gap-3 border-t border-line pt-8 md:flex-row md:items-end md:justify-between">
                <div>
                  <Eyebrow className="mb-4">
                    {String(gi + 1).padStart(2, "0")}
                  </Eyebrow>
                  <h2 className="display-lg text-ink">{g.heading}</h2>
                </div>
                <p className="max-w-md text-[0.9375rem] leading-relaxed text-ink-2">
                  {g.note}
                </p>
              </div>
            </Reveal>

            <div className="grid gap-px border border-line bg-line sm:grid-cols-2">
              {g.docs.map((d, i) => (
                <Reveal key={d.title} delay={(i % 2) * 70}>
                  <article className="flex h-full flex-col justify-between gap-8 bg-void p-7">
                    <div>
                      <d.icon className="h-5 w-5 text-accent" strokeWidth={1.3} />
                      <h3 className="mt-6 font-display text-xl leading-snug text-ink">
                        {d.title}
                      </h3>
                      <p className="mt-2.5 text-[0.875rem] leading-relaxed text-ink-2">
                        {d.body}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line-faint pt-5">
                      <span className="eyebrow text-ink-3">{d.meta}</span>
                      {d.file ? (
                        <CTA href={d.file} size="sm" external arrow={false}>
                          Download
                        </CTA>
                      ) : (
                        <CTA href="#request" size="sm" tone="outline" arrow={false}>
                          Request
                        </CTA>
                      )}
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </section>
        ))}
      </Container>

      {/* Brand books */}
      <section className="border-t border-line bg-deep py-20">
        <Container wide>
          <Reveal>
            <div className="mb-10 max-w-2xl">
              <Eyebrow className="mb-6">Individual brand books</Eyebrow>
              <h2 className="display-lg text-ink">
                Need a specific manufacturer&rsquo;s catalogue?
              </h2>
              <p className="lede mt-5">
                We hold current books for every brand we import. Tell us which
                and we will send the PDF, or arrange a physical book for your
                showroom.
              </p>
            </div>
          </Reveal>
          <Reveal>
            <div className="flex flex-wrap gap-2">
              {brandsByCountry.flatMap((g) =>
                g.brands.map((b) => (
                  <Pill key={b.slug}>{b.name}</Pill>
                )),
              )}
            </div>
          </Reveal>
        </Container>
      </section>

      {/* Request form */}
      <section id="request" className="scroll-mt-24 border-t border-line py-24">
        <Container wide>
          <div className="grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
            <Reveal>
              <div>
                <Eyebrow className="mb-6">Request a document</Eyebrow>
                <h2 className="display-xl text-ink">
                  Tell us what you need.
                </h2>
                <p className="lede mt-6">
                  Name the catalogue, guide or certificate in the message and we
                  will send it across — usually within the working day. Trade
                  accounts get the full technical library.
                </p>
              </div>
            </Reveal>
            <Reveal delay={120}>
              <div className="border border-line bg-deep p-8 lg:p-10">
                <EnquiryForm defaultKind="catalogue" />
              </div>
            </Reveal>
          </div>
        </Container>
      </section>
    </>
  );
}

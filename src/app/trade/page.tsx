import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { Reveal } from "@/components/motion/Reveal";
import { Container, CTA, Eyebrow, Pill } from "@/components/ui/primitives";
import { StockAvailabilityWidget } from "@/components/stock/StockAvailabilityWidget";
import { brands } from "@/lib/data/brands";
import { collections } from "@/lib/data/collections";

export const metadata: Metadata = {
  title: "Trade — Dealers, Architects & Project Teams",
  description:
    "Trade pricing, ready stock across 90+ cities, specification support and project supply from India's largest wallpaper importer.",
  alternates: { canonical: "/trade" },
};

const dealerBenefits = [
  {
    title: "Trade pricing & terms",
    body: "Structured dealer pricing with volume slabs, credit terms for established accounts, and transparent statements.",
  },
  {
    title: "Ready stock, not indents",
    body: "Deep inventory held in Hyderabad across fast-moving ranges. Order today, dispatch today on stocked references.",
  },
  {
    title: "Catalogue & sampling support",
    body: "Current books, sample folders and swatch cards supplied for your showroom, refreshed as ranges are launched.",
  },
  {
    title: "Launch previews",
    body: "See new collections before they reach the floor, so your displays lead the market rather than follow it.",
  },
  {
    title: "Nationwide logistics",
    body: "An established dispatch network reaching 90+ cities, with tracking and a service desk that answers the phone.",
  },
  {
    title: "Territory support",
    body: "We work with our dealers rather than around them — enquiries from your area come back to you.",
  },
];

const specifierServices = [
  {
    title: "Specification documentation",
    body: "Fire classifications, abrasion and scrub ratings, substrate and adhesive data — supplied as a pack, not chased line by line.",
  },
  {
    title: "Contract-grade sourcing",
    body: "Type II vinyls, acoustic and antimicrobial surfaces, digitally printed murals and wide-width goods for hospitality, healthcare and corporate.",
  },
  {
    title: "Sampling for presentations",
    body: "Full-drop samples and boards prepared for client presentations, with colourway alternatives assembled to your scheme.",
  },
  {
    title: "Quantity take-offs",
    body: "Send drawings and we will return a room-by-room roll schedule with wastage, attic stock and batch guidance.",
  },
  {
    title: "Site coordination",
    body: "Substrate advice, installer referrals and phased delivery scheduled around the programme rather than the invoice.",
  },
  {
    title: "Attic stock management",
    body: "Reserved same-batch stock held against a project for future repairs — the single most useful thing a specifier can ask for.",
  },
];

export default function TradePage() {
  return (
    <>
      <PageHero
        eyebrow="Dealers · Architects · Builders · Projects"
        crumbs={[{ label: "Trade" }]}
        titleLines={["Built to supply", "the trade."]}
        lede="Forty years of importing means our dealers get depth of stock, our specifiers get documentation that survives a tender review, and both get a phone number that gets answered."
        art={{
          kind: "ashlar",
          palette: ["#080a0d", "#242c38", "#101620", "#3a4552"],
          scale: 1.2,
        }}
        seed="trade-hero"
      >
        <div className="flex flex-wrap gap-3">
          <CTA href="#apply" tone="solid" size="lg">
            Apply for a dealership
          </CTA>
          <CTA
            href="#specifiers"
            tone="outline"
            size="lg"
          >
            Specifier services
          </CTA>
        </div>
      </PageHero>

      {/* Numbers strip */}
      <section className="border-b border-line bg-deep/60">
        <Container wide>
          <dl className="grid gap-4 py-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              [`${brands.length}+`, "International brands"],
              ["90+", "Cities served"],
              [`${collections.length}+`, "Ranges online"],
              ["1984", "Trading since"],
            ].map(([v, k]) => (
              <div key={k} className="rounded-xl border border-line bg-panel/80 p-6 backdrop-blur-md">
                <dt className="font-display text-3xl text-ink">{v}</dt>
                <dd className="eyebrow mt-2 text-ink-3">{k}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      {/* Dealers */}
      <section className="py-16 lg:py-24">
        <Container wide>
          <Reveal>
            <div className="mb-10 max-w-2xl">
              <Eyebrow className="mb-4">Dealers &amp; distributors</Eyebrow>
              <h2 className="display-xl text-ink">
                Stock a range that sells itself.
              </h2>
              <p className="lede mt-4">
                We appoint dealers carefully and support them properly. If you
                run a furnishing, interiors or hardware business and want to add
                imported wallpaper, this is the conversation to start.
              </p>
            </div>
          </Reveal>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {dealerBenefits.map((b, i) => (
              <Reveal key={b.title} delay={i * 50}>
                <div className="flex h-full flex-col justify-between rounded-2xl border border-line bg-panel/80 p-6 backdrop-blur-md transition-colors hover:border-accent/50 hover:bg-panel">
                  <div>
                    <p className="eyebrow tnum mb-3 text-accent">
                      {String(i + 1).padStart(2, "0")}
                    </p>
                    <h3 className="font-display text-xl text-ink">{b.title}</h3>
                    <p className="mt-2.5 text-[0.8125rem] leading-relaxed text-ink-2">
                      {b.body}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Specifiers */}
      <section id="specifiers" className="scroll-mt-24 border-t border-line bg-deep/50 py-16 lg:py-24">
        <Container wide>
          <Reveal>
            <div className="mb-10 max-w-2xl">
              <Eyebrow className="mb-4">Architects &amp; interior designers</Eyebrow>
              <h2 className="display-xl text-ink">
                Specification support that saves you time.
              </h2>
              <p className="lede mt-4">
                We have been supplying hospitality, healthcare, retail and
                corporate projects for decades. We know what a consultant needs
                in the pack and what a site needs on delivery day.
              </p>
            </div>
          </Reveal>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {specifierServices.map((s, i) => (
              <Reveal key={s.title} delay={i * 50}>
                <div className="flex h-full flex-col justify-between rounded-2xl border border-line bg-panel/80 p-6 backdrop-blur-md transition-colors hover:border-accent/50 hover:bg-panel">
                  <div>
                    <p className="eyebrow tnum mb-3 text-accent">
                      {String(i + 1).padStart(2, "0")}
                    </p>
                    <h3 className="font-display text-xl text-ink">{s.title}</h3>
                    <p className="mt-2.5 text-[0.8125rem] leading-relaxed text-ink-2">
                      {s.body}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <div className="mt-14 flex flex-wrap gap-3">
              <Pill tone="accent">EN 13501-1</Pill>
              <Pill tone="accent">ASTM E84 Class A</Pill>
              <Pill tone="accent">Type II contract vinyl</Pill>
              <Pill tone="accent">Antimicrobial substrates</Pill>
              <Pill tone="accent">Wide width to 137cm</Pill>
              <Pill tone="accent">Made-to-measure murals</Pill>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* Live Stock Availability Section */}
      <section className="border-t border-line py-20 bg-deep/40">
        <Container wide>
          <Reveal>
            <div className="mb-10 max-w-2xl">
              <Eyebrow className="mb-4">Live B2B Inventory</Eyebrow>
              <h2 className="display-xl text-ink">Check Warehouse Stock Instantly.</h2>
              <p className="lede mt-4">
                No need for phone calls or API charges — search any design number below for 24×7 real-time roll availability directly from our Hyderabad central depot.
              </p>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <StockAvailabilityWidget showTitle={false} />
          </Reveal>
        </Container>
      </section>

      {/* Apply */}
      <section id="apply" className="scroll-mt-24 border-t border-line bg-deep py-24">
        <Container wide>
          <div className="grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
            <Reveal>
              <div>
                <Eyebrow className="mb-6">Get started</Eyebrow>
                <h2 className="display-xl text-ink">
                  Let&rsquo;s talk terms.
                </h2>
                <p className="lede mt-6">
                  Tell us your city, the kind of work you do and the volume you
                  expect. We will come back with pricing structure, stocking
                  requirements and the catalogue support we can provide.
                </p>
                <div className="mt-10 space-y-4 border-t border-line pt-8 text-[0.9375rem] text-ink-2">
                  <p>
                    <strong className="text-ink">Existing dealers:</strong>{" "}
                    contact your account manager directly for orders, stock
                    checks and statements.
                  </p>
                  <p>
                    <strong className="text-ink">Project teams:</strong> send
                    drawings and a programme and we will return a take-off and a
                    delivery schedule.
                  </p>
                </div>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <div className="border border-line bg-void p-8 lg:p-10">
                <EnquiryForm defaultKind="dealer" />
              </div>
            </Reveal>
          </div>
        </Container>
      </section>
    </>
  );
}

import { Reveal, RevealLines } from "@/components/motion/Reveal";
import { Container, CTA, Eyebrow } from "@/components/ui/primitives";
import { site, whatsappLink } from "@/lib/site";

const routes = [
  {
    who: "Homeowners",
    what: "Bring a photo of the room and a rough measurement. We will narrow four hundred books down to five.",
    href: "/showrooms",
    cta: "Visit a gallery",
  },
  {
    who: "Architects & designers",
    what: "Specification support, fire and abrasion documentation, sampling and site coordination.",
    href: "/trade#specifiers",
    cta: "Specifier services",
  },
  {
    who: "Dealers & distributors",
    what: "Trade pricing, ready stock across 90+ cities, catalogue supply and launch previews.",
    href: "/trade",
    cta: "Become a dealer",
  },
];

export function ClosingCTA() {
  return (
    <section className="relative overflow-hidden border-t border-line py-28 lg:py-40">
      <Container wide>
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <Eyebrow className="mb-8 justify-center">Start here</Eyebrow>
          </Reveal>
          <RevealLines
            className="display-xl text-ink"
            stagger={100}
            lines={[
              "Tell us about",
              <span key="2">
                the <em className="not-italic text-accent">wall</em>.
              </span>,
            ]}
          />
          <Reveal delay={300}>
            <p className="lede mx-auto mt-7 max-w-xl">
              Send a photograph and the rough dimensions and we will come back
              with three or four options, a roll count and a price — usually
              the same day.
            </p>
          </Reveal>
          <Reveal delay={420}>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <CTA href="/contact" size="lg">
                Send an enquiry
              </CTA>
              <CTA
                href={whatsappLink(
                  "Hello Wall King — I have a wall I'd like help with.",
                )}
                tone="outline"
                size="lg"
                external
              >
                WhatsApp {site.whatsappDisplay}
              </CTA>
            </div>
          </Reveal>
        </div>

        <div className="mt-24 grid gap-px border border-line bg-line md:grid-cols-3">
          {routes.map((r, i) => (
            <Reveal key={r.who} delay={i * 90}>
              <div className="flex h-full flex-col justify-between gap-8 bg-void p-8">
                <div>
                  <h3 className="font-display text-2xl text-ink">{r.who}</h3>
                  <p className="mt-3 text-[0.875rem] leading-relaxed text-ink-2">
                    {r.what}
                  </p>
                </div>
                <CTA href={r.href} tone="ghost" size="sm" className="self-start px-0">
                  {r.cta}
                </CTA>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

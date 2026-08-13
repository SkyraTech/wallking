import type { Metadata } from "next";
import { Mail, Phone, MapPin, MessageCircle, Clock } from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { Reveal } from "@/components/motion/Reveal";
import { Container, CTA, Eyebrow } from "@/components/ui/primitives";
import { showrooms, site, mapsLink, whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact Wall King",
  description:
    "Get in touch with Wall King — three Hyderabad showrooms, nationwide distribution, and same-day responses to project and dealer enquiries.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="We usually reply the same day"
        crumbs={[{ label: "Contact" }]}
        titleLines={["Tell us about", "the wall."]}
        lede="A photograph and a rough measurement is enough to start. Send it over and we will come back with options, a roll count and a price."
        art={{
          kind: "moire",
          palette: ["#080a0e", "#222934", "#10151c", "#37404c"],
          scale: 1.4,
        }}
        seed="contact-hero"
        compact
      />

      <Container wide className="py-16 lg:py-20">
        <div className="grid gap-14 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
          <div>
            <Reveal>
              <Eyebrow className="mb-6">Send an enquiry</Eyebrow>
              <h2 className="display-lg mb-8 text-ink">
                Everything we need to help.
              </h2>
            </Reveal>
            <Reveal delay={120}>
              <EnquiryForm />
            </Reveal>
          </div>

          <div className="lg:sticky lg:top-28 lg:self-start">
            <Reveal delay={80}>
              <div className="border border-line">
                <div className="border-b border-line p-7">
                  <Eyebrow className="mb-6">Reach us directly</Eyebrow>
                  <ul className="space-y-5 text-[0.9375rem]">
                    <li className="flex gap-4">
                      <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={1.5} />
                      <div>
                        <a
                          href={whatsappLink("Hello Wall King — I'd like to enquire.")}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="link-draw text-ink hover:text-accent"
                        >
                          WhatsApp {site.whatsappDisplay}
                        </a>
                        <p className="mt-1 text-[0.75rem] text-ink-3">
                          Fastest route — send a photo of the wall
                        </p>
                      </div>
                    </li>
                    <li className="flex gap-4">
                      <Phone className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={1.5} />
                      <div>
                        <a
                          href={`tel:${site.primaryPhone}`}
                          className="link-draw text-ink hover:text-accent"
                        >
                          {site.primaryPhoneDisplay}
                        </a>
                        <p className="mt-1 text-[0.75rem] text-ink-3">
                          Head office, Abids
                        </p>
                      </div>
                    </li>
                    <li className="flex gap-4">
                      <Mail className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={1.5} />
                      <div>
                        <a
                          href={`mailto:${site.email}`}
                          className="link-draw text-ink hover:text-accent"
                        >
                          {site.email}
                        </a>
                        <p className="mt-1 text-[0.75rem] text-ink-3">
                          Enquiries, catalogues and trade accounts
                        </p>
                      </div>
                    </li>
                    <li className="flex gap-4">
                      <Clock className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={1.5} />
                      <div>
                        <p className="text-ink">Mon–Sat · 10:30 – 20:00</p>
                        <p className="mt-1 text-[0.75rem] text-ink-3">
                          Jubilee Hills open Sundays until 20:30
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="divide-y divide-line-faint">
                  {showrooms.map((s) => (
                    <a
                      key={s.id}
                      href={mapsLink(s.mapQuery)}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="group block p-7 transition-colors hover:bg-deep"
                    >
                      <p className="eyebrow text-accent">{s.role}</p>
                      <p className="mt-2.5 font-display text-xl text-ink">
                        {s.name}
                      </p>
                      <p className="mt-2 flex gap-2.5 text-[0.8125rem] leading-relaxed text-ink-2">
                        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-3" strokeWidth={1.4} />
                        <span>
                          {s.lines.join(", ")}, {s.city} {s.pin}
                        </span>
                      </p>
                    </a>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal delay={160}>
              <div className="mt-8 border border-line bg-deep p-7">
                <Eyebrow className="mb-4">Trade &amp; projects</Eyebrow>
                <p className="text-[0.875rem] leading-relaxed text-ink-2">
                  Dealers, architects, builders and project teams have their own
                  route in — trade pricing, specification support, sampling and
                  site coordination.
                </p>
                <CTA href="/trade" tone="outline" size="sm" className="mt-5">
                  Trade services
                </CTA>
              </div>
            </Reveal>
          </div>
        </div>
      </Container>
    </>
  );
}

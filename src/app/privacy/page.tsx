import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/ui/primitives";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Wall King handles the information you share with us.",
  alternates: { canonical: "/privacy" },
  robots: { index: false, follow: true },
};

/**
 * Placeholder policy — accurate for the site as built (no accounts, no
 * analytics, no third-party trackers, enquiries handled over WhatsApp and
 * email). It MUST be reviewed by Wall King's legal advisor before launch,
 * and updated the moment analytics, a CRM or the dealer portal is added.
 */

const sections = [
  {
    h: "What we collect",
    p: [
      "When you send an enquiry through this website, the details you type — your name, phone number, email address, city and message — are passed directly to Wall King through WhatsApp or your own email client. This site does not store them on a server of its own.",
      "The site sets one item of data in your browser: your light or dark appearance preference. It stays on your device, is not sent anywhere, and is not used to identify you.",
    ],
  },
  {
    h: "What we do with it",
    p: [
      "We use your details only to answer your enquiry, prepare a quotation, arrange a showroom visit or send a catalogue you have asked for. We do not sell, rent or share your information with third parties for marketing.",
    ],
  },
  {
    h: "Third-party services",
    p: [
      "Some pages embed Google Maps so you can find our showrooms, and enquiry buttons open WhatsApp. Those services are operated by Google and Meta respectively and have their own privacy policies, which apply once you interact with them.",
    ],
  },
  {
    h: "How long we keep it",
    p: [
      "Enquiry correspondence is retained for as long as needed to serve you and to meet our legal and accounting obligations, then deleted.",
    ],
  },
  {
    h: "Your choices",
    p: [
      `You can ask us what information we hold about you, ask us to correct it, or ask us to delete it. Write to ${site.email} and we will respond.`,
    ],
  },
];

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        crumbs={[{ label: "Privacy" }]}
        titleLines={["Privacy policy"]}
        lede="Short, because we collect very little."
        compact
      />
      <Container>
        <div className="mx-auto max-w-[42rem] py-16">
          {sections.map((s) => (
            <section key={s.h} className="mt-12 first:mt-0">
              <h2 className="display-md text-ink">{s.h}</h2>
              {s.p.map((p, i) => (
                <p key={i} className="mt-4 text-[1.0625rem] leading-[1.78] text-ink-2">
                  {p}
                </p>
              ))}
            </section>
          ))}
          <p className="mt-16 border-t border-line pt-6 text-[0.8125rem] leading-relaxed text-ink-3">
            This policy describes the website as currently built. It should be
            reviewed by Wall King&rsquo;s legal advisor before launch, and
            revised if analytics, a CRM or the dealer portal are introduced.
          </p>
        </div>
      </Container>
    </>
  );
}

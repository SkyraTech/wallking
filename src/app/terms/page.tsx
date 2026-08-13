import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/ui/primitives";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms governing use of the Wall King website.",
  alternates: { canonical: "/terms" },
  robots: { index: false, follow: true },
};

/**
 * Placeholder terms — drafted to be accurate about this site (a catalogue and
 * enquiry site, not a shop). Must be reviewed by Wall King's legal advisor
 * before launch, and replaced entirely if online ordering is introduced.
 */

const sections = [
  {
    h: "About this site",
    p: [
      `This website is operated by ${site.name}, Hyderabad. It is a catalogue and enquiry site. Nothing on it constitutes an offer to sell, and no order is accepted until confirmed by us in writing.`,
    ],
  },
  {
    h: "Colour, pattern and availability",
    p: [
      "Wallcoverings are physical goods photographed and reproduced on screens of varying calibration. Colours, textures and pattern scale shown here are indicative and must be confirmed against a physical sample before ordering.",
      "Stock indications are given in good faith and change continuously. Availability is confirmed at the time of order, not at the time of browsing.",
    ],
  },
  {
    h: "Estimates and calculators",
    p: [
      "The wallpaper calculator produces an indicative quantity based on the figures you enter. It cannot account for site conditions, irregular walls, unusual openings or installer preference. Final quantities are the responsibility of the purchaser and their installer, and we recommend confirming with our team before ordering.",
      "Prices shown by the calculator are indicative material costs only and exclude installation, adhesive, delivery and applicable taxes.",
    ],
  },
  {
    h: "Intellectual property",
    p: [
      "Brand names, logos and pattern designs shown on this site belong to their respective manufacturers. Site content, layout and text are the property of Wall King and may not be reproduced without permission.",
    ],
  },
  {
    h: "Liability",
    p: [
      "We take care to keep this site accurate but do not warrant that it is free of error or continuously available. To the extent permitted by law, Wall King is not liable for loss arising from reliance on information published here without confirmation from our team.",
    ],
  },
  {
    h: "Contact",
    p: [
      `Questions about these terms can be sent to ${site.email}.`,
    ],
  },
];

export default function TermsPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        crumbs={[{ label: "Terms" }]}
        titleLines={["Terms of use"]}
        lede="What this site is, and what it is not."
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
            Draft terms reflecting the site as built. Review with Wall
            King&rsquo;s legal advisor before launch, and replace if online
            ordering or the dealer portal is introduced.
          </p>
        </div>
      </Container>
    </>
  );
}

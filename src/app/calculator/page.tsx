import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { WallpaperCalculator } from "@/components/tools/WallpaperCalculator";
import { Container, CTA, Eyebrow } from "@/components/ui/primitives";
import { Reveal } from "@/components/motion/Reveal";

export const metadata: Metadata = {
  title: "Wallpaper Calculator",
  description:
    "Work out exactly how many rolls of wallpaper you need. Enter wall dimensions, doors and windows and get rolls, adhesive and an indicative cost.",
  alternates: { canonical: "/calculator" },
};

const notes = [
  {
    q: "Why not just divide wall area by roll area?",
    a: "Because you cannot join half a drop mid-wall. Every drop has to be full height, and only whole drops can be cut from a roll — the remainder is offcut. Area arithmetic routinely under-orders by one to two rolls.",
  },
  {
    q: "What does the pattern repeat change?",
    a: "On a patterned paper each drop is cut to a whole number of repeats so the motif lines up across the seam. A 3 m wall in a 64 cm repeat needs a 3.20 m cut, not 3.00 m. That difference compounds across a room.",
  },
  {
    q: "Why order extra?",
    a: "Ten per cent covers trimming, a mis-cut and a future repair. Keep the offcuts with the batch number written on the back — a patch from the same batch is invisible, one from a new batch never quite is.",
  },
  {
    q: "Does it matter if I split the order?",
    a: "Yes. Order every roll for a room in one go, from one batch. Dye lots shift between production runs and the difference shows up under raking light even when it is invisible in the shop.",
  },
];

export default function CalculatorPage() {
  return (
    <>
      <PageHero
        eyebrow="Tools · Estimating"
        crumbs={[{ label: "Wallpaper Calculator" }]}
        titleLines={["How many rolls?"]}
        lede="Enter the wall, deduct the openings, choose the paper. We do the drop arithmetic the way a fitter does it — including the repeat, which is where most estimates go wrong."
        art={{
          kind: "geometric",
          palette: ["#0a0c10", "#252c37", "#12171f", "#39434f"],
          scale: 1.4,
        }}
        seed="calculator-hero"
        compact
      />

      <Container wide className="py-16 lg:py-20">
        <WallpaperCalculator />
      </Container>

      <section className="border-t border-line bg-deep py-24">
        <Container wide>
          <Reveal>
            <div className="mb-14 max-w-2xl">
              <Eyebrow className="mb-6">How the numbers work</Eyebrow>
              <h2 className="display-lg text-ink">
                Four things worth knowing before you order.
              </h2>
            </div>
          </Reveal>

          <div className="grid gap-x-14 gap-y-10 md:grid-cols-2">
            {notes.map((n, i) => (
              <Reveal key={n.q} delay={i * 70}>
                <div className="border-t border-line pt-6">
                  <h3 className="font-display text-xl text-ink">{n.q}</h3>
                  <p className="mt-3 text-[0.875rem] leading-relaxed text-ink-2">
                    {n.a}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <div className="mt-16 flex flex-wrap items-center gap-4 border-t border-line pt-10">
              <p className="max-w-md text-[0.9375rem] leading-relaxed text-ink-2">
                Working on something larger — a floor of rooms, a hotel, a
                sales gallery? Send us the drawings and we will do the take-off
                properly.
              </p>
              <div className="flex flex-wrap gap-3 sm:ml-auto">
                <CTA href="/contact" size="lg">
                  Request a take-off
                </CTA>
                <CTA href="/collections" tone="outline" size="lg">
                  Browse papers
                </CTA>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}

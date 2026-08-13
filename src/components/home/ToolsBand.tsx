import Link from "next/link";
import { Calculator, ScanSearch, Download, PlayCircle } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { Container, Eyebrow, Arrow } from "@/components/ui/primitives";

const tools = [
  {
    href: "/calculator",
    icon: Calculator,
    title: "Wallpaper Calculator",
    body: "Wall dimensions in, rolls out — with door and window deductions, adhesive quantity and an indicative budget.",
    meta: "Takes about a minute",
  },
  {
    href: "/collections",
    icon: ScanSearch,
    title: "Search by design number",
    body: "Type 7914-05 and land on the paper. Works with or without the dash, from anywhere on the site.",
    meta: "Press ⌘K",
  },
  {
    href: "/downloads",
    icon: Download,
    title: "Download Centre",
    body: "Catalogues, installation guides, care instructions and technical data sheets, all in one place.",
    meta: "PDF · always current",
  },
  {
    href: "/videos",
    icon: PlayCircle,
    title: "Video Gallery",
    body: "Installation method, collection launches, showroom walkthroughs and customer projects.",
    meta: "Watch before you fit",
  },
];

export function ToolsBand() {
  return (
    <section className="relative overflow-hidden py-20 lg:py-28">
      <Container wide>
        <Reveal>
          <div className="mb-10 max-w-2xl">
            <Eyebrow className="mb-4">Practical tools</Eyebrow>
            <h2 className="display-lg text-ink">
              Built for architects, designers &amp; specifiers.
            </h2>
          </div>
        </Reveal>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {tools.map((t, i) => (
            <Reveal key={t.href} delay={i * 80}>
              <Link
                href={t.href}
                className="group/btn relative flex h-full flex-col justify-between rounded-2xl border border-line bg-panel/85 p-6 backdrop-blur-md transition-all duration-400 hover:-translate-y-1 hover:border-accent/60 hover:bg-panel hover:shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent-soft text-accent transition-transform duration-500 group-hover/btn:scale-110">
                      <t.icon className="h-5 w-5" strokeWidth={1.5} />
                    </div>
                    <span className="eyebrow rounded-full border border-line bg-deep/60 px-2.5 py-1 text-[0.5625rem] text-ink-3">
                      {t.meta}
                    </span>
                  </div>

                  <h3 className="mt-6 font-display text-xl text-ink transition-colors duration-300 group-hover/btn:text-accent">
                    {t.title}
                  </h3>
                  <p className="mt-2.5 text-[0.8125rem] leading-relaxed text-ink-2">
                    {t.body}
                  </p>
                </div>

                <div className="mt-8 flex items-center justify-between border-t border-line-faint pt-4">
                  <span className="eyebrow text-[0.625rem] text-accent">Launch tool →</span>
                  <Arrow className="text-accent" />
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

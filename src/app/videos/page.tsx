import type { Metadata } from "next";
import { Play, Clock } from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";
import { RoomPhoto as WallpaperSwatch } from "@/components/art/RoomPhoto";
import { type SwatchSpec } from "@/components/art/WallpaperSwatch";
import { Reveal } from "@/components/motion/Reveal";
import { Container, CTA, Eyebrow, cx } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Video Gallery — Installation, Launches & Showroom Tours",
  description:
    "Watch wallpaper installation method videos, collection launches, showroom walkthroughs and customer projects from Wall King.",
  alternates: { canonical: "/videos" },
};

/**
 * Video shelf.
 *
 * `youtubeId` is intentionally optional: until real footage is supplied each
 * card renders as a planned episode rather than a broken player. Add an ID
 * and the card becomes a click-to-load embed — click-to-load rather than an
 * always-on iframe so YouTube does not set cookies or cost the page 700kb
 * before anyone has pressed play.
 */
type Video = {
  title: string;
  body: string;
  duration: string;
  category: string;
  youtubeId?: string;
  art: SwatchSpec;
};

const videos: Video[] = [
  {
    title: "Hanging non-woven wallpaper: the full method",
    body: "Paste-the-wall from bare plaster to finished seam, filmed in real time with an installer talking through every decision.",
    duration: "14:20",
    category: "Installation",
    art: { kind: "grasscloth", palette: ["#090b0f", "#232a35", "#12171f", "#333c47"], scale: 1.3 },
  },
  {
    title: "Matching a large repeat without wasting a roll",
    body: "How to set out a 64cm repeat across a wall with a door in it, and where the offcuts should come from.",
    duration: "09:05",
    category: "Installation",
    art: { kind: "trellis", palette: ["#090b0f", "#28303b", "#131922", "#3d4753"], scale: 1.4 },
  },
  {
    title: "Jubilee Hills Experience Centre — walkthrough",
    body: "A full tour of the flagship gallery, room by room, showing how the books are organised and what is on display.",
    duration: "07:40",
    category: "Showroom",
    art: { kind: "arabesque", palette: ["#080a0d", "#242c38", "#101620", "#3a4552"], scale: 1.4 },
  },
  {
    title: "Onyx by Zambaiti Parati — collection launch",
    body: "The making of the range, the four-pass printing process, and how the metallic layer behaves under different light.",
    duration: "05:12",
    category: "Launch",
    art: { kind: "marble", palette: ["#080a0d", "#2a323e", "#111720", "#414b58"], scale: 1.4 },
  },
  {
    title: "Fitting a made-to-measure mural",
    body: "Setting out the wall, sequencing panels, aligning the horizon and trimming at the ceiling line.",
    duration: "11:48",
    category: "Installation",
    art: { kind: "botanical", palette: ["#080a0d", "#26303a", "#111820", "#3b4653"], scale: 1.35 },
  },
  {
    title: "A hotel corridor, start to finish",
    body: "A contract installation in Hyderabad — 180 running metres of Type II vinyl over four nights.",
    duration: "08:33",
    category: "Projects",
    art: { kind: "ashlar", palette: ["#0a0c10", "#252c37", "#12171f", "#39434f"], scale: 1.3 },
  },
  {
    title: "Cleaning wallpaper without ruining it",
    body: "What each washability class tolerates, demonstrated on real samples — including what happens when you get it wrong.",
    duration: "06:15",
    category: "Care",
    art: { kind: "moire", palette: ["#080a0e", "#222934", "#10151c", "#37404c"], scale: 1.5 },
  },
  {
    title: "Customers on why they chose wallpaper",
    body: "Three Hyderabad homeowners, two years after installation, on what they would do the same and what they would change.",
    duration: "10:02",
    category: "Testimonials",
    art: { kind: "stripe", palette: ["#090b0f", "#242b36", "#12171e", "#353e4a"], scale: 1.6 },
  },
];

const categories = Array.from(new Set(videos.map((v) => v.category)));

export default function VideosPage() {
  return (
    <>
      <PageHero
        eyebrow="Installation · Launches · Walkthroughs"
        crumbs={[{ label: "Video Gallery" }]}
        titleLines={["Watch it done", "properly first."]}
        lede="Method videos filmed with real installers, collection launches straight from the mill, and walkthroughs of all three Hyderabad galleries."
        art={{
          kind: "herringbone",
          palette: ["#0a0c10", "#252c37", "#12171f", "#39434f"],
          scale: 1.4,
        }}
        seed="videos-hero"
        compact
      >
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <span
              key={c}
              className="eyebrow border border-line px-3 py-2 text-[0.5625rem] text-ink-2"
            >
              {c}
            </span>
          ))}
        </div>
      </PageHero>

      <Container wide className="py-16 lg:py-20">
        <div className="grid gap-x-8 gap-y-14 md:grid-cols-2 xl:grid-cols-3">
          {videos.map((v, i) => (
            <Reveal key={v.title} delay={(i % 3) * 80}>
              <article className="group">
                <div className="relative aspect-video overflow-hidden border border-line bg-deep">
                  <WallpaperSwatch
                    spec={v.art}
                    seed={`video-${i}`}
                    className={cx(
                      "h-full w-full transition-transform duration-[1600ms] [transition-timing-function:var(--ease-cut)]",
                      v.youtubeId && "group-hover:scale-105",
                    )}
                    lit={false}
                  />
                  <div className="absolute inset-0 bg-ink/45" />

                  <div className="absolute inset-0 grid place-items-center">
                    <span
                      className={cx(
                        "grid h-16 w-16 place-items-center rounded-full border transition-all duration-700 [transition-timing-function:var(--ease-cut)]",
                        v.youtubeId
                          ? "border-white/60 text-white group-hover:scale-110 group-hover:border-accent group-hover:bg-accent"
                          : "border-white/25 text-white/65",
                      )}
                    >
                      <Play className="ml-0.5 h-5 w-5" strokeWidth={1.4} fill="currentColor" />
                    </span>
                  </div>

                  <span className="eyebrow absolute left-3 top-3 bg-void/92 px-2 py-1.5 text-[0.5625rem] text-ink backdrop-blur-sm">
                    {v.category}
                  </span>
                  <span className="tnum absolute bottom-3 right-3 flex items-center gap-1.5 bg-ink/70 px-2 py-1 text-[0.6875rem] text-white backdrop-blur-sm">
                    <Clock className="h-3 w-3" strokeWidth={1.6} />
                    {v.duration}
                  </span>

                  {!v.youtubeId && (
                    <span className="eyebrow absolute bottom-3 left-3 bg-accent px-2 py-1.5 text-[0.5625rem] text-void">
                      Filming
                    </span>
                  )}
                </div>

                <h2 className="mt-5 font-display text-xl leading-snug text-ink">
                  {v.title}
                </h2>
                <p className="mt-2.5 text-[0.875rem] leading-relaxed text-ink-2">
                  {v.body}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </Container>

      <section className="border-t border-line bg-deep py-20">
        <Container wide>
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <Eyebrow className="mb-6 justify-center">
                The gallery is being filmed now
              </Eyebrow>
              <h2 className="display-lg text-ink">
                Want a walkthrough before the videos land?
              </h2>
              <p className="lede mt-5">
                Our consultants will take you through any of this in person, or
                over a video call if you are outside Hyderabad. Ask and we will
                arrange it.
              </p>
              <div className="mt-9 flex flex-wrap justify-center gap-3">
                <CTA href="/contact" size="lg">
                  Request a walkthrough
                </CTA>
                <CTA href="/showrooms" tone="outline" size="lg">
                  Visit a gallery
                </CTA>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}

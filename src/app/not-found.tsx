import Link from "next/link";
import { RoomPhoto as WallpaperSwatch } from "@/components/art/RoomPhoto";
import { Container, CTA, Eyebrow } from "@/components/ui/primitives";
import { byNewest } from "@/lib/data/collections";

export default function NotFound() {
  const suggestions = byNewest.slice(0, 3);

  return (
    <section className="relative isolate -mt-20 overflow-hidden pt-20 lg:-mt-24 lg:pt-24">
      <div className="absolute inset-0 -z-10">
        <WallpaperSwatch
          spec={{
            kind: "trellis",
            palette: ["#0a0c10", "#252c37", "#12171f", "#39434f"],
            scale: 1.6,
          }}
          seed="not-found"
          className="h-full w-full"
          lit={false}
        />
        <div className="absolute inset-0 bg-void/94" />
      </div>

      <Container>
        <div className="flex min-h-[70vh] flex-col justify-center py-24">
          <Eyebrow className="mb-7">Error 404</Eyebrow>
          <h1 className="display-hero max-w-3xl text-ink">
            This wall is
            <br />
            <em className="not-italic text-accent">blank.</em>
          </h1>
          <p className="lede mt-8 max-w-lg">
            The page you were after has moved or never existed. The catalogue is
            where most people are heading — or search any design number with
            ⌘K.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <CTA href="/collections" size="lg">
              Browse collections
            </CTA>
            <CTA href="/" tone="outline" size="lg">
              Back to home
            </CTA>
          </div>

          <div className="mt-20 border-t border-line pt-8">
            <Eyebrow className="mb-6">Recently added</Eyebrow>
            <ul className="grid gap-6 sm:grid-cols-3">
              {suggestions.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/collections/${c.slug}`}
                    className="group flex items-center gap-4"
                  >
                    <span className="block h-16 w-[3.25rem] shrink-0 overflow-hidden border border-line">
                      <WallpaperSwatch
                        spec={c.colourways[0].art}
                        seed={c.slug}
                        className="h-full w-full"
                        lit={false}
                      />
                    </span>
                    <span>
                      <span className="block font-display text-lg text-ink transition-colors group-hover:text-accent">
                        {c.name}
                      </span>
                      <span className="block text-[0.75rem] text-ink-3">
                        {c.styles[0]}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}

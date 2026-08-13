import Link from "next/link";
import { MapPin, Phone, Mail, ArrowUpRight } from "lucide-react";
import { showrooms, site, mapsLink, whatsappLink } from "@/lib/site";
import { brandsByCountry } from "@/lib/data/brands";
import { Container, Eyebrow, cx } from "@/components/ui/primitives";
import { LogoMark } from "./Logo";

const columns = [
  {
    title: "Explore",
    links: [
      { label: "All Collections", href: "/collections" },
      { label: "New Arrivals", href: "/new-arrivals" },
      { label: "Brand Portfolio", href: "/brands" },
      { label: "Showrooms", href: "/showrooms" },
      { label: "Journal", href: "/journal" },
    ],
  },
  {
    title: "Tools",
    links: [
      { label: "Wallpaper Calculator", href: "/calculator" },
      { label: "Download Centre", href: "/downloads" },
      { label: "Video Gallery", href: "/videos" },
      { label: "Design No. Search", href: "/collections" },
    ],
  },
  {
    title: "Trade",
    links: [
      { label: "Become a Dealer", href: "/trade" },
      { label: "Architects & Designers", href: "/trade#specifiers" },
      { label: "Project Enquiries", href: "/contact" },
      { label: "About Wall King", href: "/about" },
    ],
  },
];

export function SiteFooter() {
  const year = new Date().getFullYear();
  const countries = brandsByCountry.map((g) => g.country);

  return (
    <footer className="relative mt-32 overflow-hidden border-t border-line bg-deep">
      <Container className="relative">
        {/* Top band — the pitch and the showrooms */}
        <div className="grid gap-16 py-20 lg:grid-cols-[1.1fr_1fr] lg:gap-24 lg:py-28">
          <div>
            <Eyebrow className="mb-6">Since 1984</Eyebrow>
            <p className="display-lg max-w-xl text-ink">
              Four decades of putting the world&rsquo;s best wallpaper on Indian
              walls.
            </p>
            <p className="lede mt-6 max-w-lg">
              Twenty-five international brands, ninety-plus cities, three
              Hyderabad galleries and a family that still picks every collection
              by hand.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-x-3 gap-y-2">
              {countries.map((c) => (
                <span
                  key={c}
                  className="eyebrow border border-line px-2.5 py-1.5 text-[0.5625rem] text-ink-3"
                >
                  {c}
                </span>
              ))}
            </div>

            <div className="mt-12 flex flex-wrap gap-6 text-sm">
              <a
                href={`mailto:${site.email}`}
                className="link-draw flex items-center gap-2 text-ink transition-colors hover:text-accent"
              >
                <Mail className="h-4 w-4" strokeWidth={1.4} />
                {site.email}
              </a>
              <a
                href={whatsappLink("Hello Wall King — I'd like to enquire.")}
                target="_blank"
                rel="noreferrer noopener"
                className="link-draw flex items-center gap-2 text-ink transition-colors hover:text-accent"
              >
                <Phone className="h-4 w-4" strokeWidth={1.4} />
                {site.whatsappDisplay}
              </a>
            </div>
          </div>

          <div className="grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-1">
            {showrooms.map((s) => (
              <a
                key={s.id}
                href={mapsLink(s.mapQuery)}
                target="_blank"
                rel="noreferrer noopener"
                className={cx(
                  "group relative bg-deep p-6 transition-colors duration-500 hover:bg-panel",
                  s.flagship && "lg:border-l-2 lg:border-l-accent",
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="eyebrow text-accent">{s.role}</p>
                    <p className="mt-2.5 font-display text-xl text-ink">
                      {s.name}
                    </p>
                  </div>
                  <ArrowUpRight
                    className="h-4 w-4 shrink-0 text-ink-3 transition-all duration-500 [transition-timing-function:var(--ease-cut)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
                    strokeWidth={1.4}
                  />
                </div>
                <address className="mt-3 flex gap-2.5 text-[0.8125rem] not-italic leading-relaxed text-ink-2">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-3" strokeWidth={1.4} />
                  <span>
                    {s.lines.join(", ")}, {s.city} {s.pin}
                  </span>
                </address>
                <p className="mt-2 pl-6 text-[0.75rem] text-ink-3">{s.hours}</p>
              </a>
            ))}
          </div>
        </div>

        {/* Link columns */}
        <div className="grid gap-12 border-t border-line py-16 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <LogoMark className="h-11 w-11" />
            <p className="mt-5 max-w-xs text-[0.8125rem] leading-relaxed text-ink-3">
              Wall King · House of Wallpaper. Importer and distributor of
              international wallcoverings, headquartered in Hyderabad.
            </p>
          </div>

          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <p className="eyebrow mb-5 text-ink-3">{col.title}</p>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="link-draw text-[0.875rem] text-ink-2 transition-colors hover:text-ink"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="flex flex-col gap-4 border-t border-line py-8 text-[0.75rem] text-ink-3 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.name}. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="link-draw hover:text-ink">
              Privacy
            </Link>
            <Link href="/terms" className="link-draw hover:text-ink">
              Terms
            </Link>
            <Link href="/sitemap.xml" className="link-draw hover:text-ink">
              Sitemap
            </Link>
          </div>
        </div>
      </Container>

      {/* Oversized wordmark, cropped by the page edge */}
      <div
        aria-hidden
        className="pointer-events-none select-none overflow-hidden"
      >
        <p className="font-display translate-y-[22%] whitespace-nowrap text-center text-[19vw] leading-none tracking-[-0.03em] text-ink opacity-[0.055]">
          WALL KING
        </p>
      </div>
    </footer>
  );
}

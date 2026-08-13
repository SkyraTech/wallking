"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Menu, X, Phone } from "lucide-react";
import { nav, site, whatsappLink } from "@/lib/site";
import { scrollEngine } from "@/lib/scroll-engine";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Wordmark } from "./Logo";
import { DesignSearch } from "./DesignSearch";
import { CTA, Container, cx } from "@/components/ui/primitives";
import { LiquidGlassButton } from "@/components/ui/LiquidGlassButton";

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  // Header condenses once the hero is behind it.
  useEffect(() => {
    return scrollEngine.onFrame((s) => {
      const next = s.y > 24;
      setScrolled((prev) => (prev === next ? prev : next));
    });
  }, []);

  // Close any open menu when the route changes. Adjusting state during render
  // (React's documented pattern for "reset when a prop changes") rather than
  // in an effect, so the closed menu is in the very first render of the new
  // page instead of flashing open for a frame.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setMenuOpen(false);
    setOpenGroup(null);
  }

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // ⌘K / Ctrl-K anywhere on the site.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const isActive = useCallback(
    (href: string) =>
      href === "/" ? pathname === "/" : pathname.startsWith(href.split("?")[0]),
    [pathname],
  );

  return (
    <>
      {/* Utility strip — transparent overlay, scrolls away */}
      <div className="hidden border-b border-transparent bg-transparent lg:block">
        <Container>
          <div className="flex h-9 items-center justify-between text-[0.6875rem] tracking-[0.06em] text-ink-2 font-medium">
            <p>
              India&rsquo;s largest importer &amp; distributor of international
              wallpapers · Since 1984
            </p>
            <div className="flex items-center gap-6">
              <a
                href={`tel:${site.primaryPhone}`}
                className="link-draw flex items-center gap-2 transition-colors hover:text-ink"
              >
                <Phone className="h-3 w-3" strokeWidth={1.6} />
                {site.primaryPhoneDisplay}
              </a>
              <a
                href={whatsappLink(
                  "Hello Wall King — I'd like to enquire about a collection.",
                )}
                target="_blank"
                rel="noreferrer noopener"
                className="link-draw transition-colors hover:text-ink"
              >
                WhatsApp
              </a>
              <Link href="/trade" className="link-draw transition-colors hover:text-ink">
                Dealer &amp; trade
              </Link>
            </div>
          </div>
        </Container>
      </div>

      <header
        data-scrolled={scrolled || undefined}
        onMouseLeave={() => setOpenGroup(null)}
        className={cx(
          "sticky top-0 z-[120] border-b transition-[background-color,border-color,box-shadow,backdrop-filter] duration-500 [transition-timing-function:var(--ease-cut)]",
          scrolled
            ? "border-line bg-void/85 backdrop-blur-xl supports-[backdrop-filter]:bg-void/70"
            : "border-transparent bg-transparent",
        )}
      >
        <Container wide className="px-6 sm:px-8 lg:px-10">
          <div
            className={cx(
              "flex items-center justify-between gap-6 transition-[height] duration-500 [transition-timing-function:var(--ease-cut)]",
              scrolled ? "h-14" : "h-16 lg:h-18",
            )}
          >
            <Link
              href="/"
              onClick={(e) => {
                if (pathname === "/") {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
              className="group shrink-0 min-w-0"
              aria-label="Wall King — home"
            >
              <Wordmark compact={scrolled} />
            </Link>

            {/* Desktop nav — Liquid Glass Buttons */}
            <nav className="hidden items-center gap-2 lg:flex shrink-0" aria-label="Primary">
              {nav.map((item) => {
                const active = isActive(item.href);
                return (
                  <div
                    key={item.label}
                    className="relative"
                    onMouseEnter={() => setOpenGroup(item.children ? item.label : null)}
                  >
                    <Link
                      href={item.href}
                      data-active={active || undefined}
                      aria-expanded={item.children ? openGroup === item.label : undefined}
                    >
                      <LiquidGlassButton
                        variant={active ? "active" : "glass"}
                        size="md"
                        className="font-bold tracking-wide"
                      >
                        <span>{item.label}</span>
                        {item.children && (
                          <span className="text-[0.625rem] opacity-75 transition-transform duration-300 group-hover:rotate-180">
                            ▼
                          </span>
                        )}
                      </LiquidGlassButton>
                    </Link>

                    {item.children && openGroup === item.label && (
                      <div className="absolute left-1/2 top-full z-10 w-[22rem] -translate-x-1/2 pt-3">
                        <div
                          data-reveal
                          data-revealed
                          className="overflow-hidden rounded-2xl border border-line-2 bg-panel/95 p-2 shadow-2xl backdrop-blur-xl"
                        >
                          {item.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              className="group/i block rounded-xl px-4 py-3 transition-all duration-300 hover:bg-deep/80"
                            >
                              <span className="flex items-center justify-between text-[0.875rem] font-semibold text-ink transition-colors group-hover/i:text-accent">
                                {child.label}
                                <span
                                  aria-hidden
                                  className="translate-x-0 text-accent opacity-0 transition-all duration-300 group-hover/i:translate-x-1 group-hover/i:opacity-100"
                                >
                                  →
                                </span>
                              </span>
                              {child.description && (
                                <span className="mt-0.5 block text-[0.75rem] leading-relaxed text-ink-3">
                                  {child.description}
                                </span>
                              )}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Search designs and collections"
                className="group flex h-9 items-center gap-2.5 rounded-full border border-line px-3.5 text-ink-2 transition-colors duration-500 hover:border-accent hover:text-accent"
              >
                <Search className="h-4 w-4" strokeWidth={1.5} />
                <span className="hidden text-[0.75rem] tracking-[0.02em] xl:inline">
                  Design no.
                </span>
                <kbd className="hidden rounded-xs border border-line px-1.5 py-0.5 text-[0.5625rem] text-ink-3 xl:inline">
                  ⌘K
                </kbd>
              </button>

              <ThemeToggle />

              <CTA href="/contact" size="sm" className="hidden sm:inline-flex" arrow={false}>
                Enquire
              </CTA>

              <button
                onClick={() => setMenuOpen(true)}
                aria-label="Open menu"
                className="grid h-9 w-9 place-items-center text-ink lg:hidden"
              >
                <Menu className="h-5 w-5" strokeWidth={1.4} />
              </button>
            </div>
          </div>
        </Container>
      </header>

      {/* Mobile overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-[190] flex flex-col bg-void lg:hidden">
          <Container>
            <div className="flex h-20 items-center justify-between">
              <Wordmark compact />
              <button
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="grid h-10 w-10 place-items-center text-ink"
              >
                <X className="h-5 w-5" strokeWidth={1.4} />
              </button>
            </div>
          </Container>

          <nav className="flex-1 overflow-y-auto" aria-label="Mobile">
            <Container>
              <ul className="divide-y divide-line-faint border-y border-line-faint">
                {nav.map((item, i) => (
                  <li key={item.label} style={{ "--reveal-delay": `${i * 45}ms` } as React.CSSProperties}>
                    <Link
                      href={item.href}
                      className="flex items-baseline justify-between py-5"
                    >
                      <span className="display-md text-ink">{item.label}</span>
                      <span className="eyebrow tnum text-ink-3">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </Link>
                    {item.children && (
                      <ul className="-mt-1 flex flex-wrap gap-x-5 gap-y-2 pb-5">
                        {item.children.map((c) => (
                          <li key={c.href}>
                            <Link
                              href={c.href}
                              className="text-[0.8125rem] text-ink-3 transition-colors hover:text-accent"
                            >
                              {c.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>

              <div className="flex flex-col gap-3 py-8">
                <CTA href="/contact" size="lg">
                  Enquire now
                </CTA>
                <CTA
                  href={whatsappLink("Hello Wall King — I'd like to enquire.")}
                  tone="outline"
                  size="lg"
                  external
                >
                  WhatsApp us
                </CTA>
                <a
                  href={`tel:${site.primaryPhone}`}
                  className="mt-2 text-center text-sm text-ink-3"
                >
                  {site.primaryPhoneDisplay}
                </a>
              </div>
            </Container>
          </nav>
        </div>
      )}

      {searchOpen && <DesignSearch onClose={() => setSearchOpen(false)} />}
    </>
  );
}

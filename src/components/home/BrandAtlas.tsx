"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { Container, CTA, Eyebrow, cx } from "@/components/ui/primitives";
import { SectionBackdrop } from "@/components/ui/SectionBackdrop";
import { brands, countryOrder, type Country } from "@/lib/data/brands";

const countryGradients: Record<Country, { active: string; card: string; badge: string }> = {
  Germany: {
    active: "bg-gradient-to-r from-amber-600 via-yellow-700 to-stone-900 text-white shadow-md shadow-amber-600/20 border-amber-500/50",
    card: "group-hover:border-amber-500/70 group-hover:shadow-amber-500/10",
    badge: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-300",
  },
  Italy: {
    active: "bg-gradient-to-r from-emerald-600 via-teal-700 to-rose-800 text-white shadow-md shadow-emerald-600/20 border-emerald-500/50",
    card: "group-hover:border-emerald-500/70 group-hover:shadow-emerald-500/10",
    badge: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
  },
  Netherlands: {
    active: "bg-gradient-to-r from-orange-600 via-amber-600 to-blue-900 text-white shadow-md shadow-orange-600/20 border-orange-500/50",
    card: "group-hover:border-orange-500/70 group-hover:shadow-orange-500/10",
    badge: "border-orange-500/30 bg-orange-500/10 text-orange-600 dark:text-orange-300",
  },
  Belgium: {
    active: "bg-gradient-to-r from-yellow-600 via-red-600 to-slate-900 text-white shadow-md shadow-yellow-600/20 border-yellow-500/50",
    card: "group-hover:border-yellow-500/70 group-hover:shadow-yellow-500/10",
    badge: "border-yellow-500/30 bg-yellow-500/10 text-yellow-600 dark:text-yellow-300",
  },
  "United States": {
    active: "bg-gradient-to-r from-blue-600 via-indigo-700 to-red-700 text-white shadow-md shadow-blue-600/20 border-blue-500/50",
    card: "group-hover:border-blue-500/70 group-hover:shadow-blue-500/10",
    badge: "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-300",
  },
  Japan: {
    active: "bg-gradient-to-r from-rose-500 via-pink-600 to-slate-800 text-white shadow-md shadow-rose-500/20 border-rose-500/50",
    card: "group-hover:border-rose-400/70 group-hover:shadow-rose-500/10",
    badge: "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-300",
  },
  "South Korea": {
    active: "bg-gradient-to-r from-cyan-600 via-indigo-600 to-rose-600 text-white shadow-md shadow-cyan-600/20 border-cyan-500/50",
    card: "group-hover:border-cyan-400/70 group-hover:shadow-cyan-500/10",
    badge: "border-cyan-500/30 bg-cyan-500/10 text-cyan-600 dark:text-cyan-300",
  },
};

const countryFlags: Record<Country, string> = {
  Germany: "🇩🇪",
  Italy: "🇮🇹",
  Netherlands: "🇳🇱",
  Belgium: "🇧🇪",
  "United States": "🇺🇸",
  Japan: "🇯🇵",
  "South Korea": "🇰🇷",
};

const countryFlagGradients: Record<Country, { bg: string; border: string }> = {
  Germany: {
    bg: "bg-gradient-to-r from-stone-900/40 via-red-600/45 to-amber-500/50 border-amber-500/50 hover:border-amber-400 hover:shadow-lg hover:shadow-amber-500/15",
    border: "border-amber-500/60",
  },
  Italy: {
    bg: "bg-gradient-to-r from-emerald-600/40 via-teal-900/30 to-rose-600/40 border-emerald-500/50 hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-500/15",
    border: "border-emerald-500/60",
  },
  Netherlands: {
    bg: "bg-gradient-to-r from-red-600/40 via-amber-600/30 to-blue-600/40 border-orange-500/50 hover:border-orange-400 hover:shadow-lg hover:shadow-orange-500/15",
    border: "border-orange-500/60",
  },
  Belgium: {
    bg: "bg-gradient-to-r from-stone-900/40 via-yellow-500/45 to-red-600/45 border-yellow-500/50 hover:border-yellow-400 hover:shadow-lg hover:shadow-yellow-500/15",
    border: "border-yellow-500/60",
  },
  "United States": {
    bg: "bg-gradient-to-r from-blue-700/40 via-indigo-900/30 to-red-600/40 border-blue-500/50 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/15",
    border: "border-blue-500/60",
  },
  Japan: {
    bg: "bg-gradient-to-r from-rose-500/40 via-red-600/45 to-rose-500/40 border-rose-500/50 hover:border-rose-400 hover:shadow-lg hover:shadow-rose-500/15",
    border: "border-rose-500/60",
  },
  "South Korea": {
    bg: "bg-gradient-to-r from-cyan-600/40 via-indigo-900/30 to-rose-600/40 border-cyan-500/50 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/15",
    border: "border-cyan-500/60",
  },
};

export function BrandAtlas() {
  const [selectedCountry, setSelectedCountry] = useState<Country | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBrands = useMemo(() => {
    return brands.filter((b) => {
      const matchesCountry = selectedCountry === "All" || b.country === selectedCountry;
      const matchesQuery =
        !searchQuery.trim() ||
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.signature.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.country.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCountry && matchesQuery;
    });
  }, [selectedCountry, searchQuery]);

  return (
    <section className="relative overflow-hidden py-16 lg:py-24">
      <SectionBackdrop seed="brand-atlas" strength="soft" />
      <Container wide>
        <Reveal>
          <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <Eyebrow className="mb-3">The Brand Portfolio</Eyebrow>
              <h2 className="display-xl text-ink">
                Choose By Brand
              </h2>
              <p className="lede mt-3">
                Direct partnerships with Europe and Asia&rsquo;s premier wallpaper mills — zero intermediaries, guaranteed authenticity, and complete archive access.
              </p>
            </div>
            <CTA href="/brands" tone="outline" size="sm">
              View full portfolio →
            </CTA>
          </div>
        </Reveal>

        {/* Filter controls & Search */}
        <Reveal delay={100}>
          <div className="mb-8 flex flex-col gap-3 border-y border-line py-3.5 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setSelectedCountry("All")}
                aria-pressed={selectedCountry === "All"}
                className={cx(
                  "eyebrow rounded-full border px-3 py-1.5 text-[0.625rem] font-medium transition-all duration-300",
                  selectedCountry === "All"
                    ? "border-accent bg-accent text-white shadow-sm"
                    : "border-line bg-panel/70 text-ink-2 hover:border-ink-3 hover:text-ink",
                )}
              >
                All Houses ({brands.length})
              </button>
              {countryOrder.map((c) => {
                const count = brands.filter((b) => b.country === c).length;
                const activeGradient = countryGradients[c].active;
                return (
                  <button
                    key={c}
                    onClick={() => setSelectedCountry(c)}
                    aria-pressed={selectedCountry === c}
                    className={cx(
                      "eyebrow flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[0.625rem] font-medium transition-all duration-300",
                      selectedCountry === c
                        ? activeGradient
                        : "border-line bg-panel/70 text-ink-2 hover:border-ink-3 hover:text-ink",
                    )}
                  >
                    <span>{countryFlags[c]}</span>
                    <span>{c}</span>
                    <span className="opacity-75">({count})</span>
                  </button>
                );
              })}
            </div>

            <div className="relative flex items-center">
              <Search className="absolute left-3 h-3.5 w-3.5 text-ink-3" strokeWidth={1.5} />
              <input
                type="text"
                placeholder="Search brand or origin..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8.5 w-full rounded-full border border-line bg-panel/80 pl-8.5 pr-4 text-[0.75rem] text-ink outline-none backdrop-blur-md placeholder:text-ink-3 focus:border-accent md:w-52"
              />
            </div>
          </div>
        </Reveal>

        {/* Brand Grid — Compact pill style matching reference screenshot */}
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredBrands.map((b, i) => {
            const flagGrad = countryFlagGradients[b.country];
            return (
              <Reveal key={b.slug} delay={(i % 8) * 25}>
                <Link
                  href={`/brands#${b.slug}`}
                  className={cx(
                    "group flex items-center gap-3.5 rounded-2xl border p-3.5 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md",
                    flagGrad.bg,
                  )}
                >
                  {/* Circular Brand Badge */}
                  <div className={cx("flex h-11 w-11 shrink-0 items-center justify-center rounded-full border bg-panel/90 text-ink transition-transform duration-300 group-hover:scale-105", flagGrad.border)}>
                    <span className="font-display text-sm font-extrabold tracking-tight">
                      {b.name.substring(0, 2).toUpperCase()}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display truncate text-[0.9375rem] font-bold text-ink transition-colors duration-300 group-hover:text-accent">
                        {b.name}
                      </h3>
                    </div>
                    <p className="truncate text-[0.75rem] font-medium text-ink-2">
                      {countryFlags[b.country]} {b.country} · {b.signature.split("·")[0]}
                    </p>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

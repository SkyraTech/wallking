"use client";

import { useCallback, useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { CollectionCard } from "./CollectionCard";
import { ButtonEl, Container, Pill, cx } from "@/components/ui/primitives";
import {
  APPLICATIONS,
  COLOURS,
  STYLES,
  TEXTURES,
  byNewest,
  collections,
  daysSinceAdded,
  normaliseDesignNo,
  type Application,
  type Collection,
  type Colour,
  type Style,
  type Texture,
} from "@/lib/data/collections";
import { brands, countryOrder } from "@/lib/data/brands";

type Facets = {
  brand: string[];
  style: Style[];
  colour: Colour[];
  texture: Texture[];
  application: Application[];
};

const EMPTY: Facets = { brand: [], style: [], colour: [], texture: [], application: [] };

type SortKey = "newest" | "name" | "brand";

const sortLabels: Record<SortKey, string> = {
  newest: "Recently added",
  name: "A–Z",
  brand: "By brand",
};

/**
 * Catalogue browser. All filtering happens client-side against the in-memory
 * catalogue — with a few dozen collections that is instant and avoids a
 * round trip per checkbox. When the catalogue outgrows a few hundred entries,
 * move `visible` behind a server action; the component contract stays put.
 */
export function CollectionBrowser({
  initial = collections,
  showFilters = true,
}: {
  initial?: Collection[];
  showFilters?: boolean;
}) {
  const [facets, setFacets] = useState<Facets>(EMPTY);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [panelOpen, setPanelOpen] = useState(false);

  const toggle = useCallback(
    <K extends keyof Facets>(key: K, value: Facets[K][number]) => {
      setFacets((f) => {
        const list = f[key] as string[];
        const next = list.includes(value as string)
          ? list.filter((v) => v !== value)
          : [...list, value as string];
        return { ...f, [key]: next } as Facets;
      });
    },
    [],
  );

  const activeCount = Object.values(facets).reduce((n, l) => n + l.length, 0);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const nq = normaliseDesignNo(q);

    const matched = initial.filter((c) => {
      if (facets.brand.length && !facets.brand.includes(c.brand)) return false;
      if (facets.style.length && !facets.style.some((s) => c.styles.includes(s))) return false;
      if (facets.colour.length && !facets.colour.some((s) => c.colours.includes(s))) return false;
      if (facets.texture.length && !facets.texture.some((s) => c.textures.includes(s))) return false;
      if (
        facets.application.length &&
        !facets.application.some((s) => c.applications.includes(s))
      )
        return false;

      if (!q) return true;

      const hay = [
        c.name,
        c.summary,
        brands.find((b) => b.slug === c.brand)?.name ?? "",
        ...c.styles,
        ...c.colours,
        ...c.textures,
        ...c.applications,
        ...c.colourways.map((cw) => cw.name),
      ]
        .join(" ")
        .toLowerCase();

      if (hay.includes(q)) return true;
      return (
        nq.length >= 2 &&
        c.colourways.some((cw) => normaliseDesignNo(cw.designNo).includes(nq))
      );
    });

    const order = byNewest.map((c) => c.slug);
    return [...matched].sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "brand") {
        const an = brands.find((x) => x.slug === a.brand)?.name ?? "";
        const bn = brands.find((x) => x.slug === b.brand)?.name ?? "";
        return an.localeCompare(bn) || a.name.localeCompare(b.name);
      }
      return order.indexOf(a.slug) - order.indexOf(b.slug);
    });
  }, [initial, facets, query, sort]);

  const groups = [
    {
      key: "brand" as const,
      label: "Brand",
      options: countryOrder.flatMap((country) =>
        brands
          .filter((b) => b.country === country)
          .map((b) => ({ value: b.slug, label: b.name, group: country })),
      ),
    },
    { key: "style" as const, label: "Style", options: STYLES.map((s) => ({ value: s, label: s })) },
    { key: "colour" as const, label: "Colour", options: COLOURS.map((s) => ({ value: s, label: s })) },
    { key: "texture" as const, label: "Texture", options: TEXTURES.map((s) => ({ value: s, label: s })) },
    {
      key: "application" as const,
      label: "Application",
      options: APPLICATIONS.map((s) => ({ value: s, label: s })),
    },
  ];

  return (
    <div className="relative">
      {/* Toolbar */}
      <div className="sticky top-16 z-[60] border-y border-line bg-void/88 backdrop-blur-xl">
        <Container wide>
          <div className="flex flex-wrap items-center gap-3 py-3.5">
            <label className="relative flex h-10 min-w-0 flex-1 items-center gap-2.5 border border-line px-3.5 focus-within:border-accent sm:max-w-md">
              <Search className="h-4 w-4 shrink-0 text-ink-3" strokeWidth={1.5} />
              <span className="sr-only">Search collections</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Design no., collection, brand or colour"
                className="min-w-0 flex-1 bg-transparent text-[0.8125rem] text-ink outline-none placeholder:text-ink-3"
                autoComplete="off"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="shrink-0 text-ink-3 hover:text-ink"
                >
                  <X className="h-3.5 w-3.5" strokeWidth={1.6} />
                </button>
              )}
            </label>

            {showFilters && (
              <ButtonEl
                tone="outline"
                size="sm"
                onClick={() => setPanelOpen((o) => !o)}
                aria-expanded={panelOpen}
                className="shrink-0"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={1.6} />
                Filters
                {activeCount > 0 && (
                  <span className="tnum ml-1 rounded-full bg-accent px-1.5 py-0.5 text-[0.625rem] text-void">
                    {activeCount}
                  </span>
                )}
              </ButtonEl>
            )}

            <label className="hidden items-center gap-2 sm:flex">
              <span className="eyebrow text-ink-3">Sort</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="h-10 border border-line bg-transparent px-3 text-[0.8125rem] text-ink outline-none focus:border-accent"
              >
                {Object.entries(sortLabels).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </label>

            <p className="tnum ml-auto shrink-0 text-[0.75rem] text-ink-3">
              {visible.length} of {initial.length}
            </p>
          </div>

          {/* Active facet chips */}
          {activeCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 pb-3.5">
              {(Object.keys(facets) as (keyof Facets)[]).flatMap((k) =>
                (facets[k] as string[]).map((v) => (
                  <button
                    key={`${k}-${v}`}
                    onClick={() => toggle(k, v as never)}
                    className="eyebrow inline-flex items-center gap-1.5 border border-accent/50 px-2.5 py-1.5 text-[0.5625rem] text-accent transition-colors hover:bg-accent hover:text-void"
                  >
                    {k === "brand" ? brands.find((b) => b.slug === v)?.name : v}
                    <X className="h-2.5 w-2.5" strokeWidth={2} />
                  </button>
                )),
              )}
              <button
                onClick={() => setFacets(EMPTY)}
                className="eyebrow px-2 py-1.5 text-[0.5625rem] text-ink-3 underline underline-offset-4 hover:text-ink"
              >
                Clear all
              </button>
            </div>
          )}
        </Container>
      </div>

      {/* Filter panel */}
      {showFilters && panelOpen && (
        <div className="border-b border-line bg-deep">
          <Container wide>
            <div className="grid gap-8 py-8 md:grid-cols-2 xl:grid-cols-5">
              {groups.map((g) => (
                <fieldset key={g.key}>
                  <legend className="eyebrow mb-4 text-ink-3">{g.label}</legend>
                  <div className="flex flex-wrap gap-1.5">
                    {g.options.map((o) => {
                      const on = (facets[g.key] as string[]).includes(o.value);
                      return (
                        <button
                          key={o.value}
                          onClick={() => toggle(g.key, o.value as never)}
                          aria-pressed={on}
                          className={cx(
                            "border px-2.5 py-1.5 text-[0.75rem] transition-colors duration-300",
                            on
                              ? "border-accent bg-accent text-void"
                              : "border-line text-ink-2 hover:border-ink-3 hover:text-ink",
                          )}
                        >
                          {o.label}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              ))}
            </div>
          </Container>
        </div>
      )}

      {/* Grid */}
      <Container wide>
        {visible.length === 0 ? (
          <div className="py-32 text-center">
            <p className="display-md text-ink">Nothing matches that yet.</p>
            <p className="mx-auto mt-4 max-w-md text-[0.9375rem] leading-relaxed text-ink-2">
              Our warehouse carries far more than the website shows. Tell us
              what you are looking for and we will check the shelves.
            </p>
            <div className="mt-8 flex justify-center gap-3">
              <ButtonEl
                tone="outline"
                onClick={() => {
                  setFacets(EMPTY);
                  setQuery("");
                }}
              >
                Reset filters
              </ButtonEl>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-6 gap-y-14 py-16 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-8">
            {visible.map((c, i) => (
              <CollectionCard
                key={c.slug}
                collection={c}
                priority={i < 4}
                aspect={daysSinceAdded(c) <= 45 ? "tall" : "portrait"}
              />
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}

export function TagLegend() {
  return (
    <div className="flex flex-wrap gap-2">
      <Pill tone="accent">New</Pill>
      <Pill>Trending</Pill>
      <Pill>Best Seller</Pill>
      <Pill tone="warn">Limited Stock</Pill>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, CornerDownLeft, X } from "lucide-react";
import {
  collections,
  searchCollections,
  searchDesignNumbers,
  stockLabel,
} from "@/lib/data/collections";
import { brands } from "@/lib/data/brands";
import { RoomPhoto as WallpaperSwatch } from "@/components/art/RoomPhoto";
import { StockDot, cx } from "@/components/ui/primitives";

const brandName = (slug: string) =>
  brands.find((b) => b.slug === slug)?.name ?? slug;

/**
 * Site-wide search, opened from the header or with ⌘K / Ctrl-K.
 *
 * Design number lookup is the primary job — a dealer on the phone types
 * "791405" and gets the paper. Collection, brand and style matching sit
 * underneath it.
 *
 * The caller mounts this only while the dialog is open, so query and
 * selection reset naturally on each open rather than being cleared by an
 * effect that would cause an extra render every time.
 */
export function DesignSearch({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const results = useMemo(() => {
    const q = query.trim();
    if (!q) {
      return {
        designs: [],
        matches: collections.slice(0, 6),
        heading: "Popular ranges",
      };
    }
    return {
      designs: searchDesignNumbers(q, 5),
      matches: searchCollections(q).slice(0, 6),
      heading: "Collections",
    };
  }, [query]);

  // One flat, pre-indexed list so keyboard navigation and rendering agree on
  // what row number each result is — no counter mutated during render.
  const rows = useMemo(() => {
    const designRows = results.designs.map((d) => ({
      kind: "design" as const,
      key: d.designNo,
      href: `/collections/${d.collection.slug}?design=${encodeURIComponent(d.designNo)}`,
      design: d,
    }));
    const collectionRows = results.matches.map((c) => ({
      kind: "collection" as const,
      key: c.slug,
      href: `/collections/${c.slug}`,
      collection: c,
    }));
    return [...designRows, ...collectionRows].map((r, i) => ({ ...r, i }));
  }, [results]);

  const designRows = rows.filter((r) => r.kind === "design");
  const collectionRows = rows.filter((r) => r.kind === "collection");

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 60);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((i) => Math.min(i + 1, rows.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && rows[active]) {
        e.preventDefault();
        router.push(rows[active].href);
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [rows, active, onClose, router]);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center px-4 pt-[12vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Search collections and design numbers"
    >
      <button
        aria-label="Close search"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-ink/40 backdrop-blur-[3px]"
      />

      <div className="relative w-full max-w-2xl overflow-hidden border border-line bg-panel shadow-[var(--shadow)]">
        <div className="flex items-center gap-3 border-b border-line px-5">
          <Search className="h-4 w-4 shrink-0 text-ink-3" strokeWidth={1.5} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            placeholder="Design no. 7914-05, a brand, a colour…"
            className="h-16 w-full bg-transparent text-[0.95rem] text-ink outline-none placeholder:text-ink-3"
            autoComplete="off"
            spellCheck={false}
          />
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid h-7 w-7 shrink-0 place-items-center text-ink-3 transition-colors hover:text-ink"
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>

        <div className="max-h-[52vh] overflow-y-auto overscroll-contain">
          {designRows.length > 0 && (
            <section className="border-b border-line-faint py-3">
              <p className="eyebrow px-5 py-2 text-ink-3">Design numbers</p>
              {designRows.map((row) => {
                const d = row.design!;
                return (
                  <Link
                    key={row.key}
                    href={row.href}
                    onClick={onClose}
                    onMouseEnter={() => setActive(row.i)}
                    className={cx(
                      "flex items-center gap-4 px-5 py-2.5 transition-colors",
                      active === row.i ? "bg-deep" : "",
                    )}
                  >
                    <div className="h-11 w-9 shrink-0 overflow-hidden border border-line">
                      <WallpaperSwatch
                        spec={
                          d.collection.colourways.find(
                            (c) => c.designNo === d.designNo,
                          )!.art
                        }
                        seed={d.designNo}
                        className="h-full w-full"
                        lit={false}
                      />
                    </div>
                    <span className="tnum font-medium text-ink">{d.designNo}</span>
                    <span className="text-sm text-ink-2">
                      {d.collection.name} · {d.colourway}
                    </span>
                    <span className="ml-auto flex items-center gap-2 text-[0.6875rem] text-ink-3">
                      <StockDot stock={d.stock} />
                      {stockLabel[d.stock]}
                    </span>
                  </Link>
                );
              })}
            </section>
          )}

          <section className="py-3">
            <p className="eyebrow px-5 py-2 text-ink-3">{results.heading}</p>
            {collectionRows.length === 0 && (
              <p className="px-5 py-6 text-sm text-ink-3">
                Nothing matched “{query}”. Try a brand, a colour, or the first
                four digits of a design number.
              </p>
            )}
            {collectionRows.map((row) => {
              const c = row.collection!;
              return (
                <Link
                  key={row.key}
                  href={row.href}
                  onClick={onClose}
                  onMouseEnter={() => setActive(row.i)}
                  className={cx(
                    "flex items-center gap-4 px-5 py-2.5 transition-colors",
                    active === row.i ? "bg-deep" : "",
                  )}
                >
                  <div className="h-11 w-9 shrink-0 overflow-hidden border border-line">
                    <WallpaperSwatch
                      spec={c.colourways[0].art}
                      seed={c.slug}
                      className="h-full w-full"
                      lit={false}
                    />
                  </div>
                  <span className="font-display text-lg text-ink">{c.name}</span>
                  <span className="text-sm text-ink-3">{brandName(c.brand)}</span>
                  <span className="ml-auto hidden text-[0.6875rem] text-ink-3 sm:block">
                    {c.styles[0]}
                  </span>
                </Link>
              );
            })}
          </section>
        </div>

        <div className="flex items-center justify-between border-t border-line px-5 py-3 text-[0.6875rem] text-ink-3">
          <span className="flex items-center gap-1.5">
            <CornerDownLeft className="h-3 w-3" strokeWidth={1.5} /> to open
            <span className="mx-2 opacity-40">·</span>↑↓ to move
          </span>
          <span>Esc to close</span>
        </div>
      </div>
    </div>
  );
}

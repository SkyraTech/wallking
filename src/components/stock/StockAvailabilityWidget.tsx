"use client";

import { useState, useEffect } from "react";
import { Search, CheckCircle2, XCircle, AlertTriangle, ArrowRight, Send, Database, Loader2, Lock } from "lucide-react";
import Link from "next/link";
import { whatsappLink } from "@/lib/site";

interface StockResult {
  found: boolean;
  designNo?: string;
  brand?: string;
  quantityOnHand?: number;
  available?: boolean;
  updatedAt?: string;
  error?: string;
}

export function StockAvailabilityWidget({
  compact = false,
  showTitle = true,
}: {
  compact?: boolean;
  showTitle?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<StockResult | null | undefined>(undefined);
  const [searchedText, setSearchedText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const q = query.trim();
    if (!q) return;

    setSearchedText(q);
    setLoading(true);
    setResult(undefined);

    try {
      const res = await fetch(
        `/api/internal/stock?designNo=${encodeURIComponent(q)}`,
        { cache: "no-store" }
      );
      const data: StockResult = await res.json();

      if (res.status === 503 || data.error === "db_error") {
        setResult({ found: false, designNo: q, error: "db_error" });
      } else {
        setResult(data);
      }
    } catch {
      setResult({ found: false, designNo: q, error: "network_error" });
    } finally {
      setLoading(false);
    }
  };

  const handleSampleClick = async (d: string) => {
    setQuery(d);
    setSearchedText(d);
    setLoading(true);
    setResult(undefined);
    try {
      const res = await fetch(`/api/internal/stock?designNo=${encodeURIComponent(d)}`, { cache: "no-store" });
      const data: StockResult = await res.json();
      setResult(data.error === "db_error" ? { found: false, designNo: d, error: "db_error" } : data);
    } catch {
      setResult({ found: false, designNo: d, error: "network_error" });
    } finally {
      setLoading(false);
    }
  };

  const [sampleDesigns, setSampleDesigns] = useState<string[]>(["7517-04", "ONYX-102", "BEL-804"]);
  const [topDesigns, setTopDesigns] = useState<string[]>([]);
  const [searchSuggestions, setSearchSuggestions] = useState<string[] | null>(null);
  const [suggestLoading, setSuggestLoading] = useState(false);

  // Load top 6 once on mount
  useEffect(() => {
    fetch("/api/internal/stock?top=6")
      .then((res) => res.json())
      .then((data) => {
        if (data.designs && data.designs.length > 0) {
          setTopDesigns(data.designs);
          setSampleDesigns(data.designs);
        }
      })
      .catch(() => {});
  }, []);

  // Debounced live search as user types
  useEffect(() => {
    if (query.trim().length < 2) {
      setSearchSuggestions(null);
      setSampleDesigns(topDesigns.length > 0 ? topDesigns : ["7517-04", "ONYX-102", "BEL-804"]);
      return;
    }
    const timer = setTimeout(async () => {
      setSuggestLoading(true);
      try {
        const res = await fetch(`/api/internal/stock?search=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        setSearchSuggestions(data.designs || []);
      } catch {
        setSearchSuggestions([]);
      } finally {
        setSuggestLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, topDesigns]);

  const displayChips = searchSuggestions !== null ? searchSuggestions : sampleDesigns;
  const chipsLabel = query.trim().length >= 2
    ? (suggestLoading ? "Searching..." : searchSuggestions?.length === 0 ? "No matches" : "Matches:")
    : "Try:";

  return (
    <div className="w-full rounded-2xl border border-line bg-panel/90 p-6 shadow-2xl backdrop-blur-xl md:p-8">
      {showTitle && (
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent">
              <Database className="h-3.5 w-3.5" /> 24x7 B2B Stock Engine
            </div>
            <h3 className="mt-2 font-display text-2xl font-bold text-ink">
              Dealer Stock Availability Lookup
            </h3>
            <p className="mt-1 text-xs text-ink-3">
              Enter any design number to check live Hyderabad warehouse stock.
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-2 text-xs text-ink-3">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Database</span>
            </div>
            <Link 
              href="/admin/stock" 
              className="flex items-center gap-1 text-[10px] text-ink-3/50 transition-colors hover:text-accent"
              title="Admin Portal"
            >
              <Lock className="h-2.5 w-2.5" />
              Admin
            </Link>
          </div>
        </div>
      )}

      <form onSubmit={handleSearch} className="relative flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-3" />
          <input
            id="stock-search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter Design No. (e.g. 7517-04 or ONYX-102)"
            className="w-full rounded-xl border border-line bg-void px-12 py-3.5 text-sm text-ink placeholder:text-ink-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(""); setResult(undefined); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-ink-3 hover:text-ink"
            >
              Clear
            </button>
          )}
        </div>
        <button
          id="stock-search-submit"
          type="submit"
          disabled={loading}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-accent px-6 py-3.5 font-display text-sm font-bold text-white shadow-lg transition-transform duration-200 hover:scale-105 hover:bg-accent/90 disabled:opacity-70"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><span>Check Stock</span><ArrowRight className="h-4 w-4" /></>}
        </button>
      </form>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-ink-3 min-h-[28px]">
        <span className={suggestLoading ? "animate-pulse" : ""}>{chipsLabel}</span>
        {!suggestLoading && displayChips.map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => handleSampleClick(d)}
            className="rounded-md border border-line bg-void/60 px-2.5 py-1 text-ink-2 hover:border-accent hover:text-accent transition-colors"
          >
            {d}
          </button>
        ))}
      </div>

      {loading && (
        <div className="mt-6 flex items-center justify-center gap-3 py-8 text-ink-3 text-sm">
          <Loader2 className="h-5 w-5 animate-spin text-accent" />
          <span>Checking live stock...</span>
        </div>
      )}

      {!loading && result !== undefined && (
        <div className="mt-6 rounded-xl border border-line bg-void/80 p-6 animate-in fade-in slide-in-from-top-2 duration-300">
          {result && "error" in result && result.error && (
            <div className="flex flex-col items-center justify-center py-4 text-center">
              <AlertTriangle className="h-8 w-8 text-amber-500 mb-3" />
              <h4 className="font-display text-lg font-bold text-ink">
                Stock Check Temporarily Unavailable
              </h4>
              <p className="mt-1 max-w-md text-xs text-ink-3">
                We could not retrieve live stock right now. Please try again in a moment, or contact our desk directly.
              </p>
              <a
                href={whatsappLink(`${searchedText} `)}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-4 inline-flex items-center gap-2 rounded-xl border border-accent/40 bg-accent/10 px-5 py-2.5 text-xs font-semibold text-accent hover:bg-accent hover:text-white transition-colors"
              >
                <Send className="h-3.5 w-3.5" /> Ask on WhatsApp
              </a>
            </div>
          )}

          {result && result.found && !("error" in result) && (
            <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  {result.quantityOnHand! > 15 ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-500 border border-emerald-500/20">
                      <CheckCircle2 className="h-4 w-4" /> Available
                    </span>
                  ) : result.quantityOnHand! > 0 ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-500 border border-amber-500/20">
                      <AlertTriangle className="h-4 w-4" /> Low Stock
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-3 py-1 text-xs font-bold text-rose-500 border border-rose-500/20">
                      <XCircle className="h-4 w-4" /> Out of Stock
                    </span>
                  )}
                  <span className="eyebrow text-xs text-ink-3">Design #{result.designNo}</span>
                </div>

                <div className="mt-3">
                  <h4 className="font-display text-2xl font-extrabold text-ink">
                    {result.quantityOnHand! > 0
                      ? `Available -- ${result.quantityOnHand} Rolls`
                      : "Out of Stock"}
                  </h4>
                  <p className="mt-1 text-sm text-ink-2">
                    Brand: <strong className="text-ink">{result.brand}</strong>
                  </p>
                  <div className="mt-2 text-xs text-ink-3">
                    Updated: {result.updatedAt ? new Date(result.updatedAt).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" }) : "-"}
                  </div>
                  <p className="mt-2 text-xs text-ink-3 italic">
                    Stock is subject to final order confirmation.
                  </p>
                </div>
              </div>

              <div className="mt-2 md:mt-0 shrink-0">
                {result.quantityOnHand! > 0 ? (
                  <a
                    href={whatsappLink(`${result.designNo} `)}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-2.5 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-lg transition-transform hover:scale-105 hover:bg-emerald-500"
                  >
                    <Send className="h-4 w-4" />
                    <span>Place Order via WhatsApp</span>
                  </a>
                ) : (
                  <a
                    href={whatsappLink(`${result.designNo} `)}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-2 rounded-xl border border-line bg-panel px-5 py-3 text-xs font-semibold text-ink hover:border-accent"
                  >
                    <Send className="h-3.5 w-3.5 text-accent" />
                    <span>Enquire Expected Arrival</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {result !== null && !result?.found && !("error" in result) && (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="rounded-full bg-rose-500/10 p-3 text-rose-500 mb-3 border border-rose-500/20">
                <XCircle className="h-6 w-6" />
              </div>
              <h4 className="font-display text-xl font-bold text-ink">Design Not Found</h4>
              <p className="mt-1 max-w-md text-xs text-ink-3">
                No matching inventory record found for &quot;{searchedText}&quot;. Please verify the design number or enquire with our dispatch desk.
              </p>
              <a
                href={whatsappLink(`${searchedText} `)}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-4 inline-flex items-center gap-2 rounded-xl border border-accent/40 bg-accent/10 px-5 py-2.5 text-xs font-semibold text-accent hover:bg-accent hover:text-white transition-colors"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Ask Desk on WhatsApp</span>
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

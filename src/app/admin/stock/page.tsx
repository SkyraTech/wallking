"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  FileSpreadsheet,
  Upload,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Download,
  RefreshCw,
  LogOut,
  Database,
  History,
  BarChart3,
  Layers,
  Eye,
  Send,
  Clock,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types (matching Supabase schema)
// ---------------------------------------------------------------------------
interface StockItem {
  id: string;
  design_number_display: string;
  design_number_normalized: string;
  brand: string;
  collection: string | null;
  quantity_rolls: number;
  warehouse_location: string;
  updated_at: string;
}

interface ImportRecord {
  id: string;
  filename: string | null;
  import_mode: string;
  imported_at: string;
  total_rows: number;
  created_rows: number;
  updated_rows: number;
  skipped_rows: number;
  invalid_rows: number;
  error_summary: string | null;
}

interface ImportPreview {
  valid: unknown[];
  invalid: { lineNumber: number; raw: Record<string, string>; errors: string[] }[];
  duplicatesInFile: unknown[];
  diff: {
    newRows: { designNumberDisplay: string; brand: string; quantityRolls: number }[];
    changedRows: { designNumberDisplay: string; brand: string; quantityRolls: number }[];
    unchangedRows: { designNumberDisplay: string; brand: string }[];
  };
  canApply: boolean;
}

// ---------------------------------------------------------------------------
// Auth helper
// ---------------------------------------------------------------------------
function useAdminSession() {
  const authHeaders = {
    // Cookie is set by login page — the browser sends it automatically.
    // For API calls from the client, we rely on the cookie.
    // No Bearer token needed here since the middleware already validated the session.
  };
  return { authHeaders };
}

// ---------------------------------------------------------------------------
// Tab type
// ---------------------------------------------------------------------------
type Tab = "inventory" | "import" | "manual" | "history";

// ---------------------------------------------------------------------------
// Main Admin Portal
// ---------------------------------------------------------------------------
export default function AdminStockPage() {
  const { authHeaders } = useAdminSession();
  const [activeTab, setActiveTab] = useState<Tab>("inventory");

  // --- Inventory state ---
  const [items, setItems] = useState<StockItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [filterQuery, setFilterQuery] = useState("");
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [inventoryError, setInventoryError] = useState("");

  // --- Manual form state ---
  const [manualDesign, setManualDesign] = useState("");
  const [manualBrand, setManualBrand] = useState("");
  const [manualCollection, setManualCollection] = useState("");
  const [manualQty, setManualQty] = useState("");
  const [manualWarehouse, setManualWarehouse] = useState("Hyderabad Central Depot");
  const [manualSaving, setManualSaving] = useState(false);
  const [manualResult, setManualResult] = useState<{ success: boolean; message: string } | null>(null);

  // --- Import state ---
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importMode, setImportMode] = useState<"incremental" | "full_snapshot">("incremental");
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importApplying, setImportApplying] = useState(false);
  const [importResult, setImportResult] = useState<{ success: boolean; message: string } | null>(null);
  const [confirmFullSnapshot, setConfirmFullSnapshot] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // --- History state ---
  const [imports, setImports] = useState<ImportRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // -------------------------------------------------------------------------
  // Load inventory
  // -------------------------------------------------------------------------
  const loadInventory = useCallback(async () => {
    setLoadingInventory(true);
    setInventoryError("");
    try {
      const params = new URLSearchParams({ limit: "200" });
      if (filterQuery) params.set("search", filterQuery);
      const res = await fetch(`/api/admin/stock?${params}`, {
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = "/admin/login";
          return;
        }
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      setItems(data.stock ?? []);
      setTotalItems(data.total ?? 0);
    } catch (err) {
      setInventoryError(err instanceof Error ? err.message : "Failed to load inventory");
    } finally {
      setLoadingInventory(false);
    }
  }, [filterQuery]);

  useEffect(() => {
    if (activeTab === "inventory") loadInventory();
  }, [activeTab, loadInventory]);

  // -------------------------------------------------------------------------
  // Load import history
  // -------------------------------------------------------------------------
  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch("/api/admin/stock/import", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setImports(data.imports ?? []);
      }
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "history") loadHistory();
  }, [activeTab, loadHistory]);

  // -------------------------------------------------------------------------
  // Manual stock upsert
  // -------------------------------------------------------------------------
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setManualSaving(true);
    setManualResult(null);

    try {
      const res = await fetch("/api/admin/stock/manual", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          designNo: manualDesign.trim(),
          brand: manualBrand.trim() || "Wall King",
          collection: manualCollection.trim() || undefined,
          quantityRolls: parseInt(manualQty, 10) || 0,
          warehouseLocation: manualWarehouse.trim() || "Hyderabad Central Depot",
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setManualResult({ success: true, message: `${data.item.design_number_display} saved — ${data.item.quantity_rolls} rolls.` });
        setManualDesign("");
        setManualBrand("");
        setManualCollection("");
        setManualQty("");
      } else {
        setManualResult({ success: false, message: data.error ?? "Save failed" });
      }
    } catch {
      setManualResult({ success: false, message: "Network error" });
    } finally {
      setManualSaving(false);
    }
  };

  // -------------------------------------------------------------------------
  // Import preview
  // -------------------------------------------------------------------------
  const handlePreview = async () => {
    if (!importFile) return;
    setImportLoading(true);
    setImportPreview(null);
    setImportResult(null);

    const fd = new FormData();
    fd.append("file", importFile);
    fd.append("mode", importMode);
    // No confirm flag = preview only

    try {
      const res = await fetch("/api/admin/stock/import", {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      const data = await res.json();
      if (res.ok && data.preview) {
        setImportPreview(data.preview);
      } else {
        setImportResult({ success: false, message: data.error ?? "Preview failed" });
      }
    } catch {
      setImportResult({ success: false, message: "Network error" });
    } finally {
      setImportLoading(false);
    }
  };

  // -------------------------------------------------------------------------
  // Apply import
  // -------------------------------------------------------------------------
  const handleApplyImport = async () => {
    if (!importFile || !importPreview?.canApply) return;
    setImportApplying(true);

    const fd = new FormData();
    fd.append("file", importFile);
    fd.append("mode", importMode);
    fd.append("confirm", "true");
    if (importMode === "full_snapshot" && confirmFullSnapshot) {
      fd.append("confirm_full_snapshot", "true");
    }

    try {
      const res = await fetch("/api/admin/stock/import", {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const r = data.result;
        setImportResult({
          success: true,
          message: `Import complete — ${r.createdRows} created, ${r.updatedRows} updated, ${r.skippedRows} unchanged.`,
        });
        setImportPreview(null);
        setImportFile(null);
        if (fileRef.current) fileRef.current.value = "";
      } else {
        setImportResult({ success: false, message: data.error ?? "Apply failed" });
      }
    } catch {
      setImportResult({ success: false, message: "Network error" });
    } finally {
      setImportApplying(false);
    }
  };

  // -------------------------------------------------------------------------
  // Logout
  // -------------------------------------------------------------------------
  const handleLogout = async () => {
    await fetch("/api/admin/login", { method: "DELETE", credentials: "include" });
    window.location.href = "/admin/login";
  };

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "inventory", label: "Inventory", icon: <Database className="h-4 w-4" /> },
    { id: "manual", label: "Add / Update", icon: <Plus className="h-4 w-4" /> },
    { id: "import", label: "Import CSV/Excel", icon: <Upload className="h-4 w-4" /> },
    { id: "history", label: "Import History", icon: <History className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen bg-void">
      {/* Header */}
      <header className="border-b border-line bg-panel/90 backdrop-blur-md sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
              <Layers className="h-4 w-4 text-white" />
            </div>
            <div>
              <span className="font-display text-sm font-bold text-ink">Wall King</span>
              <span className="ml-2 text-xs text-ink-3">Stock Management Portal</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="/stock"
              target="_blank"
              className="text-xs text-ink-3 hover:text-accent transition-colors flex items-center gap-1"
            >
              <Eye className="h-3.5 w-3.5" /> Live Stock Page
            </a>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs text-ink-3 hover:border-rose-500 hover:text-rose-500 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats bar */}
        <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total SKUs", value: totalItems, icon: <Database className="h-4 w-4" /> },
            { label: "In Stock", value: items.filter((i) => i.quantity_rolls > 0).length, icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" /> },
            { label: "Out of Stock", value: items.filter((i) => i.quantity_rolls === 0).length, icon: <XCircle className="h-4 w-4 text-rose-500" /> },
            { label: "Low Stock (<15)", value: items.filter((i) => i.quantity_rolls > 0 && i.quantity_rolls <= 15).length, icon: <AlertTriangle className="h-4 w-4 text-amber-500" /> },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-line bg-panel/80 p-4 flex items-center gap-3">
              <span className="text-ink-3">{s.icon}</span>
              <div>
                <div className="font-display text-xl font-bold text-ink">{s.value}</div>
                <div className="text-xs text-ink-3">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tab nav */}
        <div className="flex gap-1 rounded-xl border border-line bg-void/80 p-1 mb-6 w-fit">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                activeTab === t.id
                  ? "bg-accent text-white shadow-md"
                  : "text-ink-3 hover:text-ink"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* ---- INVENTORY TAB ---- */}
        {activeTab === "inventory" && (
          <div className="rounded-2xl border border-line bg-panel/90 p-6 shadow-xl backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4 mb-5">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
                <input
                  id="inventory-search"
                  type="text"
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && loadInventory()}
                  placeholder="Search design, brand…"
                  className="w-full rounded-xl border border-line bg-void pl-9 pr-3 py-2 text-sm text-ink placeholder:text-ink-3 focus:border-accent focus:outline-none"
                />
              </div>
              <button
                onClick={loadInventory}
                disabled={loadingInventory}
                className="inline-flex items-center gap-2 rounded-xl bg-accent/10 border border-accent/30 px-4 py-2 text-xs font-bold text-accent hover:bg-accent hover:text-white transition-colors"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loadingInventory ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>

            {inventoryError && (
              <div className="mb-4 rounded-lg bg-rose-500/10 border border-rose-500/20 px-4 py-3 text-xs text-rose-500">
                {inventoryError}
              </div>
            )}

            <div className="overflow-x-auto rounded-xl border border-line">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-line bg-void/90 text-ink-3 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Design No.</th>
                    <th className="px-4 py-3">Brand</th>
                    <th className="px-4 py-3">Collection</th>
                    <th className="px-4 py-3">Qty (Rolls)</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Warehouse</th>
                    <th className="px-4 py-3">Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/40 bg-void/40">
                  {items.length === 0 && !loadingInventory && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-ink-3">
                        {filterQuery ? "No results for your search." : "No inventory items yet."}
                      </td>
                    </tr>
                  )}
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-panel/40 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-ink">
                        {item.design_number_display}
                      </td>
                      <td className="px-4 py-3 text-ink-2">{item.brand}</td>
                      <td className="px-4 py-3 text-ink-2">{item.collection ?? "—"}</td>
                      <td className="px-4 py-3 font-bold text-ink">{item.quantity_rolls}</td>
                      <td className="px-4 py-3">
                        {item.quantity_rolls > 15 ? (
                          <span className="rounded bg-emerald-500/10 px-2 py-0.5 font-bold text-emerald-500 border border-emerald-500/20">In Stock</span>
                        ) : item.quantity_rolls > 0 ? (
                          <span className="rounded bg-amber-500/10 px-2 py-0.5 font-bold text-amber-500 border border-amber-500/20">Low Stock</span>
                        ) : (
                          <span className="rounded bg-rose-500/10 px-2 py-0.5 font-bold text-rose-500 border border-rose-500/20">Out of Stock</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-ink-3 text-[0.7rem]">{item.warehouse_location}</td>
                      <td className="px-4 py-3 text-ink-3 text-[0.7rem]">
                        {new Date(item.updated_at).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-ink-3">
              Showing {items.length} of {totalItems} items.{" "}
              {totalItems > 200 && "Use the search filter to narrow results."}
            </p>
          </div>
        )}

        {/* ---- MANUAL ADD/UPDATE TAB ---- */}
        {activeTab === "manual" && (
          <div className="rounded-2xl border border-line bg-panel/90 p-6 shadow-xl backdrop-blur-xl max-w-2xl">
            <div className="mb-6">
              <h2 className="font-display text-xl font-bold text-ink">Add or Update Stock Item</h2>
              <p className="mt-1 text-xs text-ink-3">
                Updates are immediate — the website search and WhatsApp bot will reflect this change on the next query.
              </p>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-ink-3 uppercase tracking-wider mb-1.5">
                    Design No. <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="manual-design-no"
                    type="text"
                    required
                    value={manualDesign}
                    onChange={(e) => setManualDesign(e.target.value)}
                    placeholder="e.g. 7517-04"
                    className="w-full rounded-xl border border-line bg-void px-3 py-2.5 text-sm text-ink font-mono focus:border-accent focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink-3 uppercase tracking-wider mb-1.5">
                    Brand
                  </label>
                  <input
                    id="manual-brand"
                    type="text"
                    value={manualBrand}
                    onChange={(e) => setManualBrand(e.target.value)}
                    placeholder="e.g. Erismann"
                    className="w-full rounded-xl border border-line bg-void px-3 py-2.5 text-sm text-ink focus:border-accent focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink-3 uppercase tracking-wider mb-1.5">
                    Collection
                  </label>
                  <input
                    id="manual-collection"
                    type="text"
                    value={manualCollection}
                    onChange={(e) => setManualCollection(e.target.value)}
                    placeholder="e.g. Eco-X Premier"
                    className="w-full rounded-xl border border-line bg-void px-3 py-2.5 text-sm text-ink focus:border-accent focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink-3 uppercase tracking-wider mb-1.5">
                    Stock Qty (Rolls) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="manual-qty"
                    type="number"
                    min="0"
                    required
                    value={manualQty}
                    onChange={(e) => setManualQty(e.target.value)}
                    placeholder="e.g. 99"
                    className="w-full rounded-xl border border-line bg-void px-3 py-2.5 text-sm text-ink focus:border-accent focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-ink-3 uppercase tracking-wider mb-1.5">
                    Warehouse
                  </label>
                  <input
                    id="manual-warehouse"
                    type="text"
                    value={manualWarehouse}
                    onChange={(e) => setManualWarehouse(e.target.value)}
                    className="w-full rounded-xl border border-line bg-void px-3 py-2.5 text-sm text-ink focus:border-accent focus:outline-none"
                  />
                </div>
              </div>

              {manualResult && (
                <div
                  className={`rounded-lg px-4 py-3 text-xs font-semibold border ${
                    manualResult.success
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                      : "bg-rose-500/10 border-rose-500/20 text-rose-500"
                  }`}
                >
                  {manualResult.success ? <CheckCircle2 className="inline h-4 w-4 mr-1.5" /> : <XCircle className="inline h-4 w-4 mr-1.5" />}
                  {manualResult.message}
                </div>
              )}

              <button
                id="manual-save-btn"
                type="submit"
                disabled={manualSaving}
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 font-display text-sm font-bold text-white shadow-lg transition-transform hover:scale-105 disabled:opacity-50"
              >
                {manualSaving ? (
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {manualSaving ? "Saving…" : "Save Stock Item"}
              </button>
            </form>
          </div>
        )}

        {/* ---- IMPORT TAB ---- */}
        {activeTab === "import" && (
          <div className="rounded-2xl border border-line bg-panel/90 p-6 shadow-xl backdrop-blur-xl max-w-3xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-xl font-bold text-ink">Import CSV / Excel</h2>
                <p className="mt-1 text-xs text-ink-3">
                  Upload your daily stock sheet. A preview is shown before any changes are made.
                </p>
              </div>
              <a
                href="/api/admin/stock/import?template=true"
                className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-void px-3 py-1.5 text-xs font-bold text-ink-2 hover:border-accent hover:text-accent transition-colors shrink-0"
              >
                <Download className="h-3.5 w-3.5" /> CSV Template
              </a>
            </div>

            {/* Mode toggle */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-ink-3 uppercase tracking-wider mb-2">
                Import Mode
              </label>
              <div className="flex rounded-xl border border-line bg-void/80 p-1 w-fit gap-1">
                {(["incremental", "full_snapshot"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => { setImportMode(m); setImportPreview(null); setConfirmFullSnapshot(false); }}
                    className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all ${
                      importMode === m ? "bg-accent text-white" : "text-ink-3 hover:text-ink"
                    }`}
                  >
                    {m === "incremental" ? "Incremental (default)" : "Full Snapshot"}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-ink-3">
                {importMode === "incremental"
                  ? "Only updates rows present in the file. All other designs remain unchanged."
                  : "⚠️ Replaces ALL stock. Designs not in this file will be set to 0 rolls."}
              </p>
            </div>

            {/* File upload */}
            <div className="mb-5 rounded-xl border border-dashed border-line bg-void/60 p-5">
              <input
                ref={fileRef}
                id="import-file"
                type="file"
                accept=".csv,.xlsx,.xls,.xlsm,.tsv,.txt"
                onChange={(e) => {
                  setImportFile(e.target.files?.[0] ?? null);
                  setImportPreview(null);
                  setImportResult(null);
                }}
                className="hidden"
              />
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="h-8 w-8 text-ink-3" />
                  <div>
                    <p className="text-sm font-semibold text-ink">
                      {importFile ? importFile.name : "No file chosen"}
                    </p>
                    <p className="text-xs text-ink-3">
                      {importFile
                        ? `${(importFile.size / 1024).toFixed(1)} KB`
                        : "Accepts .csv, .xlsx, .xls, .tsv"}
                    </p>
                  </div>
                </div>
                <label
                  htmlFor="import-file"
                  className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-accent/40 bg-accent/10 px-4 py-2 text-xs font-bold text-accent hover:bg-accent hover:text-white transition-colors"
                >
                  <Upload className="h-3.5 w-3.5" /> Choose File
                </label>
              </div>
            </div>

            <div className="flex gap-3 mb-5">
              <button
                id="import-preview-btn"
                type="button"
                onClick={handlePreview}
                disabled={!importFile || importLoading}
                className="inline-flex items-center gap-2 rounded-xl bg-panel border border-accent/30 px-5 py-2.5 text-xs font-bold text-accent hover:bg-accent hover:text-white transition-colors disabled:opacity-50"
              >
                {importLoading ? (
                  <span className="animate-spin h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full" />
                ) : (
                  <Eye className="h-3.5 w-3.5" />
                )}
                {importLoading ? "Analysing…" : "Preview Import"}
              </button>
            </div>

            {/* Preview */}
            {importPreview && (
              <div className="space-y-4 mb-5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "New", value: importPreview.diff.newRows.length, color: "emerald" },
                    { label: "Changed", value: importPreview.diff.changedRows.length, color: "sky" },
                    { label: "Unchanged", value: importPreview.diff.unchangedRows.length, color: "ink-3" },
                    { label: "Invalid", value: importPreview.invalid.length, color: "rose" },
                  ].map((s) => (
                    <div key={s.label} className="rounded-xl border border-line bg-void/60 p-3 text-center">
                      <div className={`font-display text-2xl font-bold text-${s.color === "ink-3" ? "ink-3" : s.color + "-500"}`}>
                        {s.value}
                      </div>
                      <div className="text-xs text-ink-3 mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>

                {importPreview.invalid.length > 0 && (
                  <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4">
                    <h4 className="text-xs font-bold text-rose-500 mb-2 flex items-center gap-1.5">
                      <XCircle className="h-3.5 w-3.5" /> Invalid Rows (import blocked)
                    </h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {importPreview.invalid.map((row, i) => (
                        <div key={i} className="text-xs text-rose-400">
                          Row {row.lineNumber}: {row.errors.join("; ")}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {importPreview.duplicatesInFile.length > 0 && (
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-400">
                    <AlertTriangle className="inline h-3.5 w-3.5 mr-1" />
                    {importPreview.duplicatesInFile.length} duplicate design number(s) detected in file. Fix before applying.
                  </div>
                )}

                {importPreview.canApply && (
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                    <p className="text-xs text-emerald-400 mb-3 font-semibold">
                      ✅ Preview looks good — ready to apply
                    </p>

                    {importMode === "full_snapshot" && (
                      <label className="flex items-start gap-2 text-xs text-amber-400 mb-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={confirmFullSnapshot}
                          onChange={(e) => setConfirmFullSnapshot(e.target.checked)}
                          className="mt-0.5"
                        />
                        <span>
                          I understand this will set ALL designs not in this file to 0 rolls (out of stock).
                        </span>
                      </label>
                    )}

                    <button
                      id="import-apply-btn"
                      type="button"
                      onClick={handleApplyImport}
                      disabled={
                        importApplying ||
                        (importMode === "full_snapshot" && !confirmFullSnapshot)
                      }
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 transition-colors disabled:opacity-50"
                    >
                      {importApplying ? (
                        <span className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />
                      ) : (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      )}
                      {importApplying ? "Applying…" : "Apply Import"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {importResult && (
              <div
                className={`rounded-lg px-4 py-3 text-xs font-semibold border ${
                  importResult.success
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                    : "bg-rose-500/10 border-rose-500/20 text-rose-500"
                }`}
              >
                {importResult.success ? <CheckCircle2 className="inline h-4 w-4 mr-1.5" /> : <XCircle className="inline h-4 w-4 mr-1.5" />}
                {importResult.message}
              </div>
            )}
          </div>
        )}

        {/* ---- HISTORY TAB ---- */}
        {activeTab === "history" && (
          <div className="rounded-2xl border border-line bg-panel/90 p-6 shadow-xl backdrop-blur-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl font-bold text-ink">Import History</h2>
              <button
                onClick={loadHistory}
                disabled={historyLoading}
                className="inline-flex items-center gap-1.5 text-xs text-ink-3 hover:text-accent transition-colors"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${historyLoading ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-line">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-line bg-void/90 text-ink-3 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">File</th>
                    <th className="px-4 py-3">Mode</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Created</th>
                    <th className="px-4 py-3">Updated</th>
                    <th className="px-4 py-3">Skipped</th>
                    <th className="px-4 py-3">Invalid</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/40 bg-void/40">
                  {imports.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-ink-3">
                        {historyLoading ? "Loading…" : "No imports yet."}
                      </td>
                    </tr>
                  )}
                  {imports.map((imp) => (
                    <tr key={imp.id} className="hover:bg-panel/40">
                      <td className="px-4 py-3 text-ink-3">
                        {new Date(imp.imported_at).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}
                      </td>
                      <td className="px-4 py-3 font-mono text-ink-2">{imp.filename ?? "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded px-1.5 py-0.5 font-bold text-[0.65rem] ${imp.import_mode === "full_snapshot" ? "bg-amber-500/10 text-amber-500" : "bg-sky-500/10 text-sky-400"}`}>
                          {imp.import_mode === "full_snapshot" ? "Full Snapshot" : "Incremental"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-ink">{imp.total_rows}</td>
                      <td className="px-4 py-3 text-emerald-500">{imp.created_rows}</td>
                      <td className="px-4 py-3 text-sky-400">{imp.updated_rows}</td>
                      <td className="px-4 py-3 text-ink-3">{imp.skipped_rows}</td>
                      <td className="px-4 py-3 text-rose-500">{imp.invalid_rows}</td>
                      <td className="px-4 py-3">
                        {imp.error_summary ? (
                          <span className="text-rose-500 font-bold" title={imp.error_summary}>Error</span>
                        ) : (
                          <span className="text-emerald-500 font-bold">OK</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

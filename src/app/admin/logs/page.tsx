"use client";

import { useState, useEffect, useCallback } from "react";
import {
  LogOut,
  Layers,
  RefreshCw,
  ClipboardList,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  ShoppingBag,
} from "lucide-react";

interface AuditLog {
  id: string;
  action_type: string;
  design_number: string;
  previous_quantity: number;
  new_quantity: number;
  delta: number;
  created_by: string;
  created_on: string;
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterType, setFilterType] = useState("ALL");

  const fetchLogs = useCallback(async (type: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/logs?action_type=${type}`, {
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = "/admin/login";
          return;
        }
        throw new Error("Failed to load logs");
      }
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs(filterType);
  }, [filterType, fetchLogs]);

  const handleLogout = async () => {
    await fetch("/api/admin/login", { method: "DELETE", credentials: "include" });
    window.location.href = "/admin/login";
  };

  const actionTypes = ["ALL", "BULK_IMPORT", "MANUAL_ADD", "MANUAL_UPDATE", "ORDER_DEDUCT", "BULK_IMPORT_ZEROED"];

  return (
    <div className="min-h-screen bg-void">
      {/* Header */}
      <header className="border-b border-line bg-panel/90 backdrop-blur-md sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
              <ClipboardList className="h-4 w-4 text-white" />
            </div>
            <div>
              <span className="font-display text-sm font-bold text-ink">Wall King</span>
              <span className="ml-2 text-xs text-ink-3">Audit Logs</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="/admin/stock"
              className="text-xs text-ink-3 hover:text-accent transition-colors flex items-center gap-1"
            >
              <Package className="h-3.5 w-3.5" /> Stock Portal
            </a>
            <a
              href="/admin/orders"
              className="text-xs text-ink-3 hover:text-accent transition-colors flex items-center gap-1"
            >
              <ShoppingBag className="h-3.5 w-3.5" /> Orders
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
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink">Stock Audit Log</h1>
            <p className="text-xs text-ink-3 mt-1">Track every single stock movement historically.</p>
          </div>
          
          <div className="flex gap-1 rounded-xl border border-line bg-void/80 p-1 w-fit overflow-x-auto">
            {actionTypes.map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`inline-flex whitespace-nowrap items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-all ${
                  filterType === type
                    ? "bg-accent text-white shadow-md"
                    : "text-ink-3 hover:text-ink hover:bg-panel"
                }`}
              >
                {type.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm font-semibold text-rose-500">
            {error}
          </div>
        )}

        <div className="rounded-2xl border border-line bg-panel/90 shadow-xl backdrop-blur-xl overflow-hidden">
          <div className="flex items-center justify-between border-b border-line p-4">
            <h2 className="font-display text-sm font-bold text-ink">Recent Activity</h2>
            <button
              onClick={() => fetchLogs(filterType)}
              disabled={loading}
              className="inline-flex items-center gap-1.5 text-xs text-ink-3 hover:text-accent transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-line bg-void/90 text-ink-3 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Design No.</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Old Qty</th>
                  <th className="px-4 py-3">New Qty</th>
                  <th className="px-4 py-3">Delta</th>
                  <th className="px-4 py-3 text-right">User / Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/40 bg-void/40">
                {logs.length === 0 && !loading && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-ink-3">
                      No logs found.
                    </td>
                  </tr>
                )}
                {loading && logs.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-ink-3">
                      <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 opacity-50" />
                      Loading...
                    </td>
                  </tr>
                )}
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-panel/40 transition-colors">
                    <td className="px-4 py-3 text-ink-3">
                      {new Date(log.created_on).toLocaleString("en-IN", {
                        month: "short", day: "numeric", hour: "numeric", minute: "2-digit"
                      })}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-accent">
                      {log.design_number}
                    </td>
                    <td className="px-4 py-3 font-semibold text-ink-2">
                      {log.action_type}
                    </td>
                    <td className="px-4 py-3 text-ink-3">
                      {log.previous_quantity}
                    </td>
                    <td className="px-4 py-3 font-bold text-ink">
                      {log.new_quantity}
                    </td>
                    <td className="px-4 py-3">
                      {log.delta > 0 ? (
                        <span className="inline-flex items-center text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          <ArrowUpRight className="h-3 w-3 mr-0.5" />+{log.delta}
                        </span>
                      ) : log.delta < 0 ? (
                        <span className="inline-flex items-center text-rose-500 font-bold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                          <ArrowDownRight className="h-3 w-3 mr-0.5" />{log.delta}
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-ink-3 font-bold bg-void px-2 py-0.5 rounded border border-line">
                          0
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-ink-3">
                      {log.created_by}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

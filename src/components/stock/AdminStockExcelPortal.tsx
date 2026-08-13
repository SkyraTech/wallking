"use client";

import { useState } from "react";
import { FileSpreadsheet, Upload, Download, CheckCircle2, ExternalLink } from "lucide-react";

/**
 * AdminStockExcelPortal - Public-facing teaser on /stock page.
 * Full admin functionality is at /admin/stock (requires authentication).
 */
export function AdminStockExcelPortal() {
  const features = [
    { icon: <Upload className="h-4 w-4" />, title: "Excel & CSV Upload", desc: "Daily stock updates from your master sheet -- incremental or full snapshot." },
    { icon: <CheckCircle2 className="h-4 w-4" />, title: "Import Preview", desc: "See new, changed, unchanged, and invalid rows before any changes are saved." },
    { icon: <FileSpreadsheet className="h-4 w-4" />, title: "Audit Trail", desc: "Every change is logged -- who changed what, when, and from which import." },
    { icon: <Download className="h-4 w-4" />, title: "CSV Template", desc: "Download the template with correct column headers for your Excel sheet." },
  ];

  return (
    <div className="rounded-2xl border border-line bg-panel/90 p-6 shadow-2xl backdrop-blur-xl md:p-8">
      <div className="mb-8 border-b border-line pb-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-500">
          <FileSpreadsheet className="h-3.5 w-3.5" /> Admin Stock Portal
        </div>
        <h3 className="mt-2 font-display text-2xl font-bold text-ink">
          Daily Excel Stock Update Portal
        </h3>
        <p className="mt-1 text-xs text-ink-3">
          Authenticated admin portal for managing inventory. Updates are immediately reflected in the website search and WhatsApp bot.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 mb-8">
        {features.map((f) => (
          <div key={f.title} className="rounded-xl border border-line bg-void/60 p-4 flex gap-3">
            <span className="text-accent mt-0.5">{f.icon}</span>
            <div>
              <strong className="block text-sm text-ink">{f.title}</strong>
              <p className="mt-0.5 text-xs text-ink-3">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <a
          href="/admin/stock"
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 font-display text-sm font-bold text-white shadow-lg transition-transform hover:scale-105 hover:bg-accent/90"
        >
          <FileSpreadsheet className="h-4 w-4" />
          Open Admin Stock Portal
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
        <a
          href="/api/admin/stock/import?template=true"
          className="inline-flex items-center gap-2 rounded-xl border border-line bg-panel px-5 py-3 text-xs font-semibold text-ink hover:border-accent transition-colors"
        >
          <Download className="h-3.5 w-3.5" />
          Download CSV Template
        </a>
      </div>

      <p className="mt-4 text-xs text-ink-3">
        Admin access is required. Contact your system administrator for credentials.
      </p>
    </div>
  );
}

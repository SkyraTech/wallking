/**
 * POST /api/admin/stock/import
 *
 * Two-step CSV/Excel import:
 *
 * Step 1 — Preview (no DB writes):
 *   POST multipart/form-data { file, mode: "incremental"|"full_snapshot" }
 *   → returns ImportPreview JSON
 *
 * Step 2 — Apply (with DB writes):
 *   POST multipart/form-data {
 *     file, mode,
 *     confirm: "true",
 *     confirm_full_snapshot: "true"  (required when mode=full_snapshot)
 *   }
 *   → returns ImportResult JSON
 *
 * Also supports CSV template download:
 *   GET /api/admin/stock/import?template=true
 *
 * Auth: Authorization: Bearer <ADMIN_SECRET>
 */

import { NextRequest, NextResponse } from "next/server";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import {
  buildImportPreview,
  applyIncrementalImport,
  applyFullSnapshotImport,
  RawImportRow,
} from "@/lib/stock-service";

function checkAdminAuth(req: NextRequest): boolean {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;
  const authHeader = req.headers.get("authorization") ?? "";
  if (authHeader === `Bearer ${secret}`) return true;
  const cookie = req.cookies.get("wk_admin_session")?.value;
  return cookie === secret;
}

// ---------------------------------------------------------------------------
// CSV Template download
// ---------------------------------------------------------------------------

const TEMPLATE_HEADERS = ["Design No.", "Brand", "Stock Qty"];
const TEMPLATE_SAMPLE = [
  ["7517-04", "Erismann", "99"],
  ["ONYX-102", "Marburg", "45"],
  ["BEL-804", "Grandeco", "120"],
];

function buildCsvTemplate(): string {
  const rows = [TEMPLATE_HEADERS, ...TEMPLATE_SAMPLE];
  return rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
}

export async function GET(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  if (searchParams.get("template") === "true") {
    const csv = buildCsvTemplate();
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="wall-king-stock-template.csv"`,
      },
    });
  }

  return NextResponse.json({ imports: [] });
}

// ---------------------------------------------------------------------------
// Parse uploaded file into raw rows
// ---------------------------------------------------------------------------

async function parseFileToRawRows(
  file: File
): Promise<{ rows: RawImportRow[]; filename: string }> {
  const filename = file.name;
  const buffer = await file.arrayBuffer();

  // Excel files
  if (
    filename.endsWith(".xlsx") ||
    filename.endsWith(".xls") ||
    filename.endsWith(".xlsm")
  ) {
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, {
      defval: "",
      raw: false,
    });
    return {
      rows: jsonData.map((raw, i) => ({ lineNumber: i + 2, raw })),
      filename,
    };
  }

  // CSV / TSV / TXT
  const text = new TextDecoder("utf-8").decode(buffer);
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h: string) => h.trim(),
    transform: (val: string) => val.trim(),
  });

  return {
    rows: (parsed.data || []).map((raw: Record<string, string>, i: number) => ({ lineNumber: i + 2, raw })),
    filename,
  };
}

// ---------------------------------------------------------------------------
// POST — preview or apply
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  const mode = (formData.get("mode") as string) || "incremental";
  const confirm = formData.get("confirm") === "true";
  const confirmFullSnapshot = formData.get("confirm_full_snapshot") === "true";

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  if (mode !== "incremental" && mode !== "full_snapshot") {
    return NextResponse.json(
      { error: 'mode must be "incremental" or "full_snapshot"' },
      { status: 400 }
    );
  }

  // Size guard — 10 MB max
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "File exceeds 10 MB limit" }, { status: 413 });
  }

  let rows: RawImportRow[];
  let filename: string;
  try {
    ({ rows, filename } = await parseFileToRawRows(file));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Parse failed";
    return NextResponse.json({ error: `File parse error: ${message}` }, { status: 422 });
  }

  if (rows.length === 0) {
    return NextResponse.json({ error: "File contains no data rows" }, { status: 422 });
  }

  const preview = await buildImportPreview(rows);

  // Step 1 — preview only
  if (!confirm) {
    return NextResponse.json({ preview, mode, filename });
  }

  // Step 2 — apply
  if (!preview.canApply) {
    return NextResponse.json(
      {
        error: "Import has validation errors — fix them before applying",
        preview,
      },
      { status: 422 }
    );
  }

  if (mode === "full_snapshot" && !confirmFullSnapshot) {
    return NextResponse.json(
      {
        error:
          'Full snapshot requires explicit confirmation. Set confirm_full_snapshot=true. ' +
          'This will set all designs not in the file to 0 rolls.',
        preview,
      },
      { status: 422 }
    );
  }

  try {
    const result =
      mode === "full_snapshot"
        ? await applyFullSnapshotImport(preview, filename)
        : await applyIncrementalImport(preview, filename);

    return NextResponse.json({ success: true, result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Import failed";
    console.error("[admin/stock/import] Apply error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

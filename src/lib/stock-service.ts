/**
 * src/lib/stock-service.ts
 * Single source of truth for all stock operations.
 * Server-side only — never import in client components.
 *
 * Exports:
 *   normalizeDesignNumber()   — canonical form for storage & lookup
 *   lookupStock()             — DB query; throws StockLookupError on DB failure
 *   parseImportRows()         — validate & normalize raw CSV/Excel rows
 *   buildImportPreview()      — classify rows before applying
 *   applyIncrementalImport()  — upsert only supplied rows
 *   applyFullSnapshotImport() — replace entire inventory
 */

import { db } from "./db";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface StockItem {
  id: string;
  design_number_display: string;
  design_number_normalized: string;
  brand: string;
  collection: string | null;
  quantity_rolls: number;
  warehouse_location: string;
  updated_at: string;
  created_at: string;
  source_import_id: string | null;
}

/** Returned by lookupStock — no DB internals exposed */
export interface StockLookupResult {
  found: true;
  designNo: string;        // display form
  brand: string;
  collection: string | null;
  quantityRolls: number;
  available: boolean;
  warehouseLocation: string;
  updatedAt: string;
}

export interface StockNotFound {
  found: false;
  designNo: string;        // normalized query used
}

/** Thrown when the database itself fails — callers must handle separately from "not found" */
export class StockLookupError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = "StockLookupError";
  }
}

// ---------------------------------------------------------------------------
// Raw import row (from CSV / Excel before validation)
// ---------------------------------------------------------------------------
export interface RawImportRow {
  lineNumber: number;
  raw: Record<string, string>;  // column header → raw string value
}

export interface ValidatedImportRow {
  lineNumber: number;
  designNumberDisplay: string;
  designNumberNormalized: string;
  brand: string;
  collection: string;
  quantityRolls: number;
  warehouseLocation: string;
}

export interface InvalidImportRow {
  lineNumber: number;
  raw: Record<string, string>;
  errors: string[];
}

export interface ImportPreview {
  valid: ValidatedImportRow[];
  invalid: InvalidImportRow[];
  /** Rows where same normalized key appears more than once in the import file */
  duplicatesInFile: ValidatedImportRow[];
  /** Preview diff against current DB state */
  diff: {
    newRows: ValidatedImportRow[];
    changedRows: ValidatedImportRow[];
    unchangedRows: ValidatedImportRow[];
  };
  canApply: boolean; // false if any invalid or file-level duplicates exist
}

export interface ImportResult {
  importId: string;
  totalRows: number;
  createdRows: number;
  updatedRows: number;
  skippedRows: number;
  invalidRows: number;
  errorSummary?: string;
}

// ---------------------------------------------------------------------------
// Design number normalization
// ---------------------------------------------------------------------------

/**
 * Canonical form:
 *   1. Trim surrounding whitespace
 *   2. Uppercase
 *   3. Collapse multiple spaces/dashes/underscores between segments into a single hyphen
 *   4. Remove any remaining non-alphanumeric except hyphens
 *
 * Examples:
 *   "7517-04"   → "7517-04"
 *   "7517 04"   → "7517-04"
 *   " eco-105 " → "ECO-105"
 *   "ECO  105"  → "ECO-105"
 *   "eco_105"   → "ECO-105"
 */
export function normalizeDesignNumber(raw: string): string {
  if (!raw || typeof raw !== "string") return "";
  return raw
    .trim()
    .toUpperCase()
    .replace(/[\s_]+/g, "-")       // spaces/underscores → hyphen
    .replace(/-{2,}/g, "-")        // multiple hyphens → single
    .replace(/[^A-Z0-9-]/g, "")   // strip everything else
    .replace(/^-+|-+$/g, "");      // strip leading/trailing hyphens
}

/**
 * Attempt to extract a design-number candidate from a free-text message.
 * Returns null if no valid candidate is found.
 *
 * A valid design number must contain:
 *   - at least 3 alphanumeric characters
 *   - optional separator (hyphen, space, underscore)
 *   - after normalization, at least 3 chars
 */


/**
 * Attempt to extract a design-number candidate from a free-text message.
 * Returns null if no valid candidate is found.
 */
export function extractDesignNumberFromText(text: string): string | null {
  if (!text || typeof text !== "string") return null;

  const upper = text.trim().toUpperCase();

  // Pattern matches:
  // 1. Digits + separator + Digits (e.g. 7517-04, 7517 04)
  // 2. Letters + hyphen/underscore + Digits (e.g. ONYX-102, ECO-105, BEL-804)
  // 3. Letters + Digits (e.g. ONYX102, BEL804)
  // 4. Pure digits (4+ length)
  const pattern = /\b([0-9]{3,}[-\s_][0-9]{1,}|[A-Z]{2,6}[-_][0-9]{1,}[A-Z0-9]*|[A-Z]{2,6}[0-9]{2,}[A-Z0-9]*|[0-9]{4,})\b/g;

  const candidates: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(upper)) !== null) {
    const norm = normalizeDesignNumber(match[1]);
    if (norm.length >= 3) {
      candidates.push(norm);
    }
  }

  if (candidates.length === 1) return candidates[0];
  if (candidates.length > 1) {
    return candidates.sort((a, b) => b.length - a.length)[0];
  }

  return null;
}

// ---------------------------------------------------------------------------
// Stock lookup — single source of truth
// ---------------------------------------------------------------------------

/**
 * Look up a design number in the live Supabase database.
 *
 * @throws StockLookupError if the database query itself fails.
 *         Callers MUST distinguish this from "not found" — never return
 *         "Out of Stock" when a DB error occurs.
 */
export async function lookupStock(
  rawDesignNo: string
): Promise<StockLookupResult | StockNotFound> {
  const normalized = normalizeDesignNumber(rawDesignNo);

  if (!normalized) {
    return { found: false, designNo: rawDesignNo };
  }

  let data, error;

  try {
    const result = await db
      .from("stock_items")
      .select(
        "id, design_number_display, design_number_normalized, brand, collection, quantity_rolls, warehouse_location, updated_at"
      )
      .eq("design_number_normalized", normalized)
      .order("quantity_rolls", { ascending: false }) // prefer in-stock when brand ambiguous
      .limit(1)
      .maybeSingle();

    data = result.data;
    error = result.error;
  } catch (e) {
    throw new StockLookupError(
      "Database query failed during stock lookup",
      e
    );
  }

  if (error) {
    throw new StockLookupError(
      `Supabase error during stock lookup: ${error.message}`,
      error
    );
  }

  if (!data) {
    return { found: false, designNo: normalized };
  }

  return {
    found: true,
    designNo: data.design_number_display,
    brand: data.brand,
    collection: data.collection,
    quantityRolls: data.quantity_rolls,
    available: data.quantity_rolls > 0,
    warehouseLocation: data.warehouse_location,
    updatedAt: data.updated_at,
  };
}

// ---------------------------------------------------------------------------
// Import row validation
// ---------------------------------------------------------------------------

const VALID_COLUMNS = ["Design No.", "Brand", "Collection", "Stock Qty", "Warehouse"];

/**
 * Parses a single raw import row.
 * Returns either a ValidatedImportRow or an InvalidImportRow.
 *
 * Accepted column names (case-insensitive):
 *   "Design No.", "Design No", "Design Number", "design_no"
 *   "Brand"
 *   "Collection"
 *   "Stock Qty", "Qty", "Quantity", "Rolls", "Stock Qty (Rolls)"
 *   "Warehouse", "Location"
 */
function resolveColumn(raw: Record<string, string>, ...keys: string[]): string {
  for (const key of keys) {
    for (const [k, v] of Object.entries(raw)) {
      if (k.trim().toLowerCase() === key.toLowerCase()) return v ?? "";
    }
  }
  return "";
}

export function parseImportRow(
  row: RawImportRow
): ValidatedImportRow | InvalidImportRow {
  const errors: string[] = [];

  const designRaw = resolveColumn(
    row.raw,
    "Design No.",
    "Design No",
    "Design Number",
    "design_no",
    "DesignNo"
  );
  const brandRaw = resolveColumn(row.raw, "Brand", "brand");
  const collectionRaw = resolveColumn(row.raw, "Collection", "collection");
  const qtyRaw = resolveColumn(
    row.raw,
    "Stock Qty",
    "Qty",
    "Quantity",
    "Rolls",
    "Stock Qty (Rolls)",
    "stock_qty"
  );
  const warehouseRaw = resolveColumn(row.raw, "Warehouse", "Location", "warehouse");

  // --- Validate design number ---
  if (!designRaw.trim()) {
    errors.push("Design No. is required");
  }
  const designNorm = normalizeDesignNumber(designRaw);
  if (designRaw.trim() && designNorm.length < 2) {
    errors.push(`Design No. "${designRaw}" is too short after normalization`);
  }

  // Accept "99", "99 Rolls", "99 rolls", " 99 ", "-1"
  const qtyMatch = qtyRaw.match(/^\s*(-?\d+)\s*(rolls?)?\s*$/i);
  let quantityRolls = 0;
  if (!qtyRaw.trim()) {
    errors.push("Stock Qty is required");
  } else if (!qtyMatch) {
    errors.push(
      `Stock Qty "${qtyRaw}" is not a valid number (accepted: "99" or "99 Rolls")`
    );
  } else {
    quantityRolls = parseInt(qtyMatch[1], 10);
    if (quantityRolls < 0) {
      errors.push("Stock Qty must be 0 or greater");
    }
  }

  if (errors.length > 0) {
    return { lineNumber: row.lineNumber, raw: row.raw, errors };
  }

  return {
    lineNumber: row.lineNumber,
    designNumberDisplay: designRaw.trim(),
    designNumberNormalized: designNorm,
    brand: brandRaw.trim() || "Wall King Import",
    collection: collectionRaw.trim() || "",
    quantityRolls,
    warehouseLocation: warehouseRaw.trim() || "Hyderabad Central Depot",
  };
}

// ---------------------------------------------------------------------------
// Build import preview (no DB writes)
// ---------------------------------------------------------------------------

export async function buildImportPreview(
  rawRows: RawImportRow[]
): Promise<ImportPreview> {
  const valid: ValidatedImportRow[] = [];
  const invalid: InvalidImportRow[] = [];

  for (const row of rawRows) {
    const parsed = parseImportRow(row);
    if ("errors" in parsed) {
      invalid.push(parsed);
    } else {
      valid.push(parsed);
    }
  }

  // Detect duplicates within the import file itself
  const keyCount: Record<string, number> = {};
  for (const v of valid) {
    const key = `${v.brand}|${v.designNumberNormalized}`;
    keyCount[key] = (keyCount[key] ?? 0) + 1;
  }
  const duplicatesInFile = valid.filter(
    (v) => (keyCount[`${v.brand}|${v.designNumberNormalized}`] ?? 0) > 1
  );
  const uniqueValid = valid.filter(
    (v) => (keyCount[`${v.brand}|${v.designNumberNormalized}`] ?? 0) === 1
  );

  // Compare against current DB state
  const normalizedKeys = uniqueValid.map((v) => v.designNumberNormalized);

  let existingItems: StockItem[] = [];
  if (normalizedKeys.length > 0) {
    const { data, error } = await db
      .from("stock_items")
      .select("*")
      .in("design_number_normalized", normalizedKeys);
    if (!error && data) {
      existingItems = data as StockItem[];
    }
  }

  const existingMap = new Map<string, StockItem>();
  for (const item of existingItems) {
    existingMap.set(`${item.brand}|${item.design_number_normalized}`, item);
  }

  const newRows: ValidatedImportRow[] = [];
  const changedRows: ValidatedImportRow[] = [];
  const unchangedRows: ValidatedImportRow[] = [];

  for (const row of uniqueValid) {
    const key = `${row.brand}|${row.designNumberNormalized}`;
    const existing = existingMap.get(key);
    if (!existing) {
      newRows.push(row);
    } else if (existing.quantity_rolls !== row.quantityRolls) {
      changedRows.push(row);
    } else {
      unchangedRows.push(row);
    }
  }

  return {
    valid: uniqueValid,
    invalid,
    duplicatesInFile,
    diff: { newRows, changedRows, unchangedRows },
    canApply: invalid.length === 0 && duplicatesInFile.length === 0,
  };
}

// ---------------------------------------------------------------------------
// Apply imports (with DB writes)
// ---------------------------------------------------------------------------

async function createImportRecord(
  filename: string | null,
  mode: "incremental" | "full_snapshot",
  totalRows: number
): Promise<string> {
  const { data, error } = await db
    .from("stock_imports")
    .insert({
      filename,
      import_mode: mode,
      uploaded_by: "admin",
      total_rows: totalRows,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(`Failed to create import record: ${error?.message}`);
  }
  return data.id;
}

/**
 * Incremental import — only upsert supplied rows.
 * Rows not in the file are untouched.
 */
export async function applyIncrementalImport(
  preview: ImportPreview,
  filename: string | null = null
): Promise<ImportResult> {
  if (!preview.canApply) {
    throw new Error("Preview has errors — cannot apply import");
  }

  const importId = await createImportRecord(
    filename,
    "incremental",
    preview.valid.length + preview.invalid.length
  );

  const rowsToUpsert = [
    ...preview.diff.newRows,
    ...preview.diff.changedRows,
  ];

  let createdRows = 0;
  let updatedRows = 0;

  for (const row of rowsToUpsert) {
    const { error } = await db.from("stock_items").upsert(
      {
        design_number_display: row.designNumberDisplay,
        design_number_normalized: row.designNumberNormalized,
        brand: row.brand,
        collection: row.collection || null,
        quantity_rolls: row.quantityRolls,
        warehouse_location: row.warehouseLocation,
        updated_at: new Date().toISOString(),
        source_import_id: importId,
      },
      { onConflict: "brand,design_number_normalized" }
    );

    if (error) {
      // Update import record with error and rethrow
      await db
        .from("stock_imports")
        .update({ error_summary: error.message })
        .eq("id", importId);
      throw new Error(`Import failed on row: ${error.message}`);
    }

    if (preview.diff.newRows.includes(row)) {
      createdRows++;
    } else {
      updatedRows++;
    }
  }

  const skippedRows = preview.diff.unchangedRows.length;

  await db
    .from("stock_imports")
    .update({
      created_rows: createdRows,
      updated_rows: updatedRows,
      skipped_rows: skippedRows,
      invalid_rows: preview.invalid.length,
    })
    .eq("id", importId);

  return {
    importId,
    totalRows: preview.valid.length + preview.invalid.length,
    createdRows,
    updatedRows,
    skippedRows,
    invalidRows: preview.invalid.length,
  };
}

/**
 * Full snapshot import — replaces the entire stock_items table.
 * Any design not in the file will be set to quantity_rolls = 0.
 *
 * This runs as two separate operations (set all to 0, then upsert supplied).
 * Note: True transactionality requires a Postgres function for atomic rollback;
 * this MVP implementation is sequentially safe for the normal case.
 */
export async function applyFullSnapshotImport(
  preview: ImportPreview,
  filename: string | null = null
): Promise<ImportResult> {
  if (!preview.canApply) {
    throw new Error("Preview has errors — cannot apply full snapshot import");
  }

  const importId = await createImportRecord(
    filename,
    "full_snapshot",
    preview.valid.length + preview.invalid.length
  );

  // Step 1: Set all existing items to 0 rolls
  const { error: zeroError } = await db
    .from("stock_items")
    .update({
      quantity_rolls: 0,
      updated_at: new Date().toISOString(),
      source_import_id: importId,
    })
    .neq("id", "00000000-0000-0000-0000-000000000000"); // update all rows

  if (zeroError) {
    await db
      .from("stock_imports")
      .update({ error_summary: zeroError.message })
      .eq("id", importId);
    throw new Error(`Full snapshot failed (zeroing step): ${zeroError.message}`);
  }

  // Step 2: Upsert all supplied rows
  let createdRows = 0;
  let updatedRows = 0;

  for (const row of preview.valid) {
    const { error } = await db.from("stock_items").upsert(
      {
        design_number_display: row.designNumberDisplay,
        design_number_normalized: row.designNumberNormalized,
        brand: row.brand,
        collection: row.collection || null,
        quantity_rolls: row.quantityRolls,
        warehouse_location: row.warehouseLocation,
        updated_at: new Date().toISOString(),
        source_import_id: importId,
      },
      { onConflict: "brand,design_number_normalized" }
    );

    if (error) {
      await db
        .from("stock_imports")
        .update({ error_summary: error.message })
        .eq("id", importId);
      throw new Error(`Full snapshot failed (upsert step): ${error.message}`);
    }

    if (preview.diff.newRows.includes(row)) {
      createdRows++;
    } else {
      updatedRows++;
    }
  }

  await db
    .from("stock_imports")
    .update({
      created_rows: createdRows,
      updated_rows: updatedRows,
      skipped_rows: 0,
      invalid_rows: preview.invalid.length,
    })
    .eq("id", importId);

  return {
    importId,
    totalRows: preview.valid.length + preview.invalid.length,
    createdRows,
    updatedRows,
    skippedRows: 0,
    invalidRows: preview.invalid.length,
  };
}

// ---------------------------------------------------------------------------
// Manual single-item upsert
// ---------------------------------------------------------------------------
export async function upsertStockItem(params: {
  designNumberDisplay: string;
  brand: string;
  collection?: string;
  quantityRolls: number;
  warehouseLocation?: string;
  actor?: string;
}): Promise<StockItem> {
  const normalized = normalizeDesignNumber(params.designNumberDisplay);

  if (!normalized || normalized.length < 2) {
    throw new Error("Invalid design number");
  }
  if (params.quantityRolls < 0) {
    throw new Error("Quantity must be 0 or greater");
  }

  const { data, error } = await db
    .from("stock_items")
    .upsert(
      {
        design_number_display: params.designNumberDisplay.trim(),
        design_number_normalized: normalized,
        brand: params.brand?.trim() || "Wall King",
        collection: params.collection?.trim() || null,
        quantity_rolls: params.quantityRolls,
        warehouse_location: params.warehouseLocation?.trim() || "Hyderabad Central Depot",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "brand,design_number_normalized" }
    )
    .select()
    .single();

  if (error || !data) {
    throw new Error(`Failed to upsert stock item: ${error?.message}`);
  }
  return data as StockItem;
}

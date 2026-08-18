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
  quantity_on_hand: number;
  quantity_allocated: number;
  updated_on: string;
  created_on: string;
}

/** Returned by lookupStock — no DB internals exposed */
export interface StockLookupResult {
  found: true;
  designNo: string;        // display form
  brand: string;
  quantityOnHand: number;
  available: boolean;
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
  quantityOnHand: number;
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

/**
 * Parses free text containing multiple design codes and quantities.
 * Example: "BEL-804 100, LOH-201 50" -> [{designCode: "BEL-804", quantity: 100}, ...]
 */
export function parseQuickOrderText(text: string): { designCode: string; quantity: number }[] {
  const results: { designCode: string; quantity: number }[] = [];
  if (!text) return results;

  const upper = text.toUpperCase();
  const designPattern = /([0-9]{3,}[-\s_][0-9]{1,}|[A-Z]{2,6}[-_][0-9]{1,}[A-Z0-9]*|[A-Z]{2,6}[0-9]{2,}[A-Z0-9]*|[0-9]{4,})/g;
  
  // Split by comma or newline so each line/segment is evaluated independently
  const chunks = upper.split(/[,;\n]/);
  
  for (const chunk of chunks) {
    const designMatches = [...chunk.matchAll(designPattern)];
    if (designMatches.length > 0) {
      // Find the design code
      const designRaw = designMatches[0][1];
      const norm = normalizeDesignNumber(designRaw);
      
      // Remove the design code from the chunk so we can find the standalone quantity
      const withoutDesign = chunk.replace(designMatches[0][0], ' ');
      
      // Look for the first standalone number in the rest of the chunk
      const qtyMatch = withoutDesign.match(/\b(\d+)\b/);
      if (qtyMatch) {
         const qty = parseInt(qtyMatch[1], 10);
         if (qty > 0 && norm.length >= 3) {
            results.push({ designCode: norm, quantity: qty });
         }
      }
    }
  }
  return results;
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
        "id, design_number_display, design_number_normalized, brand, quantity_on_hand, quantity_allocated, updated_on"
      )
      .eq("design_number_normalized", normalized)
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
    quantityOnHand: data.quantity_on_hand,
    available: (data.quantity_on_hand - data.quantity_allocated) > 0,
    updatedAt: data.updated_on,
  };
}

// ---------------------------------------------------------------------------
// Import row validation
// ---------------------------------------------------------------------------

const VALID_COLUMNS = ["Design No.", "Brand", "Stock Qty"];

/**
 * Parses a single raw import row.
 * Returns either a ValidatedImportRow or an InvalidImportRow.
 *
 * Accepted column names (case-insensitive):
 *   "Design No.", "Design No", "Design Number", "design_no"
 *   "Brand"
 *   "Stock Qty", "Qty", "Quantity", "Rolls", "Stock Qty (Rolls)"
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
  const qtyRaw = resolveColumn(
    row.raw,
    "Stock Qty",
    "Qty",
    "Quantity",
    "Rolls",
    "Stock Qty (Rolls)",
    "stock_qty"
  );

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
  let quantityOnHand = 0;
  if (!qtyRaw.trim()) {
    errors.push("Stock Qty is required");
  } else if (!qtyMatch) {
    errors.push(
      `Stock Qty "${qtyRaw}" is not a valid number (accepted: "99" or "99 Rolls")`
    );
  } else {
    quantityOnHand = parseInt(qtyMatch[1], 10);
    if (quantityOnHand < 0) {
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
    quantityOnHand,
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
    } else if (existing.quantity_on_hand !== row.quantityOnHand) {
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


/**
 * Incremental import — only upsert supplied rows.
 * Rows not in the file are untouched.
 */
export async function applyIncrementalImport(
  preview: ImportPreview,
  filename: string | null = null,
  actor: string = "SYSTEM"
): Promise<ImportResult> {
  if (!preview.canApply) {
    throw new Error("Preview has errors — cannot apply import");
  }

  const rowsToUpsert = [
    ...preview.diff.newRows,
    ...preview.diff.changedRows,
  ];

  let createdRows = 0;
  let updatedRows = 0;
  
  const { data: allExisting } = await db.from("stock_items").select("design_number_normalized, quantity_on_hand");
  const qtyMap = new Map(allExisting?.map(item => [item.design_number_normalized, item.quantity_on_hand]) || []);
  let auditLogs: any[] = [];

  for (const row of rowsToUpsert) {
    const oldQty = qtyMap.get(row.designNumberNormalized);
    const isNew = oldQty === undefined;

    const { error } = await db.from("stock_items").upsert(
      {
        design_number_display: row.designNumberDisplay,
        design_number_normalized: row.designNumberNormalized,
        brand: row.brand,
        quantity_on_hand: row.quantityOnHand,
        updated_on: new Date().toISOString(),
      },
      { onConflict: "design_number_normalized" }
    );

    if (error) {
      throw new Error(`Import failed on row: ${error.message}`);
    }

    if (isNew) {
      createdRows++;
    } else {
      updatedRows++;
    }
    
    const prev = isNew ? 0 : oldQty;
    if (prev !== row.quantityOnHand) {
      auditLogs.push({
        action_type: "BULK_IMPORT",
        design_number: row.designNumberDisplay,
        previous_quantity: prev,
        new_quantity: row.quantityOnHand,
        delta: row.quantityOnHand - prev,
        created_by: actor
      });
    }
  }
  
  if (auditLogs.length > 0) {
    await db.from("stock_audit_logs").insert(auditLogs);
  }

  const skippedRows = preview.diff.unchangedRows.length;

  return {
    totalRows: preview.valid.length + preview.invalid.length,
    createdRows,
    updatedRows,
    skippedRows,
    invalidRows: preview.invalid.length,
  };
}

/**
 * Full snapshot import — replaces the entire stock_items table.
 * Any design not in the file will be set to quantity_on_hand = 0.
 *
 * This runs as two separate operations (set all to 0, then upsert supplied).
 * Note: True transactionality requires a Postgres function for atomic rollback;
 * this MVP implementation is sequentially safe for the normal case.
 */
export async function applyFullSnapshotImport(
  preview: ImportPreview,
  filename: string | null = null,
  actor: string = "SYSTEM"
): Promise<ImportResult> {
  if (!preview.canApply) {
    throw new Error("Preview has errors — cannot apply full snapshot import");
  }

  const { data: allExisting } = await db.from("stock_items").select("design_number_normalized, quantity_on_hand, design_number_display");
  const existingMap = new Map(allExisting?.map(item => [item.design_number_normalized, item]) || []);
  let auditLogs: any[] = [];

  // Step 1: Set all existing items to 0 rolls
  const { error: zeroError } = await db
    .from("stock_items")
    .update({
      quantity_on_hand: 0,
      updated_on: new Date().toISOString(),
    })
    .neq("id", "00000000-0000-0000-0000-000000000000"); // update all rows

  if (zeroError) {
    throw new Error(`Full snapshot failed (zeroing step): ${zeroError.message}`);
  }
  
  // Log all existing items going to 0 that are NOT in the import file
  const validNorms = new Set(preview.valid.map(r => r.designNumberNormalized));
  for (const [norm, item] of existingMap.entries()) {
    if (!validNorms.has(norm) && item.quantity_on_hand > 0) {
      auditLogs.push({
        action_type: "BULK_IMPORT_ZEROED",
        design_number: item.design_number_display,
        previous_quantity: item.quantity_on_hand,
        new_quantity: 0,
        delta: -item.quantity_on_hand,
        created_by: actor
      });
    }
  }

  // Step 2: Upsert all supplied rows
  let createdRows = 0;
  let updatedRows = 0;

  for (const row of preview.valid) {
    const existing = existingMap.get(row.designNumberNormalized);
    const oldQty = existing ? existing.quantity_on_hand : 0;
    
    const { error } = await db.from("stock_items").upsert(
      {
        design_number_display: row.designNumberDisplay,
        design_number_normalized: row.designNumberNormalized,
        brand: row.brand,
        quantity_on_hand: row.quantityOnHand,
        updated_on: new Date().toISOString(),
      },
      { onConflict: "design_number_normalized" }
    );

    if (error) {
      throw new Error(`Full snapshot failed (upsert step): ${error.message}`);
    }

    if (!existing) {
      createdRows++;
    } else {
      updatedRows++;
    }
    
    if (oldQty !== row.quantityOnHand) {
      auditLogs.push({
        action_type: "BULK_IMPORT",
        design_number: row.designNumberDisplay,
        previous_quantity: oldQty,
        new_quantity: row.quantityOnHand,
        delta: row.quantityOnHand - oldQty,
        created_by: actor
      });
    }
  }
  
  if (auditLogs.length > 0) {
    await db.from("stock_audit_logs").insert(auditLogs);
  }

  return {
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
  quantityOnHand: number;
  actor?: string;
}): Promise<StockItem> {
  const normalized = normalizeDesignNumber(params.designNumberDisplay);

  if (!normalized || normalized.length < 2) {
    throw new Error("Invalid design number");
  }
  if (params.quantityOnHand < 0) {
    throw new Error("Quantity must be 0 or greater");
  }
  
  const { data: existing } = await db
    .from("stock_items")
    .select("quantity_on_hand")
    .eq("design_number_normalized", normalized)
    .single();
    
  const oldQty = existing ? existing.quantity_on_hand : 0;

  const { data, error } = await db
    .from("stock_items")
    .upsert(
      {
        design_number_display: params.designNumberDisplay.trim(),
        design_number_normalized: normalized,
        brand: params.brand?.trim() || "Wall King",
        quantity_on_hand: params.quantityOnHand,
        updated_on: new Date().toISOString(),
      },
      { onConflict: "design_number_normalized" }
    )
    .select()
    .single();

  if (error || !data) {
    throw new Error(`Failed to upsert stock item: ${error?.message}`);
  }
  
  if (oldQty !== params.quantityOnHand) {
    await db.from("stock_audit_logs").insert({
      action_type: existing ? "MANUAL_UPDATE" : "MANUAL_ADD",
      design_number: params.designNumberDisplay.trim(),
      previous_quantity: oldQty,
      new_quantity: params.quantityOnHand,
      delta: params.quantityOnHand - oldQty,
      created_by: params.actor || "SYSTEM"
    });
  }
  
  return data as StockItem;
}

// ---------------------------------------------------------------------------
// WhatsApp State Machine Helpers
// ---------------------------------------------------------------------------

export async function fetchBrands(page: number): Promise<{ brands: string[], hasNextPage: boolean }> {
  const pageSize = 9;
  const { data, error } = await db.rpc('get_unique_brands', {
    page_size: pageSize + 1, // Fetch one extra to determine if there's a next page
    page_num: page
  });

  if (error) {
    console.error("fetchBrands RPC error:", error);
    return { brands: [], hasNextPage: false };
  }

  const brands = (data || []).map((row: any) => row.brand as string);
  const hasNextPage = brands.length > pageSize;
  
  if (hasNextPage) {
    brands.pop(); // Remove the extra item
  }

  return { brands, hasNextPage };
}

export async function fetchDesignsByBrand(brand: string, page: number): Promise<{ designs: string[], hasNextPage: boolean }> {
  const pageSize = 9;
  const { data, error } = await db.rpc('get_designs_by_brand', {
    p_brand: brand,
    page_size: pageSize + 1,
    page_num: page
  });

  if (error) {
    console.error("fetchDesignsByBrand RPC error:", error);
    return { designs: [], hasNextPage: false };
  }

  const designs = (data || []).map((row: any) => row.design_number_display as string);
  const hasNextPage = designs.length > pageSize;
  
  if (hasNextPage) {
    designs.pop();
  }

  return { designs, hasNextPage };
}

export async function createOrder(payload: {
  senderPhone: string;
  designNumber: string;
  brand: string;
  quantityRequested: number;
}) {
  const { senderPhone, designNumber, quantityRequested } = payload;
  const normalized = normalizeDesignNumber(designNumber);

  // 1. Upsert Dealer
  await db.from("dealers").upsert(
    { phone_number: senderPhone, business_name: "WhatsApp User" },
    { onConflict: "phone_number" }
  );

  // 2. Find or Create Order Header
  let { data: order } = await db.from("orders")
    .select("id")
    .eq("dealer_phone", senderPhone)
    .eq("status", "in_cart")
    .single();

  if (!order) {
    const { data: newOrder, error: orderErr } = await db.from("orders")
      .insert({ dealer_phone: senderPhone, status: "in_cart", order_source: "WHATSAPP" })
      .select("id")
      .single();
    if (orderErr) throw orderErr;
    order = newOrder;
  }

  // 3. Find Stock Item ID
  const { data: stock } = await db.from("stock_items")
    .select("id, quantity_allocated")
    .eq("design_number_normalized", normalized)
    .single();

  if (!stock) {
    throw new Error(`Stock item ${designNumber} not found.`);
  }

  // 4. Find Existing Order Item
  const { data: existingItem } = await db.from("order_items")
    .select("id, quantity")
    .eq("order_id", order!.id)
    .eq("stock_item_id", stock.id)
    .single();

  if (quantityRequested === 0) {
    if (existingItem) {
      // Remove from cart and release allocation
      await db.from("order_items").delete().eq("id", existingItem.id);
      const newAllocated = Math.max(0, stock.quantity_allocated - existingItem.quantity);
      await db.from("stock_items").update({ quantity_allocated: newAllocated }).eq("id", stock.id);
    }
    return;
  }

  // Calculate allocation diff
  const oldQty = existingItem ? existingItem.quantity : 0;
  const diff = quantityRequested - oldQty;
  const newAllocated = stock.quantity_allocated + diff;

  if (existingItem) {
    await db.from("order_items").update({ quantity: quantityRequested }).eq("id", existingItem.id);
  } else {
    await db.from("order_items").insert({
      order_id: order!.id,
      stock_item_id: stock.id,
      quantity: quantityRequested
    });
  }

  // Update allocation
  await db.from("stock_items")
    .update({ quantity_allocated: newAllocated })
    .eq("id", stock.id);
}

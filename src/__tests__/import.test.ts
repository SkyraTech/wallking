/**
 * Tests for CSV/Excel import parsing, validation, and preview logic.
 */

import { describe, it, expect, vi } from "vitest";
import { parseImportRow, buildImportPreview } from "../lib/stock-service";
import type { RawImportRow } from "../lib/stock-service";

// Mock the Supabase db for buildImportPreview
vi.mock("../lib/db", () => ({
  db: {
    from: () => ({
      select: () => ({
        in: () =>
          Promise.resolve({
            data: [
              {
                id: "uuid-1",
                design_number_display: "7517-04",
                design_number_normalized: "7517-04",
                brand: "Erismann",
                collection: "Eco-X Premier",
                quantity_on_hand: 99,
                warehouse_location: "Hyderabad Central Depot",
                updated_on: "2026-08-12T10:00:00Z",
                created_on: "2026-08-01T10:00:00Z",
                source_import_id: null,
              },
            ],
            error: null,
          }),
      }),
    }),
  },
}));

// ---------------------------------------------------------------------------
// parseImportRow
// ---------------------------------------------------------------------------

function makeRow(overrides: Record<string, string> = {}): RawImportRow {
  return {
    lineNumber: 2,
    raw: {
      "Design No.": "7517-04",
      "Brand": "Erismann",
      "Collection": "Eco-X Premier",
      "Stock Qty": "99",
      "Warehouse": "Hyderabad Central Depot",
      ...overrides,
    },
  };
}

describe("parseImportRow — valid cases", () => {
  it("parses numeric quantity", () => {
    const r = parseImportRow(makeRow());
    expect("errors" in r).toBe(false);
    if (!("errors" in r)) expect(r.quantityOnHand).toBe(99);
  });

  it("parses '99 Rolls' quantity", () => {
    const r = parseImportRow(makeRow({ "Stock Qty": "99 Rolls" }));
    if (!("errors" in r)) expect(r.quantityOnHand).toBe(99);
  });

  it("parses '0' as zero rolls (out of stock, not error)", () => {
    const r = parseImportRow(makeRow({ "Stock Qty": "0" }));
    expect("errors" in r).toBe(false);
    if (!("errors" in r)) expect(r.quantityOnHand).toBe(0);
  });

  it("normalizes design number to uppercase hyphenated form", () => {
    const r = parseImportRow(makeRow({ "Design No.": "eco 105" }));
    if (!("errors" in r)) expect(r.designNumberNormalized).toBe("ECO-105");
  });

  it("defaults brand to 'Wall King Import' when blank", () => {
    const r = parseImportRow(makeRow({ "Brand": "" }));
    if (!("errors" in r)) expect(r.brand).toBe("Wall King Import");
  });

});

describe("parseImportRow — invalid cases", () => {
  it("rejects missing design number", () => {
    const r = parseImportRow(makeRow({ "Design No.": "" }));
    expect("errors" in r).toBe(true);
  });

  it("rejects negative quantity", () => {
    const r = parseImportRow(makeRow({ "Stock Qty": "-1" }));
    expect("errors" in r).toBe(true);
    if ("errors" in r) expect(r.errors.some((e) => e.includes("0 or greater"))).toBe(true);
  });

  it("rejects text-only quantity", () => {
    const r = parseImportRow(makeRow({ "Stock Qty": "many" }));
    expect("errors" in r).toBe(true);
  });

  it("rejects missing quantity", () => {
    const r = parseImportRow(makeRow({ "Stock Qty": "" }));
    expect("errors" in r).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// buildImportPreview
// ---------------------------------------------------------------------------

describe("buildImportPreview", () => {
  it("classifies a new row correctly", async () => {
    const rows: RawImportRow[] = [
      makeRow({ "Design No.": "BRAND-NEW-999", "Brand": "Marburg", "Stock Qty": "50" }),
    ];
    const preview = await buildImportPreview(rows);
    expect(preview.diff.newRows.length).toBe(1);
    expect(preview.diff.changedRows.length).toBe(0);
    expect(preview.invalid.length).toBe(0);
    expect(preview.canApply).toBe(true);
  });

  it("classifies a changed row correctly (quantity different from DB)", async () => {
    const rows: RawImportRow[] = [
      makeRow({ "Stock Qty": "50" }), // DB has 99, import has 50
    ];
    const preview = await buildImportPreview(rows);
    expect(preview.diff.changedRows.length).toBe(1);
    expect(preview.diff.unchangedRows.length).toBe(0);
  });

  it("classifies an unchanged row correctly (same quantity as DB)", async () => {
    const rows: RawImportRow[] = [
      makeRow({ "Stock Qty": "99" }), // DB has 99, import has 99
    ];
    const preview = await buildImportPreview(rows);
    expect(preview.diff.unchangedRows.length).toBe(1);
    expect(preview.diff.changedRows.length).toBe(0);
  });

  it("marks canApply=false when there are invalid rows", async () => {
    const rows: RawImportRow[] = [
      makeRow({ "Stock Qty": "-5" }), // invalid
    ];
    const preview = await buildImportPreview(rows);
    expect(preview.canApply).toBe(false);
    expect(preview.invalid.length).toBe(1);
  });

  it("detects file-level duplicates", async () => {
    const rows: RawImportRow[] = [
      makeRow({ "Design No.": "DUP-001", "Brand": "TestBrand", "Stock Qty": "10" }),
      makeRow({ "Design No.": "DUP-001", "Brand": "TestBrand", "Stock Qty": "20" }),
    ];
    const preview = await buildImportPreview(rows);
    expect(preview.duplicatesInFile.length).toBe(2);
    expect(preview.canApply).toBe(false);
  });
});

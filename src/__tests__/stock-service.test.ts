/**
 * Tests for normalizeDesignNumber, parseImportRow, buildImportPreview,
 * extractDesignNumberFromText, and reply builders.
 */

import { describe, it, expect } from "vitest";
import {
  normalizeDesignNumber,
  parseImportRow,
  extractDesignNumberFromText,
} from "../lib/stock-service";
import {
  buildAvailableReply,
  buildOutOfStockReply,
  buildNotFoundReply,
  buildSafeFailureReply,
  detectSpecialCommand,
} from "../lib/whatsapp-api";
import type { StockLookupResult } from "../lib/stock-service";

// ---------------------------------------------------------------------------
// normalizeDesignNumber
// ---------------------------------------------------------------------------
describe("normalizeDesignNumber", () => {
  it("uppercases and trims", () => {
    expect(normalizeDesignNumber("  7517-04  ")).toBe("7517-04");
  });

  it("converts spaces to hyphens", () => {
    expect(normalizeDesignNumber("7517 04")).toBe("7517-04");
  });

  it("collapses multiple hyphens", () => {
    expect(normalizeDesignNumber("7517--04")).toBe("7517-04");
  });

  it("converts underscores to hyphens", () => {
    expect(normalizeDesignNumber("ECO_105")).toBe("ECO-105");
  });

  it("strips non-alphanumeric non-hyphen chars", () => {
    expect(normalizeDesignNumber("BEL.804")).toBe("BEL804");
  });

  it("handles already-normalized input", () => {
    expect(normalizeDesignNumber("ONYX-102")).toBe("ONYX-102");
  });

  it("returns empty string for empty input", () => {
    expect(normalizeDesignNumber("")).toBe("");
  });

  it("handles multi-space between segments", () => {
    expect(normalizeDesignNumber("ECO  105")).toBe("ECO-105");
  });
});

// ---------------------------------------------------------------------------
// extractDesignNumberFromText
// ---------------------------------------------------------------------------
describe("extractDesignNumberFromText", () => {
  it("extracts plain design number", () => {
    expect(extractDesignNumberFromText("7517-04")).toBe("7517-04");
  });

  it("extracts from natural language", () => {
    const result = extractDesignNumberFromText("Need stock for 7517-04 please");
    expect(result).toBe("7517-04");
  });

  it("extracts from space-separated variant", () => {
    expect(extractDesignNumberFromText("7517 04 available?")).toBe("7517-04");
  });

  it("extracts alpha-numeric design number", () => {
    const result = extractDesignNumberFromText("Check ECO-105");
    expect(result).toBe("ECO-105");
  });

  it("returns null for generic text with no design number", () => {
    const result = extractDesignNumberFromText("Hello I need help");
    expect(result).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(extractDesignNumberFromText("")).toBeNull();
  });

  it("handles uppercase ONYX-102", () => {
    expect(extractDesignNumberFromText("ONYX-102")).toBe("ONYX-102");
  });
});

// ---------------------------------------------------------------------------
// parseImportRow
// ---------------------------------------------------------------------------
describe("parseImportRow", () => {
  const validRaw = {
    "Design No.": "7517-04",
    "Brand": "Erismann",
    "Collection": "Eco-X Premier",
    "Stock Qty": "99",
    "Warehouse": "Hyderabad Central Depot",
  };

  it("parses a valid row", () => {
    const result = parseImportRow({ lineNumber: 2, raw: validRaw });
    expect("errors" in result).toBe(false);
    if (!("errors" in result)) {
      expect(result.designNumberNormalized).toBe("7517-04");
      expect(result.quantityOnHand).toBe(99);
      expect(result.brand).toBe("Erismann");
    }
  });

  it("accepts '99 Rolls' quantity", () => {
    const result = parseImportRow({ lineNumber: 2, raw: { ...validRaw, "Stock Qty": "99 Rolls" } });
    expect("errors" in result).toBe(false);
    if (!("errors" in result)) {
      expect(result.quantityOnHand).toBe(99);
    }
  });

  it("rejects negative quantity", () => {
    const result = parseImportRow({ lineNumber: 2, raw: { ...validRaw, "Stock Qty": "-5" } });
    expect("errors" in result).toBe(true);
    if ("errors" in result) {
      expect(result.errors.some((e) => e.includes("0 or greater"))).toBe(true);
    }
  });

  it("rejects missing design number", () => {
    const result = parseImportRow({ lineNumber: 2, raw: { ...validRaw, "Design No.": "" } });
    expect("errors" in result).toBe(true);
    if ("errors" in result) {
      expect(result.errors.some((e) => e.includes("required"))).toBe(true);
    }
  });

  it("rejects non-numeric quantity", () => {
    const result = parseImportRow({ lineNumber: 2, raw: { ...validRaw, "Stock Qty": "lots" } });
    expect("errors" in result).toBe(true);
  });

  it("rejects missing quantity", () => {
    const result = parseImportRow({ lineNumber: 2, raw: { ...validRaw, "Stock Qty": "" } });
    expect("errors" in result).toBe(true);
  });

  it("normalizes the design number", () => {
    const result = parseImportRow({ lineNumber: 2, raw: { ...validRaw, "Design No.": "eco 105" } });
    if (!("errors" in result)) {
      expect(result.designNumberNormalized).toBe("ECO-105");
    }
  });
});

// ---------------------------------------------------------------------------
// Reply builders
// ---------------------------------------------------------------------------
const mockStockResult: StockLookupResult = {
  found: true,
  designNo: "7517-04",
  brand: "Erismann",
  quantityOnHand: 99,
  available: true,
  updatedAt: "2026-08-12T10:00:00Z",
};

describe("buildAvailableReply", () => {
  it("contains design number", () => {
    expect(buildAvailableReply(mockStockResult)).toContain("7517-04");
  });

  it("contains roll quantity", () => {
    expect(buildAvailableReply(mockStockResult)).toContain("99 Rolls");
  });

  it("contains brand", () => {
    expect(buildAvailableReply(mockStockResult)).toContain("Erismann");
  });

  it("contains disclaimer", () => {
    expect(buildAvailableReply(mockStockResult)).toContain("subject to final order confirmation");
  });

  it("does NOT say Out of Stock", () => {
    expect(buildAvailableReply(mockStockResult)).not.toContain("Out of Stock");
  });
});

describe("buildOutOfStockReply", () => {
  it("contains design number", () => {
    expect(buildOutOfStockReply("7517-04")).toContain("7517-04");
  });

  it("contains Out of Stock", () => {
    expect(buildOutOfStockReply("7517-04")).toContain("Out of Stock");
  });

  it("contains AGENT suggestion", () => {
    expect(buildOutOfStockReply("7517-04")).toContain("AGENT");
  });
});

describe("buildNotFoundReply", () => {
  it("does not say Out of Stock", () => {
    expect(buildNotFoundReply("XYZ-999")).not.toContain("Out of Stock");
  });

  it("provides example format", () => {
    expect(buildNotFoundReply("XYZ-999")).toContain("7517-04");
  });
});

describe("buildSafeFailureReply", () => {
  it("does not say Out of Stock", () => {
    expect(buildSafeFailureReply()).not.toContain("Out of Stock");
  });

  it("mentions trying again", () => {
    expect(buildSafeFailureReply()).toMatch(/try again|unable to check/i);
  });
});

// ---------------------------------------------------------------------------
// detectSpecialCommand
// ---------------------------------------------------------------------------
describe("detectSpecialCommand", () => {
  it("detects HELP", () => {
    expect(detectSpecialCommand("HELP")).toBe("HELP");
  });

  it("detects HELLO as HELP", () => {
    expect(detectSpecialCommand("hello")).toBe("HELP");
  });

  it("detects AGENT", () => {
    expect(detectSpecialCommand("AGENT")).toBe("AGENT");
  });

  it("detects HUMAN as AGENT", () => {
    expect(detectSpecialCommand("human")).toBe("AGENT");
  });

  it("detects ORDER", () => {
    expect(detectSpecialCommand("ORDER")).toBe("ORDER");
  });

  it("returns null for design numbers", () => {
    expect(detectSpecialCommand("7517-04")).toBeNull();
  });
});

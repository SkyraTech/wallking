import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import * as xlsx from "xlsx";
import { parseImportRow } from "@/lib/stock-service";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "Sample Stock.xlsx");
    const fileBuffer = await fs.readFile(filePath);
    
    const workbook = xlsx.read(fileBuffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const rawData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: "" }) as Record<string, any>[];

    const validRows: any[] = [];
    rawData.forEach((row, idx) => {
      const parsed = parseImportRow({ lineNumber: idx + 2, raw: row });
      if (!("errors" in parsed)) {
        validRows.push(parsed);
      }
    });

    const toInsert = validRows.map(r => ({
      design_number_display: r.designNumberDisplay,
      design_number_normalized: r.designNumberNormalized,
      brand: r.brand,
      quantity_on_hand: r.quantityOnHand,
      updated_on: new Date().toISOString()
    }));

    if (toInsert.length > 0) {
      const { error } = await db.from("stock_items").upsert(toInsert, { onConflict: "design_number_normalized" });
      if (error) throw error;
    }

    return NextResponse.json({ success: true, count: toInsert.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

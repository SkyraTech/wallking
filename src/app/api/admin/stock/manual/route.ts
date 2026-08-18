/**
 * POST /api/admin/stock/manual
 *
 * Add or update a single stock item.
 * Auth: Authorization: Bearer <ADMIN_SECRET>
 *
 * Body: { designNo, brand, collection?, quantityOnHand, warehouseLocation? }
 */
import { NextRequest, NextResponse } from "next/server";
import { upsertStockItem } from "@/lib/stock-service";

function checkAdminAuth(req: NextRequest): boolean {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;
  const authHeader = req.headers.get("authorization") ?? "";
  if (authHeader === `Bearer ${secret}`) return true;
  const cookie = req.cookies.get("wk_admin_session")?.value;
  return cookie === secret;
}

export async function POST(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const {
    designNo,
    brand,
    collection,
    quantityOnHand,
    warehouseLocation,
  } = body as Record<string, unknown>;

  if (!designNo || typeof designNo !== "string") {
    return NextResponse.json({ error: "designNo is required" }, { status: 400 });
  }
  if (typeof quantityOnHand !== "number" || quantityOnHand < 0) {
    return NextResponse.json(
      { error: "quantityOnHand must be a non-negative integer" },
      { status: 400 }
    );
  }

  try {
    const item = await upsertStockItem({
      designNumberDisplay: String(designNo),
      brand: brand ? String(brand) : "Wall King",
      quantityOnHand: Math.floor(Number(quantityOnHand)),
    });

    return NextResponse.json({ success: true, item });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[admin/stock/manual] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

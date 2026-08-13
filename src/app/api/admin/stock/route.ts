/**
 * /api/admin/stock
 *
 * Protected admin route for reading all stock items.
 * All write operations go through /api/admin/stock/manual and /api/admin/stock/import.
 *
 * Auth: Authorization: Bearer <ADMIN_SECRET>
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

function checkAdminAuth(req: NextRequest): boolean {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;
  const authHeader = req.headers.get("authorization") ?? "";
  if (authHeader === `Bearer ${secret}`) return true;
  // Also accept cookie-based session (set by middleware)
  const cookie = req.cookies.get("wk_admin_session")?.value;
  return cookie === secret;
}

export async function GET(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(500, parseInt(searchParams.get("limit") ?? "200", 10));
  const search = searchParams.get("search") ?? "";

  let query = db
    .from("stock_items")
    .select("*", { count: "exact" })
    .order("updated_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (search) {
    query = query.ilike("design_number_normalized", `%${search.toUpperCase()}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("[admin/stock] GET error:", error.message);
    return NextResponse.json({ error: "Database error", details: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, stock: data, total: count, page, limit });
}

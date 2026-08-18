import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

function checkAdminAuth(req: NextRequest): boolean {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;
  const cookie = req.cookies.get("wk_admin_session")?.value;
  return cookie === secret;
}

export async function GET(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") || "100", 10);
  const actionType = searchParams.get("action_type");

  let query = db.from("stock_audit_logs").select("*").order("created_on", { ascending: false }).limit(limit);

  if (actionType && actionType !== "ALL") {
    query = query.eq("action_type", actionType);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ logs: data });
}

/**
 * POST /api/admin/login
 * Validates the admin password and sets a session cookie.
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) {
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  if (!body.email || !body.password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }

  // Verify against Supabase
  const { data: isValid, error } = await db.rpc('verify_admin_login', {
    p_email: body.email,
    p_password: body.password
  });

  if (error) {
    console.error("Login RPC error:", error);
    return NextResponse.json({ error: "Authentication service error" }, { status: 500 });
  }

  if (!isValid) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const res = NextResponse.json({ success: true });
  res.cookies.set("wk_admin_session", adminSecret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24, // 24 hours
    path: "/",
  });
  return res;
}

export async function DELETE(req: NextRequest) {
  const res = NextResponse.json({ success: true });
  res.cookies.delete("wk_admin_session");
  return res;
}

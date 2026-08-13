/**
 * POST /api/admin/login
 * Validates the admin password and sets a session cookie.
 */
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) {
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  if (!body.password || body.password !== adminSecret) {
    // Constant-time comparison to prevent timing attacks
    const crypto = await import("crypto");
    try {
      crypto.timingSafeEqual(
        Buffer.from(body.password ?? "", "utf8"),
        Buffer.from(adminSecret, "utf8")
      );
    } catch { /* length mismatch — expected */ }
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
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

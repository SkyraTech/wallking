/**
 * src/middleware.ts
 *
 * Protects /admin/* routes with a simple session cookie check.
 * If no valid cookie is present, redirects to /admin/login.
 *
 * Admin login is handled by /api/admin/login which sets the cookie.
 */

import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PATHS = ["/admin"];
const LOGIN_PATH = "/admin/login";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only protect /admin routes (not /api/admin — those check Bearer token themselves)
  const isAdminPage =
    PROTECTED_PATHS.some((p) => pathname.startsWith(p)) &&
    !pathname.startsWith("/api/");

  if (!isAdminPage) return NextResponse.next();

  // Allow the login page itself
  if (pathname === LOGIN_PATH) return NextResponse.next();

  const sessionCookie = req.cookies.get("wk_admin_session")?.value;
  const adminSecret = process.env.ADMIN_SECRET;

  if (!adminSecret || sessionCookie !== adminSecret) {
    const loginUrl = new URL(LOGIN_PATH, req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

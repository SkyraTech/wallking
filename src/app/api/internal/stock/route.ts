/**
 * GET /api/internal/stock?designNo=7517-04
 *
 * The single authoritative stock lookup endpoint.
 * Used by:
 *   1. Website stock-search widget (client-side fetch)
 *   2. WhatsApp webhook handler (server-side fetch / direct import)
 *
 * Security:
 *   - Server-side only credentials (Supabase service key)
 *   - No browser-exposed secrets
 *   - Simple in-memory rate limiting per IP (MVP; upgrade to Redis/Upstash for production)
 *
 * Response shape:
 *   { found: true,  designNo, brand, collection, quantityOnHand, available, warehouseLocation, updatedAt }
 *   { found: false, designNo }
 *   { found: false, designNo, error: "db_error" }  ← DB failure, never "Out of Stock"
 */

import { NextRequest, NextResponse } from "next/server";
import { lookupStock, StockLookupError } from "@/lib/stock-service";

// ---------------------------------------------------------------------------
// Simple in-memory rate limiter (per IP, resets on server restart)
// For production, replace with Upstash Redis or similar persistent store.
// ---------------------------------------------------------------------------
const RATE_WINDOW_MS = 60_000;  // 1 minute
const RATE_LIMIT_MAX = 60;      // 60 requests per minute per IP

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    // Opportunistic cleanup of stale entries
    if (rateLimitMap.size > 1000) {
      for (const [k, v] of rateLimitMap.entries()) {
        if (now > v.resetAt) rateLimitMap.delete(k);
      }
    }
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  entry.count++;
  if (entry.count > RATE_LIMIT_MAX) return false;
  return true;
}

// ---------------------------------------------------------------------------
// GET handler
// ---------------------------------------------------------------------------

export async function GET(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "rate_limited", message: "Too many requests. Please wait a moment." },
      { status: 429 }
    );
  }

  const { searchParams } = new URL(req.url);
  const rawDesignNo =
    searchParams.get("designNo") ??
    searchParams.get("design_no") ??
    searchParams.get("q") ??
    "";

  if (!rawDesignNo.trim()) {
    return NextResponse.json(
      { error: "missing_design_no", message: "designNo query parameter is required" },
      { status: 400 }
    );
  }

  try {
    const result = await lookupStock(rawDesignNo);
    return NextResponse.json(result, {
      headers: {
        // No caching — always return live stock
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "Pragma": "no-cache",
      },
    });
  } catch (err) {
    if (err instanceof StockLookupError) {
      // DB error — log it but never return "Out of Stock"
      console.error(
        `[stock-lookup] DB error for designNo="${rawDesignNo}":`,
        err.message
      );
      return NextResponse.json(
        {
          found: false,
          designNo: rawDesignNo,
          error: "db_error",
          message: "Stock database temporarily unavailable. Please try again.",
        },
        {
          status: 503,
          headers: { "Cache-Control": "no-store" },
        }
      );
    }

    // Unexpected error
    console.error("[stock-lookup] Unexpected error:", err);
    return NextResponse.json(
      { found: false, designNo: rawDesignNo, error: "internal_error" },
      { status: 500 }
    );
  }
}

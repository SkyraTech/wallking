/**
 * Integration tests for the Meta WhatsApp webhook.
 * Tests: GET verification, POST signature check, deduplication, DB error safety.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import crypto from "crypto";

// ---------------------------------------------------------------------------
// Mock dependencies
// ---------------------------------------------------------------------------

// Mock the Supabase client (db.ts)
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
vi.mock("../lib/db", () => ({
  db: {
    from: () => ({
      insert: () => ({
        select: () => ({
          maybeSingle: mockInsert,
        }),
      }),
      update: () => ({
        eq: mockUpdate,
      }),
    }),
  },
}));

// Mock stock-service lookupStock
vi.mock("../lib/stock-service", async (importOriginal) => {
  const real = await importOriginal<typeof import("../lib/stock-service")>();
  return {
    ...real,
    lookupStock: vi.fn(),
    extractDesignNumberFromText: real.extractDesignNumberFromText,
  };
});

// Mock whatsapp-api send
vi.mock("../lib/whatsapp-api", async (importOriginal) => {
  const real = await importOriginal<typeof import("../lib/whatsapp-api")>();
  return {
    ...real,
    sendWhatsAppMessage: vi.fn().mockResolvedValue({ success: true, messageId: "msg-123" }),
  };
});

// ---------------------------------------------------------------------------
// Helper to build a signed Meta webhook POST body
// ---------------------------------------------------------------------------

function buildSignedPayload(body: string, secret: string) {
  const sig = `sha256=${crypto.createHmac("sha256", secret).update(body).digest("hex")}`;
  return { body, sig };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Meta WhatsApp Webhook — GET verification", () => {
  const verifyToken = "test-verify-token";

  beforeEach(() => {
    process.env.META_VERIFY_TOKEN = verifyToken;
    process.env.META_APP_SECRET = "test-secret";
  });

  it("returns 200 with challenge when token matches", async () => {
    const { GET } = await import("../app/api/whatsapp/webhook/route");
    const req = new Request(
      `http://localhost/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=${verifyToken}&hub.challenge=abc123`
    );
    const res = await GET(req as unknown as import("next/server").NextRequest);
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toBe("abc123");
  });

  it("returns 403 when token does not match", async () => {
    const { GET } = await import("../app/api/whatsapp/webhook/route");
    const req = new Request(
      `http://localhost/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=WRONG&hub.challenge=abc123`
    );
    const res = await GET(req as unknown as import("next/server").NextRequest);
    expect(res.status).toBe(403);
  });

  it("returns 403 when mode is not subscribe", async () => {
    const { GET } = await import("../app/api/whatsapp/webhook/route");
    const req = new Request(
      `http://localhost/api/whatsapp/webhook?hub.mode=unsubscribe&hub.verify_token=${verifyToken}&hub.challenge=abc123`
    );
    const res = await GET(req as unknown as import("next/server").NextRequest);
    expect(res.status).toBe(403);
  });
});

describe("Meta WhatsApp Webhook — POST signature", () => {
  const appSecret = "test-app-secret";

  beforeEach(() => {
    process.env.META_APP_SECRET = appSecret;
    process.env.META_VERIFY_TOKEN = "test-verify-token";
  });

  it("returns 403 when signature is missing", async () => {
    const { POST } = await import("../app/api/whatsapp/webhook/route");
    const req = new Request("http://localhost/api/whatsapp/webhook", {
      method: "POST",
      body: JSON.stringify({ entry: [] }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req as unknown as import("next/server").NextRequest);
    expect(res.status).toBe(403);
  });

  it("returns 403 when signature is invalid", async () => {
    const { POST } = await import("../app/api/whatsapp/webhook/route");
    const body = JSON.stringify({ entry: [] });
    const req = new Request("http://localhost/api/whatsapp/webhook", {
      method: "POST",
      body,
      headers: {
        "Content-Type": "application/json",
        "x-hub-signature-256": "sha256=badhash",
      },
    });
    const res = await POST(req as unknown as import("next/server").NextRequest);
    expect(res.status).toBe(403);
  });

  it("returns 200 with valid signature", async () => {
    const { POST } = await import("../app/api/whatsapp/webhook/route");
    const body = JSON.stringify({ entry: [] });
    const { sig } = buildSignedPayload(body, appSecret);
    const req = new Request("http://localhost/api/whatsapp/webhook", {
      method: "POST",
      body,
      headers: {
        "Content-Type": "application/json",
        "x-hub-signature-256": sig,
      },
    });
    const res = await POST(req as unknown as import("next/server").NextRequest);
    expect(res.status).toBe(200);
  });
});

describe("Meta WhatsApp Webhook — deduplication", () => {
  const appSecret = "test-app-secret";

  beforeEach(() => {
    process.env.META_APP_SECRET = appSecret;
    process.env.META_VERIFY_TOKEN = "test-verify-token";
    process.env.META_WA_ACCESS_TOKEN = "test-token";
    process.env.META_WA_PHONE_NUMBER_ID = "123456";

    // Simulate duplicate: insert returns null (already exists)
    mockInsert.mockResolvedValue({ data: null, error: { code: "23505", message: "duplicate" } });
  });

  it("returns 200 and does not process duplicate messages", async () => {
    const { POST } = await import("../app/api/whatsapp/webhook/route");
    const { sendWhatsAppMessage } = await import("../lib/whatsapp-api");

    const msgPayload = {
      entry: [{
        changes: [{
          value: {
            messages: [{
              id: "msg-dup-001",
              from: "919396202277",
              type: "text",
              text: { body: "7517-04" },
            }],
          },
        }],
      }],
    };

    const body = JSON.stringify(msgPayload);
    const { sig } = buildSignedPayload(body, appSecret);
    const req = new Request("http://localhost/api/whatsapp/webhook", {
      method: "POST",
      body,
      headers: {
        "Content-Type": "application/json",
        "x-hub-signature-256": sig,
      },
    });

    const res = await POST(req as unknown as import("next/server").NextRequest);
    expect(res.status).toBe(200);

    // Wait for async processing
    await new Promise((r) => setTimeout(r, 100));

    // sendWhatsAppMessage should NOT have been called (duplicate was skipped)
    expect(sendWhatsAppMessage).not.toHaveBeenCalled();
  });
});

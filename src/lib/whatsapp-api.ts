/**
 * src/lib/whatsapp-api.ts
 * Meta WhatsApp Business Cloud API helpers.
 * Server-side only — never import in client components.
 *
 * Exports:
 *   sendWhatsAppMessage()     — sends a text message via Meta Graph API
 *   buildAvailableReply()     — formats the "available" reply
 *   buildOutOfStockReply()    — formats the "out of stock" reply
 *   buildNotFoundReply()      — formats the "design not found" reply
 *   buildSafeFailureReply()   — DB error reply (never "Out of Stock")
 *   buildHelpReply()          — HELP command reply
 *   buildAgentReply()         — AGENT/HUMAN command reply
 *   buildOrderReply()         — ORDER command reply
 *   handleSpecialCommand()    — dispatches special commands
 *   maskPhone()               — last-4-digit masking for logs
 */

import { StockLookupResult } from "./stock-service";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const GRAPH_API_BASE = "https://graph.facebook.com";

function getEnv(name: string): string {
  const val = process.env[name];
  if (!val) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return val;
}

// ---------------------------------------------------------------------------
// Phone masking (for logs — GDPR/privacy)
// ---------------------------------------------------------------------------

/**
 * Masks a WhatsApp phone number for logging.
 * "+91 93962 02277" → "+91 XXXXXX2277"
 * "919396202277"    → "XXXXXXXX2277"
 */
export function maskPhone(phone: string): string {
  if (!phone) return "[unknown]";
  const clean = phone.replace(/\D/g, "");
  if (clean.length <= 4) return "****";
  return "X".repeat(clean.length - 4) + clean.slice(-4);
}

// ---------------------------------------------------------------------------
// Reply builders
// ---------------------------------------------------------------------------

export function buildAvailableReply(item: StockLookupResult): string {
  const lines = [
    `📦 Wall King Stock Update`,
    ``,
    `Design No: *${item.designNo}*`,
    `Brand: *${item.brand}*`,
    item.collection ? `Collection: *${item.collection}*` : null,
    `Status: ✅ *Available — ${item.quantityRolls} Rolls*`,
    item.warehouseLocation ? `Warehouse: ${item.warehouseLocation}` : null,
    ``,
    `Stock is subject to final order confirmation.`,
  ]
    .filter((l) => l !== null)
    .join("\n");
  return lines;
}

export function buildOutOfStockReply(designNo: string): string {
  return [
    `📦 Wall King Stock Update`,
    ``,
    `Design No: *${designNo}*`,
    `Status: ❌ *Out of Stock*`,
    ``,
    `Reply *AGENT* if you would like our team to check incoming stock.`,
  ].join("\n");
}

export function buildNotFoundReply(query: string): string {
  return [
    `🔎 I couldn't find that design number.`,
    ``,
    `Please verify it and send it again, for example *7517-04*.`,
    query
      ? `(You sent: "${query.slice(0, 40)}${query.length > 40 ? "…" : ""}")`
      : null,
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildSafeFailureReply(): string {
  return [
    `Sorry, I'm unable to check live stock right now.`,
    `Our team has been notified. Please try again in a few minutes.`,
    ``,
    `You can also call us: +91 40 2320 2255`,
  ].join("\n");
}

export function buildHelpReply(): string {
  return [
    `🏷️ *Wall King Stock Bot — Help*`,
    ``,
    `Send a design number to check availability:`,
    `  • 7517-04`,
    `  • ONYX-102`,
    `  • Need stock for BEL-804`,
    ``,
    `Commands:`,
    `  *HELP*  — Show this menu`,
    `  *AGENT* — Request human assistance`,
    `  *ORDER* — Place an order enquiry`,
    ``,
    `Stock is subject to final order confirmation.`,
  ].join("\n");
}

export function buildAgentReply(): string {
  return [
    `👤 Your request has been logged.`,
    ``,
    `A Wall King team member will contact you shortly.`,
    ``,
    `Business hours: Mon–Sat · 10:30 – 20:00`,
    `Head Office: +91 40 2320 2255`,
  ].join("\n");
}

export function buildOrderReply(): string {
  return [
    `🛒 To place an order, please share:`,
    ``,
    `1. Design number(s)`,
    `2. Required quantity (rolls)`,
    `3. Delivery address / city`,
    ``,
    `A Wall King team member will confirm availability and pricing.`,
  ].join("\n");
}

// ---------------------------------------------------------------------------
// Special command detection
// ---------------------------------------------------------------------------

export type SpecialCommand = "HELP" | "AGENT" | "HUMAN" | "ORDER";

export function detectSpecialCommand(text: string): SpecialCommand | null {
  const upper = text.trim().toUpperCase();
  if (upper === "HELP" || upper === "HI" || upper === "HELLO") return "HELP";
  if (upper === "AGENT" || upper === "HUMAN") return "AGENT";
  if (upper === "ORDER") return "ORDER";
  return null;
}

export function buildSpecialCommandReply(cmd: SpecialCommand): string {
  switch (cmd) {
    case "HELP":
      return buildHelpReply();
    case "AGENT":
    case "HUMAN":
      return buildAgentReply();
    case "ORDER":
      return buildOrderReply();
  }
}

// ---------------------------------------------------------------------------
// Send message via Meta Graph API
// ---------------------------------------------------------------------------

export interface SendMessageResult {
  success: true;
  messageId: string;
}

export class SendMessageError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body: unknown
  ) {
    super(message);
    this.name = "SendMessageError";
  }
}

/**
 * Sends a plain-text WhatsApp message via Meta Graph API.
 * Throws SendMessageError on API failure.
 */
export async function sendWhatsAppMessage(
  to: string,
  text: string
): Promise<SendMessageResult> {
  const accessToken = getEnv("META_WA_ACCESS_TOKEN");
  const phoneNumberId = getEnv("META_WA_PHONE_NUMBER_ID");
  const apiVersion = process.env.META_GRAPH_API_VERSION ?? "v21.0";

  const url = `${GRAPH_API_BASE}/${apiVersion}/${phoneNumberId}/messages`;

  const body = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: to.replace(/^\+/, ""), // Meta expects digits only
    type: "text",
    text: {
      preview_url: false,
      body: text,
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const responseBody = await res.json().catch(() => null);

  if (!res.ok) {
    throw new SendMessageError(
      `Meta API returned ${res.status}: ${JSON.stringify(responseBody)}`,
      res.status,
      responseBody
    );
  }

  const messageId =
    responseBody?.messages?.[0]?.id ?? responseBody?.id ?? "unknown";

  return { success: true, messageId };
}

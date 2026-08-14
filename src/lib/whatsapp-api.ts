/**
 * src/lib/whatsapp-api.ts
 * Meta WhatsApp Business Cloud API helpers.
 * Server-side only — never import in client components.
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
    `📦 *Wall King Stock Update*`,
    ``,
    `Design No: *${item.designNo}*`,
    `Brand: *${item.brand}*`,
    item.collection ? `Collection: *${item.collection}*` : null,
    `Status: ✅ *Available — ${item.quantityRolls} Rolls*`,
    item.warehouseLocation ? `Warehouse: ${item.warehouseLocation}` : null,
    ``,
    `Stock is subject to final order confirmation.`,
  ].filter((l) => l !== null).join("\n");
  return lines;
}

// NEW: Interactive Button Reply for Stock Available
export function buildStockButtonsReply(item: StockLookupResult): any {
  return {
    type: "interactive",
    interactive: {
      type: "button",
      body: { text: buildAvailableReply(item) },
      action: {
        buttons: [
          { type: "reply", reply: { id: `order_${item.designNo}`, title: "🛒 Order This" } },
          { type: "reply", reply: { id: "check_another", title: "🔎 Check Another" } }
        ]
      }
    }
  };
}

// NEW: Quantity Prompt
export function buildQuantityPromptReply(designNo: string): string {
  return `How many rolls of *${designNo}* would you like to order?\n\n(Please type a number, e.g., 150)`;
}

// NEW: Order Confirmation
export function buildOrderConfirmationReply(designNo: string, quantity: number): any {
  return {
    type: "interactive",
    interactive: {
      type: "button",
      body: { text: `✅ *Order Request Received!*\n\nWe have logged your request for *${quantity} rolls* of *${designNo}*.\n\nA team member will contact you shortly to confirm the order.` },
      action: {
        buttons: [
          { type: "reply", reply: { id: "check_another", title: "🔎 Check Another" } },
          { type: "reply", reply: { id: "menu", title: "🏠 Main Menu" } }
        ]
      }
    }
  };
}

// NEW: Insufficient Stock
export function buildInsufficientStockReply(item: StockLookupResult, requestedQty: number): any {
  return {
    type: "interactive",
    interactive: {
      type: "button",
      body: { text: `⚠️ *Insufficient Stock*\n\nYou requested ${requestedQty} rolls of *${item.designNo}*, but we only have *${item.quantityRolls} rolls* available.\n\nHow would you like to proceed?` },
      action: {
        buttons: [
          { type: "reply", reply: { id: `buy_partial_${item.designNo}_${item.quantityRolls}`, title: `🛒 Buy ${item.quantityRolls}` } },
          { type: "reply", reply: { id: `wait_${item.designNo}_${requestedQty}`, title: "⏳ Ask Wait Time" } },
          { type: "reply", reply: { id: "check_another", title: "🔎 Check Another" } }
        ]
      }
    }
  };
}

// NEW: Interactive List for Brands
export function buildBrandsListReply(brands: string[], page: number, hasNextPage: boolean): any {
  const rows = brands.map(b => ({ id: `brand_${b}`, title: b.slice(0, 24) }));
  if (hasNextPage) {
    rows.push({ id: `brands_page_${page + 1}`, title: "▶ Show More Brands" });
  }

  return {
    type: "interactive",
    interactive: {
      type: "list",
      header: { type: "text", text: "🏢 Wall King Brands" },
      body: { text: "Please select a Brand to view its designs:" },
      action: {
        button: "View Brands",
        sections: [{ title: `Brands (Page ${page})`, rows }]
      }
    }
  };
}

// NEW: Interactive List for Designs
export function buildDesignsListReply(brand: string, designs: string[], page: number, hasNextPage: boolean): any {
  const rows = designs.map(d => ({ id: `design_${d}`, title: d.slice(0, 24) }));
  if (hasNextPage) {
    rows.push({ id: `designs_page_${brand}_${page + 1}`, title: "▶ Show More Designs" });
  }
  // Add back button
  if (rows.length < 10) {
    rows.push({ id: "menu", title: "🔙 Back to Brands" });
  }

  return {
    type: "interactive",
    interactive: {
      type: "list",
      header: { type: "text", text: `${brand} Designs` },
      body: { text: `Please select a Design:` },
      action: {
        button: "View Designs",
        sections: [{ title: `Designs (Page ${page})`, rows }]
      }
    }
  };
}

export function buildOutOfStockReply(designNo: string): any {
  return {
    type: "interactive",
    interactive: {
      type: "button",
      body: { text: `📦 Wall King Stock Update\n\nDesign No: *${designNo}*\nStatus: ❌ *Out of Stock*` },
      action: {
        buttons: [
          { type: "reply", reply: { id: `wait_${designNo}_0`, title: "⏳ Ask Wait Time" } },
          { type: "reply", reply: { id: "check_another", title: "🔎 Check Another" } }
        ]
      }
    }
  };
}

export function buildNotFoundReply(query: string): string {
  return [
    `🔎 I couldn't find that design number.`,
    ``,
    `Please verify it and send it again, for example *7517-04*.`,
    query ? `(You sent: "${query.slice(0, 40)}${query.length > 40 ? "…" : ""}")` : null,
  ].filter(Boolean).join("\n");
}

export function buildSafeFailureReply(): string {
  return [
    `Sorry, I'm unable to check live stock right now.`,
    `Our team has been notified. Please try again in a few minutes.`,
  ].join("\n");
}

export function buildAgentReply(): string {
  return [
    `👤 Your request has been logged.`,
    `A Wall King team member will contact you shortly.`,
    ``,
    `Business hours: Mon–Sat · 10:30 – 20:00`,
    `Head Office: +91 40 2320 2255`,
  ].join("\n");
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
 * Sends a message via Meta Graph API.
 * `payload` can be a string (sent as text) or an interactive object payload.
 */
export async function sendWhatsAppMessage(
  to: string,
  payload: string | Record<string, any>
): Promise<SendMessageResult> {
  const accessToken = getEnv("META_WA_ACCESS_TOKEN");
  const phoneNumberId = getEnv("META_WA_PHONE_NUMBER_ID");
  const apiVersion = process.env.META_GRAPH_API_VERSION ?? "v21.0";

  const url = `${GRAPH_API_BASE}/${apiVersion}/${phoneNumberId}/messages`;

  const body = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: to.replace(/^\+/, ""), // Meta expects digits only
    ...(typeof payload === "string" 
         ? { type: "text", text: { preview_url: false, body: payload } }
         : payload)
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

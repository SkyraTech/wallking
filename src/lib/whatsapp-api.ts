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
export function buildStockButtonsReply(item: StockLookupResult, hasCartItems: boolean): any {
  const buttons: any[] = [
    { type: "reply", reply: { id: `order_${item.designNo}`, title: "🛒 Order This" } }
  ];
  if (hasCartItems) {
    buttons.push({ type: "reply", reply: { id: "view_cart", title: "🛒 View Cart" } });
  }

  return {
    type: "interactive",
    interactive: {
      type: "button",
      body: { text: buildAvailableReply(item) },
      action: { buttons }
    }
  };
}

// NEW: Quantity Prompt
export function buildQuantityPromptReply(designNo: string): string {
  return `How many rolls of *${designNo}* would you like to order?\n\n(Please type a number, e.g., 150)`;
}

// NEW: Order Confirmation (Added to Cart) for single flow
export function buildOrderConfirmationReply(designNo: string, quantity: number): any {
  return {
    type: "interactive",
    interactive: {
      type: "button",
      body: { text: `🛒 *Added to Cart!*\n\nWe have added *${quantity} rolls* of *${designNo}* to your order cart.\n\n💡 *Hint:* To check the availability for another item, simply reply with the Design Code and Quantity (e.g., LOH-201 50). Or tap Checkout when you are done!` },
      action: {
        buttons: [
          { type: "reply", reply: { id: "view_cart", title: "🛒 View Cart" } }
        ]
      }
    }
  };
}

// NEW: Insufficient Stock Prompt
export function buildInsufficientStockReply(item: StockLookupResult, requestedQty: number): any {
  return {
    type: "interactive",
    interactive: {
      type: "button",
      body: { text: `⚠️ *Insufficient Stock*\n\nYou requested ${requestedQty} rolls of *${item.designNo}*, but we only have *${item.quantityRolls} rolls* available.\n\nHow would you like to proceed?` },
      action: {
        buttons: [
          { type: "reply", reply: { id: `buy_partial_${item.designNo}_${item.quantityRolls}`, title: `🛒 Buy ${item.quantityRolls}` } },
          { type: "reply", reply: { id: `wait_${item.designNo}_${requestedQty}`, title: "⏳ Ask Wait Time" } }
        ]
      }
    }
  };
}

// NEW: Quick Order Summary
export function buildQuickOrderSummaryReply(
  successes: { designNo: string; qty: number }[],
  failures: { designNo: string; reason: string }[],
  hasCartItems: boolean
): any {
  let replyText = `🛒 *Order Summary*\n\n`;
  if (successes.length > 0) {
    replyText += `✅ *Added to Cart:*\n`;
    successes.forEach(s => replyText += `• ${s.qty} rolls of ${s.designNo}\n`);
  }
  if (failures.length > 0) {
    replyText += `\n⚠️ *Could Not Add:*\n`;
    failures.forEach(f => replyText += `• ${f.designNo} (${f.reason})\n`);
  }
  
  // Add dynamic hint based on cart state
  if (hasCartItems || successes.length > 0) {
    replyText += `\n💡 *Hint:* To check the availability for another item, simply reply with the Design Code and Quantity (e.g., LOH-201 50). Or tap View Cart when you are done!`;
    return {
      type: "interactive",
      interactive: {
        type: "button",
        body: { text: replyText.trim() },
        action: { buttons: [{ type: "reply", reply: { id: "view_cart", title: "🛒 View Cart" } }] }
      }
    };
  } else {
    replyText += `\n💡 *Hint:* To check the availability for another item, simply reply with the Design Code and Quantity (e.g., LOH-201 50).`;
    return replyText.trim();
  }
}

export function buildUnknownFormatReply(hasCartItems: boolean): any {
  const text = [
    `Welcome to Wall King! 📦`,
    ``,
    `To place an order, please type the *Design Code* followed by the *Quantity*. You can order multiple items at once separated by commas!`,
    ``,
    `*Example:* BEL-804 100, LOH-201 50`,
    ``,
    `To just check live stock, type a single Design Code (e.g. BEL-804).`
  ].join("\n");

  if (hasCartItems) {
    return {
      type: "interactive",
      interactive: {
        type: "button",
        body: { text },
        action: { buttons: [{ type: "reply", reply: { id: "view_cart", title: "🛒 View Cart" } }] }
      }
    };
  }
  return text;
}

// NEW: View Cart Reply
export function buildViewCartReply(cartItems: any[]): any {
  const lines = [
    `🛒 *Your Current Cart*`,
    ``,
    ...cartItems.map(item => `• *${item.design_number}* — ${item.quantity_requested} rolls`),
    ``,
    `💡 *How to Edit:*`,
    `• To change a quantity, simply resend the code (e.g., \`${cartItems[0]?.design_number || 'BEL-804'} 100\`).`,
    `• To remove an item, send the code with 0 (e.g., \`${cartItems[0]?.design_number || 'BEL-804'} 0\`).`,
    `• To add a new item, send a new code and quantity.`,
  ];

  return {
    type: "interactive",
    interactive: {
      type: "button",
      body: { text: lines.join("\n") },
      action: {
        buttons: [
          { type: "reply", reply: { id: "checkout_confirm", title: "✅ Checkout Cart" } }
        ]
      }
    }
  };
}

// NEW: Checkout Confirmation Reply
export function buildCheckoutConfirmationReply(): any {
  return {
    type: "interactive",
    interactive: {
      type: "button",
      body: { text: `🚀 *Submit Order*\n\nPlease review your cart items. Tap Submit to send your order request to Wall King for final availability check and approval.` },
      action: {
        buttons: [
          { type: "reply", reply: { id: "submit_order", title: "🚀 Yes, Submit" } },
          { type: "reply", reply: { id: "view_cart", title: "🔙 Wait, Let me Edit" } }
        ]
      }
    }
  };
}

// NEW: Checkout Receipt
export function buildCheckoutReceiptReply(cartItems: any[]): string {
  const lines = [
    `✅ *Order Successfully Submitted!*`,
    ``,
    `Here is a summary of your order:`,
    ...cartItems.map(item => `• ${item.quantity_requested} rolls of *${item.design_number}*`),
    ``,
    `A Wall King team member will contact you shortly to confirm availability and delivery details.`
  ];
  return lines.join("\n");
}

// NEW: Admin Approval Request
export function buildAdminApprovalRequest(dealerPhone: string, cartItems: any[]): any {
  const lines = [
    `🚨 *NEW ORDER ALERT*`,
    ``,
    `*Dealer:* +${dealerPhone}`,
    `*Items:*`,
    ...cartItems.map(item => `• ${item.quantity_requested} rolls of *${item.design_number}*`),
    ``,
    `Do you accept this order?`
  ];
  return {
    type: "interactive",
    interactive: {
      type: "button",
      body: { text: lines.join("\n") },
      action: {
        buttons: [
          { type: "reply", reply: { id: `admin_accept_${dealerPhone}`, title: "✅ Accept" } },
          { type: "reply", reply: { id: `admin_reject_${dealerPhone}`, title: "❌ Reject" } }
        ]
      }
    }
  };
}

export function buildDealerApprovalReply(): string {
  return "✅ Excellent news! Wall King has accepted your order. A team member will contact you shortly to coordinate dispatch.";
}

export function buildDealerRejectionReply(): string {
  return "❌ Sorry, your recent order could not be fulfilled at this time. Please contact support for alternatives.";
}

export function buildOutOfStockReply(designNo: string): any {
  return {
    type: "interactive",
    interactive: {
      type: "button",
      body: { text: `📦 Wall King Stock Update\n\nDesign No: *${designNo}*\nStatus: ❌ *Out of Stock*` },
      action: {
        buttons: [
          { type: "reply", reply: { id: `wait_${designNo}_0`, title: "⏳ Ask Wait Time" } }
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

export function buildHelpReply(): string {
  return [
    `🏷️ *Wall King Stock Bot — Help*`,
    ``,
    `Send a design number to check availability.`,
    ``,
    `Commands:`,
    `  *HELP*  — Show this menu`,
    `  *AGENT* — Request human assistance`,
    `  *ORDER* — Place an order enquiry`,
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

export type SpecialCommand = "HELP" | "AGENT" | "HUMAN" | "ORDER";

export function detectSpecialCommand(text: string): SpecialCommand | null {
  const upper = text.trim().toUpperCase();
  if (upper === "HELP") return "HELP";
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

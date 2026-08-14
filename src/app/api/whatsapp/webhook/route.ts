/**
 * /api/whatsapp/webhook
 *
 * Meta WhatsApp Business Cloud API webhook.
 */

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import {
  lookupStock,
  StockLookupError,
  extractDesignNumberFromText,
  normalizeDesignNumber,
  parseQuickOrderText,
  fetchBrands,
  fetchDesignsByBrand,
  createOrder
} from "@/lib/stock-service";
import {
  sendWhatsAppMessage,
  buildQuickOrderSummaryReply,
  buildUnknownFormatReply,
  buildCheckoutReceiptReply,
  buildAdminApprovalRequest,
  buildDealerApprovalReply,
  buildDealerRejectionReply,
  maskPhone,
  SendMessageError,
} from "@/lib/whatsapp-api";

// ---------------------------------------------------------------------------
// GET — Webhook verification
// ---------------------------------------------------------------------------

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const verifyToken = process.env.META_VERIFY_TOKEN;
  if (!verifyToken) {
    console.error("[webhook] META_VERIFY_TOKEN is not set");
    return new NextResponse("Configuration error", { status: 500 });
  }

  if (mode === "subscribe" && token === verifyToken) {
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse("Forbidden", { status: 403 });
}

// ---------------------------------------------------------------------------
// Signature verification
// ---------------------------------------------------------------------------

function verifySignature(rawBody: Buffer, signature: string | null): boolean {
  const appSecret = process.env.META_APP_SECRET;
  if (!appSecret) return false;
  if (!signature) return false;

  const expected = `sha256=${crypto
    .createHmac("sha256", appSecret)
    .update(rawBody)
    .digest("hex")}`;

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature, "utf8"),
      Buffer.from(expected, "utf8")
    );
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Message processing
// ---------------------------------------------------------------------------

async function processMessage(
  metaMessageId: string,
  senderPhone: string,
  messageText: string,
  interactivePayload: any,
  eventRowId: string
): Promise<void> {
  const maskedPhone = maskPhone(senderPhone);

  try {
    // Helper to check if cart has items
    const checkCart = async () => {
      const { data } = await db.from("whatsapp_orders").select("id").eq("sender_phone", senderPhone).eq("status", "in_cart").limit(1);
      return (data && data.length > 0) || false;
    };

    // --- STATE MACHINE: Interactive Button/List Taps ---
    if (interactivePayload) {
      const id = interactivePayload.button_reply?.id || interactivePayload.list_reply?.id;
      
      if (!id) return;



      if (id === "checkout") {
        // Fetch cart items
        const { data: cartItems, error } = await db
          .from("whatsapp_orders")
          .select("*")
          .eq("sender_phone", senderPhone)
          .eq("status", "in_cart");

        if (!error && cartItems && cartItems.length > 0) {
          // Update status to pending_approval (waiting for owner)
          await db
            .from("whatsapp_orders")
            .update({ status: "pending_approval" })
            .eq("sender_phone", senderPhone)
            .eq("status", "in_cart");

          const reply = buildCheckoutReceiptReply(cartItems);
          const { messageId } = await sendWhatsAppMessage(senderPhone, reply);
          
          // NEW: Send Admin Approval Request
          const ownerPhone = "918179893241"; // Hardcoded for now per user request
          const adminReply = buildAdminApprovalRequest(senderPhone, cartItems);
          await sendWhatsAppMessage(ownerPhone, adminReply).catch(console.error);

          await db.from("whatsapp_inbound_events").update({ processing_status: "checkout_complete", reply_message_id: messageId }).eq("id", eventRowId);
        } else {
           const { messageId } = await sendWhatsAppMessage(senderPhone, "Your cart is empty.");
           await db.from("whatsapp_inbound_events").update({ processing_status: "checkout_empty", reply_message_id: messageId }).eq("id", eventRowId);
        }
        return;
      }

      if (id.startsWith("admin_accept_")) {
        const dealerPhone = id.replace("admin_accept_", "");
        await db.from("whatsapp_orders").update({ status: "approved" }).eq("sender_phone", dealerPhone).eq("status", "pending_approval");
        
        await sendWhatsAppMessage(dealerPhone, buildDealerApprovalReply()).catch(console.error);
        const { messageId } = await sendWhatsAppMessage(senderPhone, "✅ You accepted the order. The dealer has been notified.");
        await db.from("whatsapp_inbound_events").update({ processing_status: "admin_accepted", reply_message_id: messageId }).eq("id", eventRowId);
        return;
      }

      if (id.startsWith("admin_reject_")) {
        const dealerPhone = id.replace("admin_reject_", "");
        await db.from("whatsapp_orders").update({ status: "rejected" }).eq("sender_phone", dealerPhone).eq("status", "pending_approval");
        
        await sendWhatsAppMessage(dealerPhone, buildDealerRejectionReply()).catch(console.error);
        const { messageId } = await sendWhatsAppMessage(senderPhone, "❌ You rejected the order. The dealer has been notified.");
        await db.from("whatsapp_inbound_events").update({ processing_status: "admin_rejected", reply_message_id: messageId }).eq("id", eventRowId);
        return;
      }

    }

    // --- STATE MACHINE: Text Lookups & Quick Orders ---
    if (!interactivePayload) {
      // 1. Check special commands first
      const command = detectSpecialCommand(messageText);
      if (command && command !== "HELP") {
        const reply = buildSpecialCommandReply(command);
        const { messageId } = await sendWhatsAppMessage(senderPhone, reply);
        await db.from("whatsapp_inbound_events").update({ processing_status: "command_handled", reply_message_id: messageId }).eq("id", eventRowId);
        return;
      }

      // 2. Parse Quick Orders (Multiple items with quantity)
      const quickOrders = parseQuickOrderText(messageText);

      if (quickOrders.length > 0) {
        const successes: { designNo: string; qty: number }[] = [];
        const failures: { designNo: string; reason: string }[] = [];

        for (const item of quickOrders) {
          try {
            const stockResult = await lookupStock(item.designCode);
            if (!stockResult.found) {
              failures.push({ designNo: item.designCode, reason: "Design not found" });
            } else if (!stockResult.available) {
              failures.push({ designNo: stockResult.designNo, reason: "Out of stock" });
            } else if (item.quantity > stockResult.quantityRolls) {
              failures.push({ designNo: stockResult.designNo, reason: `Only ${stockResult.quantityRolls} rolls available` });
            } else {
              await createOrder({
                senderPhone,
                designNumber: stockResult.designNo,
                brand: stockResult.brand,
                quantityRequested: item.quantity
              });
              successes.push({ designNo: stockResult.designNo, qty: item.quantity });
            }
          } catch (err) {
            failures.push({ designNo: item.designCode, reason: "Database error" });
          }
        }

        const hasCartItems = await checkCart();
        const reply = buildQuickOrderSummaryReply(successes, failures, hasCartItems);
        const { messageId } = await sendWhatsAppMessage(senderPhone, reply);
        await db.from("whatsapp_inbound_events").update({ processing_status: "quick_order_processed", reply_message_id: messageId }).eq("id", eventRowId);
        return;
      }

      // 3. Fallback: Single Design Stock Check (no quantity)
      const designNo = extractDesignNumberFromText(messageText);

      if (!designNo) {
        // Unknown format
        const hasCartItems = await checkCart();
        const reply = buildUnknownFormatReply(hasCartItems);
        const { messageId } = await sendWhatsAppMessage(senderPhone, reply);
        await db.from("whatsapp_inbound_events").update({ processing_status: "unknown_format", reply_message_id: messageId }).eq("id", eventRowId);
        return;
      }

      // Stock Lookup
      await db.from("whatsapp_inbound_events").update({ normalized_design_number: designNo }).eq("id", eventRowId);

      let stockResult;
      try {
        stockResult = await lookupStock(designNo);
      } catch (err) {
        if (err instanceof StockLookupError) {
          const reply = buildSafeFailureReply();
          const { messageId } = await sendWhatsAppMessage(senderPhone, reply);
          await db.from("whatsapp_inbound_events").update({ processing_status: "db_error", reply_message_id: messageId }).eq("id", eventRowId);
          return;
        }
        throw err;
      }

      let reply: any;
      let status: string;
      const hasCartItems = await checkCart();

      if (!stockResult.found) {
        reply = buildNotFoundReply(designNo);
        status = "not_found";
      } else if (!stockResult.available) {
        reply = buildOutOfStockReply(stockResult.designNo);
        status = "out_of_stock";
      } else {
        reply = buildAvailableReply(stockResult);
        status = "replied";
      }

      // Append checkout button if they have items in cart
      if (hasCartItems && typeof reply === "string") {
        reply = {
          type: "interactive",
          interactive: {
            type: "button",
            body: { text: reply },
            action: { buttons: [{ type: "reply", reply: { id: "checkout", title: "✅ Checkout Cart" } }] }
          }
        };
      }

      const { messageId: replyId } = await sendWhatsAppMessage(senderPhone, reply);

      await db.from("whatsapp_inbound_events").update({
        processing_status: status,
        reply_message_id: replyId,
      }).eq("id", eventRowId);
    }

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[webhook] Unhandled error for ${maskedPhone}:`, message);

    try {
      await sendWhatsAppMessage(senderPhone, buildSafeFailureReply());
    } catch {}

    try {
      await db.from("whatsapp_inbound_events").update({
        processing_status: "db_error",
        error_summary: message.slice(0, 500),
      }).eq("id", eventRowId);
    } catch {}
  }
}

// ---------------------------------------------------------------------------
// POST — Inbound message handler
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  const rawBody = Buffer.from(await req.arrayBuffer());
  const signature = req.headers.get("x-hub-signature-256");

  if (!verifySignature(rawBody, signature)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody.toString("utf-8"));
  } catch {
    return new NextResponse("Bad Request — invalid JSON", { status: 400 });
  }

  try {
    const entries = (payload.entry as unknown[]) ?? [];
    for (const entry of entries) {
      const changes = ((entry as Record<string, unknown>).changes as unknown[]) ?? [];
      for (const change of changes) {
        const value = (change as Record<string, unknown>).value as Record<string, unknown>;
        if (!value || (value.object as string) === "page") continue;

        const messages = (value.messages as unknown[]) ?? [];
        for (const msg of messages) {
          const message = msg as Record<string, unknown>;

          if (message.type !== "text" && message.type !== "interactive") continue;

          const metaMessageId = message.id as string;
          const senderPhone = message.from as string;
          let messageText = "";
          let interactivePayload = null;

          if (message.type === "text") {
            messageText = ((message.text as Record<string, unknown>)?.body as string) ?? "";
          } else if (message.type === "interactive") {
            interactivePayload = message.interactive;
            // Fallback text representation of button/list tap for the database record
            messageText = `[Interactive: ${(interactivePayload as any).button_reply?.id || (interactivePayload as any).list_reply?.id}]`;
          }

          if (!metaMessageId || !senderPhone || !messageText.trim()) continue;

          const maskedPhone = maskPhone(senderPhone);

          const { data: inserted, error: insertError } = await db
            .from("whatsapp_inbound_events")
            .insert({
              meta_message_id: metaMessageId,
              sender_reference: maskedPhone,
              message_text: messageText.slice(0, 1000),
              processing_status: "received",
            })
            .select("id")
            .maybeSingle();

          if (insertError) {
            if (insertError.code === "23505") continue;
            console.error(`[webhook] Failed to persist event ${metaMessageId}:`, insertError.message);
            continue;
          }

          if (!inserted) continue;

          await processMessage(
            metaMessageId,
            senderPhone,
            messageText,
            interactivePayload,
            inserted.id
          );
        }
      }
    }
  } catch (err) {
    console.error("[webhook] Top-level processing error:", err);
  }

  return new NextResponse("OK", { status: 200 });
}

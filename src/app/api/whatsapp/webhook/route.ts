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
  buildAvailableReply,
  buildOutOfStockReply,
  buildNotFoundReply,
  buildSafeFailureReply,
  buildAgentReply,
  detectSpecialCommand,
  buildSpecialCommandReply,
  buildStockButtonsReply,
  buildQuantityPromptReply,
  buildOrderConfirmationReply,
  buildInsufficientStockReply,
  buildViewCartReply,
  buildCheckoutConfirmationReply,
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
      const { data } = await db.from("orders").select("id").eq("dealer_phone", senderPhone).eq("status", "in_cart").limit(1);
      if (!data || data.length === 0) return false;
      const { data: items } = await db.from("order_items").select("id").eq("order_id", data[0].id).limit(1);
      return (items && items.length > 0) || false;
    };

    // 1. Fetch previous state to handle Quantity inputs
    const { data: previousEvents } = await db
      .from("whatsapp_inbound_events")
      .select("processing_status, normalized_design_number")
      .eq("sender_reference", maskedPhone)
      .order("created_on", { ascending: false })
      .limit(5);
      
    const previousEvent = previousEvents?.find((e, i) => i > 0 && e.processing_status !== "received") || null;

    // --- STATE MACHINE: Quantity Validation ---
    if (!interactivePayload && previousEvent?.processing_status === "waiting_for_quantity" && previousEvent.normalized_design_number) {
      // Only process as quantity if it's purely a number (to prevent QuickOrders from getting trapped here)
      const isPureNumber = /^\s*\d+\s*$/.test(messageText);
      if (isPureNumber) {
        const qty = parseInt(messageText.trim(), 10);
        if (qty > 0) {
          const designNo = previousEvent.normalized_design_number;
          const stockResult = await lookupStock(designNo);
          
          if (stockResult.found && stockResult.available) {
            if (qty <= stockResult.quantityOnHand) {
              // Sufficient stock!
              await createOrder({
                senderPhone,
                designNumber: stockResult.designNo,
                brand: stockResult.brand,
                quantityRequested: qty
              });
              
              const reply = buildOrderConfirmationReply(stockResult.designNo, qty);
              const { messageId } = await sendWhatsAppMessage(senderPhone, reply);
              
              await db.from("whatsapp_inbound_events").update({
                processing_status: "order_confirmed",
                reply_message_id: messageId,
                normalized_design_number: stockResult.designNo
              }).eq("id", eventRowId);
              return;
            } else {
              // Insufficient stock!
              const reply = buildInsufficientStockReply(stockResult, qty);
              const { messageId } = await sendWhatsAppMessage(senderPhone, reply);
              
              await db.from("whatsapp_inbound_events").update({
                processing_status: "insufficient_stock",
                reply_message_id: messageId,
                normalized_design_number: stockResult.designNo
              }).eq("id", eventRowId);
              return;
            }
          }
        }
      }
    }

    // --- STATE MACHINE: Interactive Button/List Taps ---
    if (interactivePayload) {
      const id = interactivePayload.button_reply?.id || interactivePayload.list_reply?.id;
      
      if (!id) return;

      if (id.startsWith("order_")) {
        const designNo = id.replace("order_", "");
        const reply = buildQuantityPromptReply(designNo);
        const { messageId } = await sendWhatsAppMessage(senderPhone, reply);
        await db.from("whatsapp_inbound_events").update({
          processing_status: "waiting_for_quantity",
          reply_message_id: messageId,
          normalized_design_number: designNo
        }).eq("id", eventRowId);
        return;
      }

      if (id.startsWith("buy_partial_")) {
        const parts = id.replace("buy_partial_", "").split("_");
        const qty = parseInt(parts.pop() || "0", 10);
        const designNo = parts.join("_");
        
        const stockResult = await lookupStock(designNo);
        await createOrder({
          senderPhone,
          designNumber: stockResult.found ? stockResult.designNo : designNo,
          brand: stockResult.found ? stockResult.brand : "Unknown",
          quantityRequested: qty
        });
        
        const reply = buildOrderConfirmationReply(stockResult.found ? stockResult.designNo : designNo, qty);
        const { messageId } = await sendWhatsAppMessage(senderPhone, reply);
        await db.from("whatsapp_inbound_events").update({
          processing_status: "order_confirmed_partial",
          reply_message_id: messageId,
          normalized_design_number: designNo
        }).eq("id", eventRowId);
        return;
      }

      if (id.startsWith("wait_")) {
         const reply = buildAgentReply();
         const { messageId } = await sendWhatsAppMessage(senderPhone, reply);
         await db.from("whatsapp_inbound_events").update({ processing_status: "backorder_agent", reply_message_id: messageId }).eq("id", eventRowId);
         return;
      }

      if (id === "view_cart") {
        const { data: cartOrder } = await db.from("orders").select("id").eq("dealer_phone", senderPhone).eq("status", "in_cart").single();
        if (cartOrder) {
          const { data: items } = await db.from("order_items")
            .select("quantity, stock_items(design_number_display)")
            .eq("order_id", cartOrder.id);
            
          if (items && items.length > 0) {
            const mappedItems = items.map((i: any) => ({
              design_number: i.stock_items?.design_number_display || "Unknown",
              quantity_requested: i.quantity
            }));
            const reply = buildViewCartReply(mappedItems);
            await sendWhatsAppMessage(senderPhone, reply);
            await db.from("whatsapp_inbound_events").update({ processing_status: "view_cart" }).eq("id", eventRowId);
            return;
          }
        }
        await sendWhatsAppMessage(senderPhone, "🛒 Your cart is currently empty.");
        return;
      }

      if (id === "checkout_confirm") {
        const reply = buildCheckoutConfirmationReply();
        await sendWhatsAppMessage(senderPhone, reply);
        await db.from("whatsapp_inbound_events").update({ processing_status: "checkout_confirm" }).eq("id", eventRowId);
        return;
      }

      if (id === "submit_order") {
        const { data: cartOrder, error } = await db.from("orders").select("id").eq("dealer_phone", senderPhone).eq("status", "in_cart").single();

        if (!error && cartOrder) {
          const { data: items } = await db.from("order_items")
            .select("quantity, stock_items(design_number_display)")
            .eq("order_id", cartOrder.id);
            
          if (items && items.length > 0) {
            // Update status to pending (waiting for owner)
            await db.from("orders").update({ status: "pending" }).eq("id", cartOrder.id);

            const mappedItems = items.map((i: any) => ({
              design_number: i.stock_items?.design_number_display || "Unknown",
              quantity_requested: i.quantity
            }));

            const reply = buildCheckoutReceiptReply(mappedItems);
            const { messageId } = await sendWhatsAppMessage(senderPhone, reply);
            
            // Send Admin Approval Request — include orderId in button IDs
            const ownerPhone = process.env.ADMIN_WHATSAPP_NUMBER || "918179893241";
            const adminReply = buildAdminApprovalRequest(senderPhone, mappedItems, cartOrder.id);
            await sendWhatsAppMessage(ownerPhone, adminReply).catch(console.error);

            await db.from("whatsapp_inbound_events").update({ processing_status: "checkout_complete", reply_message_id: messageId }).eq("id", eventRowId);
            return;
          }
        }
        
        const { messageId } = await sendWhatsAppMessage(senderPhone, "Your cart is empty.");
        await db.from("whatsapp_inbound_events").update({ processing_status: "checkout_empty", reply_message_id: messageId }).eq("id", eventRowId);
        return;
      }

      if (id.startsWith("admin_accept_") || id.startsWith("admin_reject_")) {
        // Format: admin_accept_{orderId}_{dealerPhone} or admin_reject_{orderId}_{dealerPhone}
        const isAccept = id.startsWith("admin_accept_");
        const withoutPrefix = id.replace(isAccept ? "admin_accept_" : "admin_reject_", "");
        // orderId is UUID (36 chars), rest is dealer phone
        const orderId = withoutPrefix.substring(0, 36);
        const dealerPhone = withoutPrefix.substring(37); // skip the underscore

        if (!orderId || !dealerPhone) {
          await sendWhatsAppMessage(senderPhone, "Could not identify the order. Please use the Admin Dashboard.");
          return;
        }

        // Call the admin orders API — this handles stock deduction + audit logs
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://wallking-eight.vercel.app";
        const adminSecret = process.env.ADMIN_SECRET || "";
        const apiRes = await fetch(`${appUrl}/api/admin/orders`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-admin-secret": adminSecret
          },
          body: JSON.stringify({ id: orderId, action: isAccept ? "accept" : "reject", source: "WHATSAPP" })
        });

        if (!apiRes.ok) {
          const errText = await apiRes.text();
          console.error("[webhook] Failed to update order via API:", errText);
          await sendWhatsAppMessage(senderPhone, "⚠️ Failed to update order. Please try the Admin Dashboard.");
          return;
        }

        // Confirm to admin
        const adminConfirm = isAccept
          ? `✅ Order *${orderId.substring(0, 8)}...* has been *accepted*. The dealer will be notified.`
          : `❌ Order *${orderId.substring(0, 8)}...* has been *rejected*. The dealer will be notified.`;
        const { messageId } = await sendWhatsAppMessage(senderPhone, adminConfirm);

        // Notify dealer
        const dealerMsg = isAccept ? buildDealerApprovalReply() : buildDealerRejectionReply();
        await sendWhatsAppMessage(dealerPhone, dealerMsg).catch(console.error);

        await db.from("whatsapp_inbound_events").update({
          processing_status: isAccept ? "admin_accepted" : "admin_rejected",
          reply_message_id: messageId
        }).eq("id", eventRowId);
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
            } else if (item.quantity > stockResult.quantityOnHand) {
              failures.push({ designNo: stockResult.designNo, reason: `Only ${stockResult.quantityOnHand} rolls available` });
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
        reply = buildStockButtonsReply(stockResult, hasCartItems);
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

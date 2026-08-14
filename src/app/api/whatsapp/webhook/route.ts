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
  detectSpecialCommand,
  buildSpecialCommandReply,
  buildStockButtonsReply,
  buildQuantityPromptReply,
  buildOrderConfirmationReply,
  buildInsufficientStockReply,
  buildBrandsListReply,
  buildDesignsListReply,
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
    // 1. Fetch previous state to handle Quantity inputs
    const { data: previousEvents } = await db
      .from("whatsapp_inbound_events")
      .select("processing_status, normalized_design_number")
      .eq("sender_reference", maskedPhone)
      .order("created_at", { ascending: false })
      .limit(2);
      
    const previousEvent = previousEvents && previousEvents.length > 1 ? previousEvents[1] : null;

    // --- STATE MACHINE: Quantity Validation ---
    if (!interactivePayload && previousEvent?.processing_status === "waiting_for_quantity" && previousEvent.normalized_design_number) {
      const qtyMatch = messageText.match(/^\s*(\d+)\s*(rolls?)?\s*$/i);
      if (qtyMatch) {
        const qty = parseInt(qtyMatch[1], 10);
        if (qty > 0) {
          const designNo = previousEvent.normalized_design_number;
          const stockResult = await lookupStock(designNo);
          
          if (stockResult.found && stockResult.available) {
            if (qty <= stockResult.quantityRolls) {
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

      if (id === "menu" || id === "check_another") {
        const { brands, hasNextPage } = await fetchBrands(1);
        const reply = buildBrandsListReply(brands, 1, hasNextPage);
        const { messageId } = await sendWhatsAppMessage(senderPhone, reply);
        await db.from("whatsapp_inbound_events").update({ processing_status: "menu_brands_1", reply_message_id: messageId }).eq("id", eventRowId);
        return;
      }

      if (id.startsWith("brands_page_")) {
        const page = parseInt(id.replace("brands_page_", ""), 10);
        const { brands, hasNextPage } = await fetchBrands(page);
        const reply = buildBrandsListReply(brands, page, hasNextPage);
        const { messageId } = await sendWhatsAppMessage(senderPhone, reply);
        await db.from("whatsapp_inbound_events").update({ processing_status: `menu_brands_${page}`, reply_message_id: messageId }).eq("id", eventRowId);
        return;
      }

      if (id.startsWith("brand_")) {
        const brand = id.replace("brand_", "");
        const { designs, hasNextPage } = await fetchDesignsByBrand(brand, 1);
        const reply = buildDesignsListReply(brand, designs, 1, hasNextPage);
        const { messageId } = await sendWhatsAppMessage(senderPhone, reply);
        await db.from("whatsapp_inbound_events").update({ processing_status: `menu_designs_${brand}_1`, reply_message_id: messageId }).eq("id", eventRowId);
        return;
      }

      if (id.startsWith("designs_page_")) {
        // id format: designs_page_BRANDNAME_PAGENUMBER
        const parts = id.replace("designs_page_", "").split("_");
        const page = parseInt(parts.pop() || "1", 10);
        const brand = parts.join("_");
        const { designs, hasNextPage } = await fetchDesignsByBrand(brand, page);
        const reply = buildDesignsListReply(brand, designs, page, hasNextPage);
        const { messageId } = await sendWhatsAppMessage(senderPhone, reply);
        await db.from("whatsapp_inbound_events").update({ processing_status: `menu_designs_${brand}_${page}`, reply_message_id: messageId }).eq("id", eventRowId);
        return;
      }

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
        // id format: buy_partial_DESIGN_QTY
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
         // Log backorder inquiry and send agent reply
         const reply = buildAgentReply();
         const { messageId } = await sendWhatsAppMessage(senderPhone, reply);
         await db.from("whatsapp_inbound_events").update({ processing_status: "backorder_agent", reply_message_id: messageId }).eq("id", eventRowId);
         return;
      }

      if (id.startsWith("design_")) {
        // They selected a design from the list, treat it as a lookup query
        messageText = id.replace("design_", "");
      }
    }

    // --- STATE MACHINE: Website Templates & Manual Lookups ---
    if (!interactivePayload) {
      // 1. Check special commands first
      const command = detectSpecialCommand(messageText);
      if (command && command !== "HELP") {
        const reply = buildSpecialCommandReply(command);
        const { messageId } = await sendWhatsAppMessage(senderPhone, reply);
        await db.from("whatsapp_inbound_events").update({ processing_status: "command_handled", reply_message_id: messageId }).eq("id", eventRowId);
        return;
      }

      // 2. Check for Website Order Request Template
      const isWebsiteOrderRequest = messageText.includes("Order Request:") && messageText.includes("Design No:");
      if (isWebsiteOrderRequest) {
        const match = messageText.match(/Design No:\s*([A-Za-z0-9-]+)/i);
        if (match && match[1]) {
           const designNo = normalizeDesignNumber(match[1]);
           const reply = buildQuantityPromptReply(designNo);
           const { messageId } = await sendWhatsAppMessage(senderPhone, reply);
           await db.from("whatsapp_inbound_events").update({
             processing_status: "waiting_for_quantity",
             reply_message_id: messageId,
             normalized_design_number: designNo
           }).eq("id", eventRowId);
           return;
        }
      }

      // 3. Try to extract design number
      const designNo = extractDesignNumberFromText(messageText);

      // 4. If no design number found, treat as Greeting -> Main Menu
      if (!designNo) {
        const { brands, hasNextPage } = await fetchBrands(1);
        const reply = buildBrandsListReply(brands, 1, hasNextPage);
        const { messageId } = await sendWhatsAppMessage(senderPhone, reply);
        await db.from("whatsapp_inbound_events").update({ processing_status: "menu_brands_1", reply_message_id: messageId }).eq("id", eventRowId);
        return;
      }

      // 5. Stock Lookup
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

      if (!stockResult.found) {
        reply = buildNotFoundReply(designNo);
        status = "not_found";
      } else if (!stockResult.available) {
        reply = buildOutOfStockReply(stockResult.designNo);
        status = "out_of_stock";
      } else {
        reply = buildStockButtonsReply(stockResult);
        status = "replied";
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

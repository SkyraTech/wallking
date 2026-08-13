/**
 * /api/whatsapp/webhook
 *
 * Meta WhatsApp Business Cloud API webhook.
 *
 * GET  — webhook verification (Meta pings this when you register the webhook)
 * POST — inbound message handler
 *
 * Security checklist:
 *   ✅ GET: validates hub.mode, hub.verify_token, returns hub.challenge only on match
 *   ✅ POST: verifies X-Hub-Signature-256 with META_APP_SECRET (constant-time compare)
 *   ✅ POST: deduplicates by meta_message_id before any processing
 *   ✅ POST: returns 200 immediately; processing runs asynchronously
 *   ✅ POST: DB failure returns safe-failure reply (never "Out of Stock")
 *   ✅ Phone numbers masked in all logs
 */

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import {
  lookupStock,
  StockLookupError,
  extractDesignNumberFromText,
} from "@/lib/stock-service";
import {
  sendWhatsAppMessage,
  buildAvailableReply,
  buildOutOfStockReply,
  buildNotFoundReply,
  buildSafeFailureReply,
  detectSpecialCommand,
  buildSpecialCommandReply,
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
    console.log("[webhook] Verification successful");
    return new NextResponse(challenge, { status: 200 });
  }

  console.warn("[webhook] Verification failed — token mismatch or wrong mode");
  return new NextResponse("Forbidden", { status: 403 });
}

// ---------------------------------------------------------------------------
// Signature verification (X-Hub-Signature-256)
// ---------------------------------------------------------------------------

function verifySignature(rawBody: Buffer, signature: string | null): boolean {
  const appSecret = process.env.META_APP_SECRET;
  if (!appSecret) {
    console.error("[webhook] META_APP_SECRET is not set — rejecting all POSTs");
    return false;
  }
  if (!signature) return false;

  const expected = `sha256=${crypto
    .createHmac("sha256", appSecret)
    .update(rawBody)
    .digest("hex")}`;

  // Constant-time comparison to prevent timing attacks
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
// Message processing (runs after 200 is returned to Meta)
// ---------------------------------------------------------------------------

async function processMessage(
  metaMessageId: string,
  senderPhone: string,
  messageText: string,
  eventRowId: string
): Promise<void> {
  const correlationId = metaMessageId;
  const maskedPhone = maskPhone(senderPhone);

  try {
    // --- Update status to "processing" ---
    await db
      .from("whatsapp_inbound_events")
      .update({ processing_status: "processing" })
      .eq("id", eventRowId);

    // --- Detect special commands first ---
    const command = detectSpecialCommand(messageText);
    if (command) {
      const reply = buildSpecialCommandReply(command);
      const { messageId: replyId } = await sendWhatsAppMessage(senderPhone, reply);
      await db
        .from("whatsapp_inbound_events")
        .update({
          processing_status: "command_handled",
          reply_message_id: replyId,
        })
        .eq("id", eventRowId);

      console.log(
        `[webhook] [${correlationId}] Command "${command}" handled for ${maskedPhone}`
      );
      return;
    }

    // --- Extract design number ---
    const designNo = extractDesignNumberFromText(messageText);

    if (!designNo) {
      const reply = buildNotFoundReply(messageText);
      const { messageId: replyId } = await sendWhatsAppMessage(senderPhone, reply);
      await db
        .from("whatsapp_inbound_events")
        .update({
          processing_status: "not_found",
          normalized_design_number: null,
          reply_message_id: replyId,
        })
        .eq("id", eventRowId);

      console.log(
        `[webhook] [${correlationId}] No design number found in message from ${maskedPhone}`
      );
      return;
    }

    // --- Update normalized design number in event log ---
    await db
      .from("whatsapp_inbound_events")
      .update({ normalized_design_number: designNo })
      .eq("id", eventRowId);

    // --- Look up stock ---
    let stockResult;
    try {
      stockResult = await lookupStock(designNo);
    } catch (err) {
      if (err instanceof StockLookupError) {
        // DB failure — safe reply, never "Out of Stock"
        console.error(
          `[webhook] [${correlationId}] DB error looking up "${designNo}":`,
          err.message
        );
        const reply = buildSafeFailureReply();
        const { messageId: replyId } = await sendWhatsAppMessage(senderPhone, reply);
        await db
          .from("whatsapp_inbound_events")
          .update({
            processing_status: "db_error",
            reply_message_id: replyId,
            error_summary: err.message,
          })
          .eq("id", eventRowId);
        return;
      }
      throw err;
    }

    // --- Build reply based on stock result ---
    let reply: string;
    let status: string;

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

    // --- Send reply ---
    const { messageId: replyId } = await sendWhatsAppMessage(senderPhone, reply);

    await db
      .from("whatsapp_inbound_events")
      .update({
        processing_status: status,
        reply_message_id: replyId,
      })
      .eq("id", eventRowId);

    console.log(
      `[webhook] [${correlationId}] Replied to ${maskedPhone} — status: ${status}, design: ${designNo}`
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(
      `[webhook] [${correlationId}] Unhandled error for ${maskedPhone}:`,
      message
    );

    // Attempt safe failure reply on any unexpected error
    try {
      await sendWhatsAppMessage(senderPhone, buildSafeFailureReply());
    } catch (sendErr) {
      console.error(
        `[webhook] [${correlationId}] Failed to send safe-failure reply:`,
        sendErr instanceof SendMessageError ? sendErr.message : String(sendErr)
      );
    }

    try {
      await db
        .from("whatsapp_inbound_events")
        .update({
          processing_status: "db_error",
          error_summary: message.slice(0, 500),
        })
        .eq("id", eventRowId);
    } catch {}
  }
}

// ---------------------------------------------------------------------------
// POST — Inbound message handler
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  // 1. Read raw body for signature verification
  const rawBody = Buffer.from(await req.arrayBuffer());
  const signature = req.headers.get("x-hub-signature-256");

  // 2. Verify signature
  if (!verifySignature(rawBody, signature)) {
    console.warn("[webhook] Invalid signature — rejecting request");
    return new NextResponse("Forbidden", { status: 403 });
  }

  // 3. Parse payload
  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody.toString("utf-8"));
  } catch {
    return new NextResponse("Bad Request — invalid JSON", { status: 400 });
  }

  // 4. Return 200 immediately (Meta requires fast acknowledgment)
  //    Process async via setImmediate (MVP — upgrade to queue for production)
  const immediateResponse = new NextResponse("OK", { status: 200 });

  // 5. Extract and process messages asynchronously
  setImmediate(async () => {
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

            // Only process inbound text messages
            if (message.type !== "text") continue;

            const metaMessageId = message.id as string;
            const senderPhone = message.from as string;
            const messageText =
              ((message.text as Record<string, unknown>)?.body as string) ?? "";

            if (!metaMessageId || !senderPhone || !messageText.trim()) continue;

            const maskedPhone = maskPhone(senderPhone);

            // 6. Deduplicate — persist before processing
            //    ON CONFLICT DO NOTHING prevents duplicate replies
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
              // Unique constraint violation = duplicate webhook delivery
              if (insertError.code === "23505") {
                console.log(
                  `[webhook] Duplicate message ${metaMessageId} — skipping`
                );
                continue;
              }
              // Other DB error — log and skip (don't send reply for uknown state)
              console.error(
                `[webhook] Failed to persist event ${metaMessageId}:`,
                insertError.message
              );
              continue;
            }

            if (!inserted) {
              // Race: another instance already handled this message
              console.log(
                `[webhook] Race-condition duplicate ${metaMessageId} — skipping`
              );
              continue;
            }

            // 7. Process message (async, after 200 already sent)
            await processMessage(
              metaMessageId,
              senderPhone,
              messageText,
              inserted.id
            );
          }
        }
      }
    } catch (err) {
      console.error("[webhook] Top-level processing error:", err);
    }
  });

  return immediateResponse;
}

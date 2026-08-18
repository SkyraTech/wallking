import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { normalizeDesignNumber } from "@/lib/stock-service";

function checkAdminAuth(req: NextRequest): boolean {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;
  const cookie = req.cookies.get("wk_admin_session")?.value;
  return cookie === secret;
}

export async function GET(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  let query = db.from("orders")
    .select(`
      *,
      dealers(business_name, contact_name),
      order_items(
        id, quantity, stock_item_id,
        stock_items(design_number_display, quantity_on_hand, quantity_allocated, brand)
      )
    `)
    .order("created_on", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  } else {
    query = query.neq("status", "in_cart");
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ orders: data });
}

export async function POST(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { dealer_phone, business_name, items } = body;

  if (!dealer_phone || !items || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Missing required fields or empty items" }, { status: 400 });
  }

  // 1. Upsert Dealer
  await db.from("dealers").upsert(
    { phone_number: dealer_phone, business_name: business_name || "Manual Customer" },
    { onConflict: "phone_number" }
  );

  // 2. Resolve Stock Items
  const auditLogs = [];
  const orderItemsToInsert = [];
  
  for (const item of items) {
    const normalized = normalizeDesignNumber(item.designNo);
    const { data: stock } = await db.from("stock_items")
      .select("*")
      .eq("design_number_normalized", normalized)
      .single();

    if (!stock) {
      return NextResponse.json({ error: `Stock item ${item.designNo} not found.` }, { status: 404 });
    }

    const available = stock.quantity_on_hand - stock.quantity_allocated;
    if (available < item.quantity) {
      return NextResponse.json({ error: `Insufficient stock for ${item.designNo}. Available: ${available}, requested: ${item.quantity}` }, { status: 400 });
    }

    // Prepare deductions
    const newOnHand = stock.quantity_on_hand - item.quantity;
    
    // Update stock immediately (atomic enough for this scope)
    await db.from("stock_items")
      .update({ quantity_on_hand: newOnHand, updated_on: new Date().toISOString() })
      .eq("id", stock.id);

    orderItemsToInsert.push({
      stock_item_id: stock.id,
      quantity: item.quantity
    });

    auditLogs.push({
      action_type: "ORDER_DEDUCT_MANUAL",
      design_number: stock.design_number_display,
      previous_quantity: stock.quantity_on_hand,
      new_quantity: newOnHand,
      delta: -item.quantity,
      created_by: "ADMIN_DASHBOARD"
    });
  }

  // 3. Create Order
  const { data: order, error: orderErr } = await db.from("orders").insert({
    dealer_phone,
    status: "accepted"
  }).select().single();

  if (orderErr || !order) {
    console.error("Order header error:", orderErr);
    return NextResponse.json({ error: "Failed to create order header", details: orderErr?.message }, { status: 500 });
  }

  // 4. Create Order Items
  for (const oi of orderItemsToInsert) {
    await db.from("order_items").insert({
      order_id: order.id,
      stock_item_id: oi.stock_item_id,
      quantity: oi.quantity
    });
  }

  // 5. Insert Audits
  if (auditLogs.length > 0) {
    await db.from("stock_audit_logs").insert(auditLogs);
  }

  return NextResponse.json({ success: true, order });
}

export async function PATCH(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { id, action, source } = body;  // source: "WHATSAPP" | "ADMIN_DASHBOARD"

  if (!id || !action || !["accept", "reject"].includes(action)) {
    return NextResponse.json({ error: "Invalid action or missing ID" }, { status: 400 });
  }

  // Fetch full order with items and stock
  const { data: order, error: fetchErr } = await db
    .from("orders")
    .select(`
      *,
      order_items(
        id, quantity, stock_item_id,
        stock_items(id, design_number_display, quantity_on_hand, quantity_allocated)
      )
    `)
    .eq("id", id)
    .single();

  if (fetchErr || !order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.status !== "pending") {
    return NextResponse.json({ error: "Order is not pending" }, { status: 400 });
  }

  if (action === "reject") {
    // Release allocated stock
    for (const item of order.order_items) {
      if (item.stock_items) {
        const newAllocated = Math.max(0, item.stock_items.quantity_allocated - item.quantity);
        await db.from("stock_items").update({ quantity_allocated: newAllocated }).eq("id", item.stock_item_id);
      }
    }

    const { error: updateErr } = await db.from("orders").update({ status: "rejected" }).eq("id", id);
    if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });
    return NextResponse.json({ success: true, status: "rejected" });
  }

  if (action === "accept") {
    // 1. Verify all items can be fulfilled
    for (const item of order.order_items) {
      if (!item.stock_items) {
        return NextResponse.json({ error: "A stock item for this order is missing from the database." }, { status: 400 });
      }
      const available = item.stock_items.quantity_on_hand; // already allocated doesn't matter for ACCEPT, because it's PART of the allocated pool. We just need to check if physical stock is there.
      // Wait, if it was allocated, on_hand must be >= quantity.
      if (item.stock_items.quantity_on_hand < item.quantity) {
         return NextResponse.json({ error: `Insufficient physical stock for ${item.stock_items.design_number_display}. Have ${item.stock_items.quantity_on_hand}, need ${item.quantity}.` }, { status: 400 });
      }
    }

    const auditLogs = [];

    // 2. Fulfill and Deduct
    for (const item of order.order_items) {
      const stock = item.stock_items;
      const newOnHand = stock.quantity_on_hand - item.quantity;
      const newAllocated = Math.max(0, stock.quantity_allocated - item.quantity);

      await db.from("stock_items")
        .update({ 
          quantity_on_hand: newOnHand, 
          quantity_allocated: newAllocated, 
          updated_on: new Date().toISOString() 
        })
        .eq("id", item.stock_item_id);

      auditLogs.push({
        action_type: "ORDER_DEDUCT_WHATSAPP",
        design_number: stock.design_number_display,
        previous_quantity: stock.quantity_on_hand,
        new_quantity: newOnHand,
        delta: -item.quantity,
        // If approved from WhatsApp show dealer phone, otherwise show who approved it
        created_by: source === "WHATSAPP"
          ? `WA:${order.dealer_phone}`
          : "ADMIN_DASHBOARD"
      });
    }

    if (auditLogs.length > 0) {
      await db.from("stock_audit_logs").insert(auditLogs);
    }

    const { error: updateOrderErr } = await db.from("orders").update({ status: "accepted" }).eq("id", id);
    if (updateOrderErr) {
      return NextResponse.json({ error: "Failed to update order status" }, { status: 500 });
    }

    return NextResponse.json({ success: true, status: "accepted" });
  }
}

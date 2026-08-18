"use client";

import { useState, useEffect, useCallback } from "react";
import {
  LogOut,
  Layers,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  ShoppingBag,
  Package,
  PlusCircle,
  Trash2,
  Smartphone
} from "lucide-react";

interface OrderItem {
  id: string;
  quantity: number;
  stock_item_id: string;
  stock_items: {
    design_number_display: string;
    quantity_on_hand: number;
    quantity_allocated: number;
    brand: string;
  };
}

interface Order {
  id: string;
  dealer_phone: string;
  status: "pending" | "accepted" | "rejected";
  order_source: string;
  created_on: string;
  dealers?: {
    business_name: string;
    contact_name: string;
  };
  order_items: OrderItem[];
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"pending" | "accepted" | "rejected" | "create">("pending");

  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Create Manual Order State
  const [manualPhone, setManualPhone] = useState("");
  const [manualBusinessName, setManualBusinessName] = useState("");
  const [manualItems, setManualItems] = useState<{ designNo: string; quantity: string }[]>([{ designNo: "", quantity: "" }]);
  const [creating, setCreating] = useState(false);
  const [createSuccess, setCreateSuccess] = useState("");

  const fetchOrders = useCallback(async (status: string) => {
    if (status === "create") return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/orders?status=${status}`, {
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = "/admin/login";
          return;
        }
        throw new Error("Failed to load orders");
      }
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
    fetchOrders(activeTab);
  }, [activeTab, fetchOrders]);

  const handleAction = async (id: string, action: "accept" | "reject") => {
    setActionLoading(id);
    setError("");
    try {
      const res = await fetch(`/api/admin/orders`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id, action }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Action failed");
      }
      fetchOrders(activeTab);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateManualOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setCreateSuccess("");
    setCreating(true);

    const validItems = manualItems.filter(i => i.designNo.trim() !== "" && parseInt(i.quantity) > 0).map(i => ({
      designNo: i.designNo.trim(),
      quantity: parseInt(i.quantity)
    }));

    if (validItems.length === 0) {
      setError("Please add at least one valid item.");
      setCreating(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          dealer_phone: manualPhone,
          business_name: manualBusinessName,
          items: validItems
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create order");

      setCreateSuccess(`Order successfully created for ${manualPhone}!`);
      setManualPhone("");
      setManualBusinessName("");
      setManualItems([{ designNo: "", quantity: "" }]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/login", { method: "DELETE", credentials: "include" });
    window.location.href = "/admin/login";
  };

  return (
    <div className="min-h-screen bg-void">
      {/* Header */}
      <header className="border-b border-line bg-panel/90 backdrop-blur-md sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
              <ShoppingBag className="h-4 w-4 text-white" />
            </div>
            <div>
              <span className="font-display text-sm font-bold text-ink">Wall King</span>
              <span className="ml-2 text-xs text-ink-3">Order Dashboard</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="/admin/logs"
              className="text-xs text-ink-3 hover:text-accent transition-colors flex items-center gap-1 bg-accent/10 px-3 py-1.5 rounded-lg font-bold"
            >
              Audit Logs
            </a>
            <a
              href="/admin/stock"
              className="text-xs text-ink-3 hover:text-accent transition-colors flex items-center gap-1"
            >
              <Package className="h-3.5 w-3.5" /> Stock Portal
            </a>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs text-ink-3 hover:border-rose-500 hover:text-rose-500 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink">Orders & Invoices</h1>
            <p className="text-xs text-ink-3 mt-1">Manage B2B dealer orders placed via WhatsApp or Phone.</p>
          </div>
          
          <div className="flex gap-1 rounded-xl border border-line bg-void/80 p-1 w-fit overflow-x-auto">
            {(["pending", "accepted", "rejected", "create"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === tab
                    ? tab === "create" ? "bg-accent/20 text-accent border border-accent/30 shadow-md" : "bg-accent text-white shadow-md"
                    : "text-ink-3 hover:text-ink"
                }`}
              >
                {tab === "pending" && <Clock className="h-3.5 w-3.5" />}
                {tab === "accepted" && <CheckCircle2 className="h-3.5 w-3.5" />}
                {tab === "rejected" && <XCircle className="h-3.5 w-3.5" />}
                {tab === "create" && <PlusCircle className="h-3.5 w-3.5" />}
                <span className="capitalize">{tab === "create" ? "Create Order" : tab}</span>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm font-semibold text-rose-500 flex items-center gap-2">
            <XCircle className="h-5 w-5" />
            {error}
          </div>
        )}
        {createSuccess && (
          <div className="mb-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm font-semibold text-emerald-500 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            {createSuccess}
          </div>
        )}

        {activeTab === "create" ? (
           <div className="rounded-2xl border border-line bg-panel/90 shadow-xl backdrop-blur-xl max-w-3xl p-6">
             <div className="mb-6 border-b border-line pb-4">
               <h2 className="font-display text-lg font-bold text-ink flex items-center gap-2">
                 <Smartphone className="h-5 w-5 text-accent" />
                 Create Manual Order
               </h2>
               <p className="text-xs text-ink-3 mt-1">Directly log a phone or walk-in order. This deducts stock instantly.</p>
             </div>
             <form onSubmit={handleCreateManualOrder} className="space-y-6">
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-xs font-semibold text-ink-3 mb-1">Dealer Phone *</label>
                   <input required type="text" value={manualPhone} onChange={e => setManualPhone(e.target.value)} className="w-full rounded-xl border border-line bg-void px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none" placeholder="e.g. 919876543210" />
                 </div>
                 <div>
                   <label className="block text-xs font-semibold text-ink-3 mb-1">Business Name (Optional)</label>
                   <input type="text" value={manualBusinessName} onChange={e => setManualBusinessName(e.target.value)} className="w-full rounded-xl border border-line bg-void px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none" placeholder="e.g. Skyra Tech" />
                 </div>
               </div>

               <div>
                 <label className="block text-xs font-semibold text-ink-3 mb-2 border-b border-line pb-2">Order Items</label>
                 {manualItems.map((item, idx) => (
                   <div key={idx} className="flex items-center gap-3 mb-3">
                     <input required type="text" placeholder="Design No." value={item.designNo} onChange={e => {
                       const newItems = [...manualItems];
                       newItems[idx].designNo = e.target.value;
                       setManualItems(newItems);
                     }} className="flex-1 rounded-xl border border-line bg-void px-3 py-2 text-sm text-ink font-mono focus:border-accent focus:outline-none" />
                     <input required type="number" min="1" placeholder="Qty" value={item.quantity} onChange={e => {
                       const newItems = [...manualItems];
                       newItems[idx].quantity = e.target.value;
                       setManualItems(newItems);
                     }} className="w-24 rounded-xl border border-line bg-void px-3 py-2 text-sm text-ink font-mono focus:border-accent focus:outline-none" />
                     <button type="button" onClick={() => {
                        const newItems = manualItems.filter((_, i) => i !== idx);
                        if (newItems.length === 0) newItems.push({ designNo: "", quantity: "" });
                        setManualItems(newItems);
                     }} className="p-2 text-ink-3 hover:text-rose-500 transition-colors">
                       <Trash2 className="h-4 w-4" />
                     </button>
                   </div>
                 ))}
                 <button type="button" onClick={() => setManualItems([...manualItems, { designNo: "", quantity: "" }])} className="text-xs text-accent font-bold hover:underline">
                   + Add another item
                 </button>
               </div>

               <div className="pt-4 border-t border-line">
                 <button type="submit" disabled={creating} className="w-full rounded-xl bg-accent px-4 py-3 text-sm font-bold text-white shadow-lg shadow-accent/20 hover:bg-accent/90 transition-all disabled:opacity-50">
                   {creating ? "Processing..." : "Create Order & Deduct Stock"}
                 </button>
               </div>
             </form>
           </div>
        ) : (
          <div className="space-y-6">
            {loading && orders.length === 0 && (
              <div className="rounded-2xl border border-line bg-panel/90 p-12 text-center text-ink-3">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-3 opacity-50" />
                Loading orders...
              </div>
            )}
            
            {!loading && orders.length === 0 && (
              <div className="rounded-2xl border border-line bg-panel/90 p-12 text-center text-ink-3 shadow-xl backdrop-blur-xl">
                No {activeTab} orders found.
              </div>
            )}

            {orders.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE).map((order) => (
              <div key={order.id} className="rounded-2xl border border-line bg-panel/90 shadow-xl backdrop-blur-xl overflow-hidden">
                {/* Order Header */}
                <div className="bg-void/40 border-b border-line p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-display font-bold text-ink text-lg">
                        {order.dealers?.business_name || "WhatsApp User"}
                      </span>
                      <span className="text-xs font-mono text-ink-3 bg-line/20 px-2 py-0.5 rounded">
                        {order.dealer_phone}
                      </span>
                      {order.order_source === "PHONE" && (
                         <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded flex items-center gap-1">
                           <Smartphone className="h-3 w-3" /> MANUAL
                         </span>
                      )}
                    </div>
                    <div className="text-xs text-ink-3">
                      Order ID: {order.id.split("-")[0]} • {new Date(order.created_on).toLocaleString("en-IN", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end">
                    {activeTab === "pending" ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAction(order.id, "reject")}
                          disabled={actionLoading === order.id}
                          className="inline-flex items-center justify-center rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-1.5 text-xs font-bold text-rose-500 hover:bg-rose-500 hover:text-white transition-all disabled:opacity-50"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleAction(order.id, "accept")}
                          disabled={actionLoading === order.id}
                          className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white shadow-lg hover:bg-emerald-500 transition-all disabled:opacity-50"
                        >
                          {actionLoading === order.id ? <span className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" /> : <CheckCircle2 className="h-3.5 w-3.5 mr-1" />}
                          Accept
                        </button>
                      </div>
                    ) : (
                      <span className={`inline-flex items-center gap-1 font-bold text-xs px-3 py-1.5 rounded-lg border ${
                        activeTab === "accepted" ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" : "text-rose-500 bg-rose-500/10 border-rose-500/20"
                      }`}>
                        {activeTab === "accepted" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                        {activeTab === "accepted" ? "Accepted" : "Rejected"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-4">
                  <table className="w-full text-left text-xs">
                    <thead className="text-ink-3 font-semibold uppercase tracking-wider border-b border-line">
                      <tr>
                        <th className="pb-2">Design No.</th>
                        <th className="pb-2">Brand</th>
                        <th className="pb-2 text-right">Qty Requested</th>
                        <th className="pb-2 text-right">Qty Available</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line/20">
                      {order.order_items?.map((item) => {
                        const stock = item.stock_items;
                        // For a pending order, "available" to fulfill this specific item is (on_hand).
                        // If it's accepted/rejected, we just show what it was.
                        const availablePhysical = stock ? stock.quantity_on_hand : 0;
                        const canFulfill = availablePhysical >= item.quantity;
                        
                        return (
                          <tr key={item.id}>
                            <td className="py-3 font-mono font-bold text-ink">{stock?.design_number_display || "Unknown"}</td>
                            <td className="py-3 text-ink-3">{stock?.brand || "—"}</td>
                            <td className="py-3 text-right font-bold text-accent">{item.quantity} Rolls</td>
                            <td className="py-3 text-right">
                              {activeTab === "pending" && !canFulfill ? (
                                <span className="text-rose-500 font-bold">{availablePhysical} (Insufficient)</span>
                              ) : (
                                <span className="text-ink-3">{availablePhysical}</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
            
            {/* Pagination Controls */}
            {orders.length > ITEMS_PER_PAGE && (
              <div className="mt-6 flex items-center justify-between border-t border-line pt-6">
                <p className="text-xs text-ink-3">
                  Showing {(page - 1) * ITEMS_PER_PAGE + 1} to {Math.min(page * ITEMS_PER_PAGE, orders.length)} of {orders.length} orders
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="rounded-lg border border-line px-4 py-2 text-xs font-bold hover:bg-panel disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-xs font-bold text-ink px-2">{page} / {Math.ceil(orders.length / ITEMS_PER_PAGE)}</span>
                  <button
                    onClick={() => setPage((p) => Math.min(Math.ceil(orders.length / ITEMS_PER_PAGE), p + 1))}
                    disabled={page >= Math.ceil(orders.length / ITEMS_PER_PAGE)}
                    className="rounded-lg border border-line px-4 py-2 text-xs font-bold hover:bg-panel disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

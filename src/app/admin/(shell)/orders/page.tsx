"use client";

import { useState, useRef, useEffect } from "react";
import useSWR from "swr";
import Link from "next/link";

interface OrderItem {
  _key: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  image?: string;
}

interface Order {
  _id: string;
  _createdAt: string;
  reference: string;
  status: "pending" | "awaiting_payment" | "success" | "failed" | "processing" | "shipped" | "delivered" | "refunded" | "disputed";
  paymentMethod?: "paystack" | "bank_transfer";
  customerName: string;
  customerEmail: string;
  subtotal: number;
  currency: string;
  items: OrderItem[];
  shippingAddress?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  paidAt?: string;
  shippingMethod?: {
    name: string;
    price: number;
    estimatedDays?: string;
  };
  note?: string;
}

const fetcher = (url: string) =>
  fetch(url)
    .then((r) => r.json())
    .then((d) => (Array.isArray(d.orders) ? d.orders : Array.isArray(d) ? d : []));

const STATUS_LABELS: Record<string, { label: string; classes: string }> = {
  success: { label: "Paid", classes: "bg-green-50 text-green-700 border border-green-200" },
  pending: { label: "Pending", classes: "bg-amber-50 text-amber-700 border border-amber-200" },
  awaiting_payment: { label: "Awaiting Transfer", classes: "bg-orange-50 text-orange-700 border border-orange-200" },
  failed: { label: "Failed", classes: "bg-red-50 text-red-600 border border-red-200" },
  processing: { label: "Processing", classes: "bg-blue-50 text-blue-700 border border-blue-200" },
  shipped: { label: "Shipped", classes: "bg-indigo-50 text-indigo-700 border border-indigo-200" },
  delivered: { label: "Delivered", classes: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  refunded: { label: "Refunded", classes: "bg-purple-50 text-purple-700 border border-purple-200" },
  disputed: { label: "Disputed", classes: "bg-orange-50 text-orange-800 border border-orange-300" },
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  paystack: "Paystack",
  bank_transfer: "Bank Transfer",
};

// Must mirror the server-side ALLOWED_TRANSITIONS in /api/admin/orders/route.ts
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  pending:          ["processing", "success", "failed"],
  awaiting_payment: ["success", "failed"],
  success:          ["processing", "refunded", "disputed"],
  processing:       ["shipped", "refunded", "disputed"],
  shipped:          ["delivered", "refunded", "disputed"],
  delivered:        ["refunded", "disputed"],
  failed:           ["pending"],
  refunded:         [],
  disputed:         ["refunded"],
};

export default function AdminOrdersPage() {
  const { data: orders = [], isLoading, mutate } = useSWR<Order[]>(
    "/api/admin/orders",
    fetcher,
    { revalidateOnFocus: true }
  );

  const [selected, setSelected] = useState<Order | null>(null);
  const [filter, setFilter] = useState<"all" | "success" | "pending" | "awaiting_payment" | "failed">("all");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusError, setStatusError] = useState("");

  // Always work from a guaranteed array — SWR can briefly yield undefined during revalidation
  const safeOrders = Array.isArray(orders) ? orders : [];

  // Auto-scroll into the detail panel when an order is selected on mobile
  const detailRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (selected && detailRef.current) {
      const isSmall = window.innerWidth < 1024;
      if (isSmall) {
        setTimeout(() => detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
      }
    }
  }, [selected]);

  const handleStatusUpdate = async (orderId: string, currentStatus: string, newStatus: string) => {
    // No-op: same status or no valid transition
    if (newStatus === currentStatus) return;
    const allowed = ALLOWED_TRANSITIONS[currentStatus] ?? [];
    if (!allowed.includes(newStatus)) return;

    const typed = newStatus as Order["status"];
    const snapshot = orders;
    setStatusError("");

    // Optimistic update — reflect instantly in list and detail panel
    mutate(
      orders.map((o) => (o._id === orderId ? { ...o, status: typed } : o)),
      { revalidate: false }
    );
    setSelected((prev) => (prev?._id === orderId ? { ...prev, status: typed } : prev));

    setUpdatingStatus(true);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setStatusError(err.error ?? `Failed to update status (${res.status})`);
        // Rollback optimistic update
        mutate(snapshot, { revalidate: false });
        setSelected((prev) => (prev?._id === orderId ? { ...prev, status: currentStatus as Order["status"] } : prev));
      }
    } catch {
      setStatusError("Network error — please try again.");
      mutate(snapshot, { revalidate: false });
      setSelected((prev) => (prev?._id === orderId ? { ...prev, status: currentStatus as Order["status"] } : prev));
    } finally {
      setUpdatingStatus(false);
    }
  };

  const filtered = filter === "all" ? safeOrders : safeOrders.filter((o) => o.status === filter);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const formatAmount = (amount: number, currency: string) =>
    `${currency} ${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

  return (
    <div className="max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-medium text-brand-text">Orders</h1>
          <p className="text-sm text-[#999] mt-0.5">
            {safeOrders.length} order{safeOrders.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <button
          onClick={() => mutate()}
          className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.15em] text-[#666] hover:text-brand-text transition-colors border border-brand-border px-3 py-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Bank transfer action banner */}
      {(() => {
        const pending = safeOrders.filter(
          (o) => o.status === "awaiting_payment" && o.paymentMethod === "bank_transfer"
        );
        if (pending.length === 0) return null;
        return (
          <div className="mb-6 flex items-start gap-3 bg-amber-50 border border-amber-200 px-4 py-3">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-amber-600 mt-0.5 shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            <div>
              <p className="text-[12px] font-medium text-amber-800">
                {pending.length} bank transfer order{pending.length !== 1 ? "s" : ""} awaiting verification
              </p>
              <p className="text-[11px] text-amber-700 mt-0.5">
                Check your bank portal to confirm receipt, then set each order to <strong>Processing</strong>.
              </p>
            </div>
          </div>
        );
      })()}

      {/* Filter tabs */}
      <div className="flex gap-1 mb-6 border-b border-brand-border overflow-x-auto scrollbar-hide">
        {(["all", "success", "pending", "awaiting_payment", "failed"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => { setFilter(tab); setSelected(null); }}
            className={`px-4 py-2.5 text-[11px] uppercase tracking-[0.15em] border-b-2 transition-colors -mb-px ${
              filter === tab
                ? "border-brand-accent text-brand-accent"
                : "border-transparent text-[#666] hover:text-brand-text"
            }`}
          >
            {tab === "all" ? "All" : STATUS_LABELS[tab].label}
            {tab !== "all" && (
              <span className="ml-1.5 text-[9px]">
                ({safeOrders.filter((o) => o.status === tab).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-[#999] text-sm">Loading orders…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-[#999] text-sm">No orders found.</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Orders list */}
          <div className="lg:col-span-2 space-y-2">
            {filtered.map((order) => (
              <button
                key={order._id}
                onClick={() => setSelected(order)}
                className={`w-full text-left border p-4 hover:border-brand-accent transition-colors ${
                  selected?._id === order._id
                    ? "border-brand-accent bg-[#fdf9f7]"
                    : "border-brand-border bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-brand-text truncate">
                      {order.customerName || order.customerEmail}
                    </p>
                    <p className="text-[11px] text-[#999] mt-0.5 truncate">{order.customerEmail}</p>
                    <p className="text-[10px] text-[#bbb] mt-1 font-mono">{order.reference}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span
                      className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm ${
                        STATUS_LABELS[order.status]?.classes ?? "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {STATUS_LABELS[order.status]?.label ?? order.status}
                    </span>
                    <p className="text-sm font-medium text-brand-text">
                      {formatAmount(order.subtotal ?? 0, order.currency ?? "NGN")}
                    </p>
                    <p className="text-[10px] text-[#bbb]">{formatDate(order._createdAt)}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Detail panel */}
          {selected ? (
            <div ref={detailRef} className="border border-brand-border bg-white p-5 h-fit scroll-mt-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-medium text-sm text-brand-text">Order Detail</h2>
                <button
                  onClick={() => setSelected(null)}
                  className="text-[#999] hover:text-brand-text transition-colors flex items-center gap-1.5 text-[10px] uppercase tracking-[0.1em]"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                  <span className="lg:hidden">Back to list</span>
                </button>
              </div>

              <div className="space-y-4 text-sm">
                {/* Status + ref + payment method */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`inline-block text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm ${
                        STATUS_LABELS[selected.status]?.classes
                      }`}
                    >
                      {STATUS_LABELS[selected.status]?.label}
                    </span>
                    {selected.paymentMethod && (
                      <span className="inline-block text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm bg-brand-light text-[#666] border border-brand-border">
                        {PAYMENT_METHOD_LABELS[selected.paymentMethod] ?? selected.paymentMethod}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] font-mono text-[#999] break-all">{selected.reference}</p>
                </div>

                {/* Customer */}
                <div className="border-t border-brand-border pt-3">
                  <p className="text-[10px] uppercase tracking-[0.15em] text-[#999] mb-2">Customer</p>
                  <p className="text-brand-text">{selected.customerName}</p>
                  <a
                    href={`mailto:${selected.customerEmail}`}
                    className="text-brand-accent hover:underline text-[11px]"
                  >
                    {selected.customerEmail}
                  </a>
                </div>

                {/* Dates */}
                <div className="border-t border-brand-border pt-3 space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#999]">Placed</span>
                    <span>{formatDate(selected._createdAt)}</span>
                  </div>
                  {selected.paidAt && (
                    <div className="flex justify-between text-[11px]">
                      <span className="text-[#999]">Paid</span>
                      <span>{formatDate(selected.paidAt)}</span>
                    </div>
                  )}
                </div>

                {/* Items */}
                <div className="border-t border-brand-border pt-3">
                  <p className="text-[10px] uppercase tracking-[0.15em] text-[#999] mb-2">Items</p>
                  <div className="space-y-2">
                    {(selected.items ?? []).map((item, i) => (
                      <div key={item._key ?? i} className="flex justify-between items-start gap-2 text-[12px]">
                        <div className="min-w-0">
                          <p className="text-brand-text truncate">{item.name}</p>
                          {item.size && <p className="text-[#999] text-[10px]">Size: {item.size}</p>}
                          <p className="text-[#999] text-[10px]">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-brand-text shrink-0">
                          {(item.price * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="border-t border-brand-border pt-3 flex justify-between">
                  <span className="font-medium text-brand-text">Total</span>
                  <span className="font-medium text-brand-text">
                    {formatAmount(selected.subtotal ?? 0, selected.currency ?? "NGN")}
                  </span>
                </div>

                {/* Shipping address */}
                {selected.shippingAddress && (
                  <div className="border-t border-brand-border pt-3">
                    <p className="text-[10px] uppercase tracking-[0.15em] text-[#999] mb-2">
                      Ship to
                    </p>
                    <address className="not-italic text-[12px] text-brand-text space-y-0.5">
                      {selected.shippingAddress.line1 && <p>{selected.shippingAddress.line1}</p>}
                      {selected.shippingAddress.line2 && <p>{selected.shippingAddress.line2}</p>}
                      {selected.shippingAddress.city && (
                        <p>
                          {selected.shippingAddress.city}
                          {selected.shippingAddress.state ? `, ${selected.shippingAddress.state}` : ""}
                          {selected.shippingAddress.postalCode ? ` ${selected.shippingAddress.postalCode}` : ""}
                        </p>
                      )}
                      {selected.shippingAddress.country && <p>{selected.shippingAddress.country}</p>}
                    </address>
                  </div>
                )}

                {/* Shipping method */}
                {selected.shippingMethod && (
                  <div className="border-t border-brand-border pt-3">
                    <p className="text-[10px] uppercase tracking-[0.15em] text-[#999] mb-2">Shipping Method</p>
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="text-brand-text font-medium">{selected.shippingMethod.name}</span>
                      <span className="text-[#666]">{formatAmount(selected.shippingMethod.price, selected.currency ?? "NGN")}</span>
                    </div>
                    {selected.shippingMethod.estimatedDays && (
                      <p className="text-[11px] text-[#bbb] mt-0.5 uppercase tracking-wide">{selected.shippingMethod.estimatedDays}</p>
                    )}
                  </div>
                )}

                {/* Customer note */}
                {selected.note && (
                  <div className="border-t border-brand-border pt-3">
                    <p className="text-[10px] uppercase tracking-[0.15em] text-brand-accent mb-2">Note from Customer</p>
                    <p className="text-[12px] text-[#666] italic leading-relaxed">&ldquo;{selected.note}&rdquo;</p>
                  </div>
                )}

                {/* Bank transfer verification reminder */}
                {selected.status === "awaiting_payment" && selected.paymentMethod === "bank_transfer" && (
                  <div className="border-t border-amber-100 pt-3">
                    <div className="bg-amber-50 border border-amber-200 px-3 py-2.5 flex gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-amber-600 shrink-0 mt-0.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                      </svg>
                      <p className="text-[11px] text-amber-800 leading-relaxed">
                        Verify this transfer in your bank portal, then set status to <strong>Processing</strong> below.
                      </p>
                    </div>
                  </div>
                )}

                {/* Status update */}
                <div className="border-t border-brand-border pt-3">
                  <p className="text-[10px] uppercase tracking-[0.15em] text-[#999] mb-2">Update Status</p>
                  {(() => {
                    const nextStatuses = ALLOWED_TRANSITIONS[selected.status] ?? [];
                    const noTransitions = nextStatuses.length === 0;
                    return (
                      <>
                        <div className="flex items-center gap-2">
                          <select
                            value=""
                            onChange={(e) => {
                              if (e.target.value) handleStatusUpdate(selected._id, selected.status, e.target.value);
                            }}
                            disabled={updatingStatus || noTransitions}
                            className="flex-1 border border-brand-border rounded px-3 py-2 text-sm focus:outline-none focus:border-brand-accent transition-colors disabled:opacity-50 bg-white"
                          >
                            <option value="" disabled>
                              {noTransitions ? "No further transitions" : "Move to…"}
                            </option>
                            {nextStatuses.map((value) => (
                              <option key={value} value={value}>
                                {STATUS_LABELS[value]?.label ?? value}
                              </option>
                            ))}
                          </select>
                          {updatingStatus && (
                            <svg className="animate-spin w-4 h-4 text-brand-accent shrink-0" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                            </svg>
                          )}
                        </div>
                        {statusError && (
                          <p className="text-red-500 text-[11px] mt-1.5">{statusError}</p>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          ) : (
            <div className="border border-dashed border-brand-border flex items-center justify-center h-48 text-[#bbb] text-sm hidden lg:flex">
              Select an order to view details
            </div>
          )}
        </div>
      )}
    </div>
  );
}

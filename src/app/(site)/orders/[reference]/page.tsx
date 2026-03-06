"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import { useLocale } from "@/components/LocaleProvider";

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  size?: string;
  unit?: string;
}

interface Order {
  _id: string;
  _createdAt: string;
  reference: string;
  status: string;
  paymentMethod?: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  subtotal: number;
  currency: string;
  shippingAddress?: {
    line1?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  shippingMethod?: {
    name: string;
    price: number;
    estimatedDays?: string;
  };
  paidAt?: string;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  success: { label: "Paid", color: "bg-green-50 text-green-700 border-green-200" },
  pending: { label: "Pending", color: "bg-amber-50 text-amber-700 border-amber-200" },
  awaiting_payment: { label: "Awaiting Payment", color: "bg-orange-50 text-orange-700 border-orange-200" },
  failed: { label: "Failed", color: "bg-red-50 text-red-600 border-red-200" },
  processing: { label: "Processing", color: "bg-blue-50 text-blue-700 border-blue-200" },
  shipped: { label: "Shipped", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  delivered: { label: "Delivered", color: "bg-green-50 text-green-700 border-green-200" },
};

const STATUS_STEPS = [
  { key: "pending", label: "Order Placed" },
  { key: "processing", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
];

function StatusTimeline({ status }: { status: string }) {
  const effectiveStatus = status === "success" || status === "awaiting_payment" ? "pending" : status;
  const currentIdx = STATUS_STEPS.findIndex((s) => s.key === effectiveStatus);

  if (status === "failed") {
    return (
      <div className="flex items-center justify-center gap-2 py-4">
        <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        <span className="text-red-600 text-sm">Payment failed — please try again or contact support.</span>
      </div>
    );
  }

  if (currentIdx < 0) return null;

  return (
    <div className="pt-2 pb-1">
      <div className="flex items-center justify-between">
        {STATUS_STEPS.map((step, idx) => {
          const isComplete = idx <= currentIdx;
          const isCurrent = idx === currentIdx;
          return (
            <div key={step.key} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-colors ${
                  isComplete
                    ? "border-[#C08A6F] bg-[#C08A6F]"
                    : "border-[#E8E2DB] bg-white"
                }`}>
                  {isComplete ? (
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-[#E8E2DB]" />
                  )}
                </div>
                <span className={`text-[9px] uppercase tracking-wider mt-1.5 whitespace-nowrap ${
                  isCurrent ? "text-[#C08A6F] font-medium" : isComplete ? "text-[#1A1A1A]" : "text-[#CCC]"
                }`}>
                  {step.label}
                </span>
              </div>
              {idx < STATUS_STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 mt-[-16px] ${idx < currentIdx ? "bg-[#C08A6F]" : "bg-[#E8E2DB]"}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function OrderLookupPage({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = use(params);
  const { t } = useLocale();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const fetchOrder = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      // cache: "no-store" ensures we always get the latest status from the server
      const res = await fetch(`/api/orders/${encodeURIComponent(reference)}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
        setNotFound(false);
      } else {
        setNotFound(true);
      }
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reference]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  const fmtPrice = (n: number, cur: string) =>
    `${cur} ${n.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

  if (loading) {
    return (
      <>
        <PageHero title={t("orders.orderStatus")} subtitle={t("orders.lookingUp")} description={t("orders.findingOrder")} />
        <section className="bg-brand-bg py-16"><div className="max-w-2xl mx-auto px-6 text-center text-brand-muted text-sm">{t("common.loading")}</div></section>
      </>
    );
  }

  if (notFound || !order) {
    return (
      <>
        <PageHero title={t("orders.notFoundTitle")} subtitle={t("orders.tracking")} description={t("orders.notFoundDesc")} />
        <section className="bg-brand-bg py-16">
          <div className="max-w-2xl mx-auto px-6 text-center">
            <p className="text-brand-muted text-sm mb-6">{t("orders.notFoundHint")}</p>
            <Link href="/shop" className="inline-block bg-brand-accent text-white uppercase text-[10px] tracking-[0.2em] px-8 py-3 hover:bg-brand-accent/90 transition-all">
              {t("common.continueShopping")}
            </Link>
          </div>
        </section>
      </>
    );
  }

  const status = STATUS_LABELS[order.status] || { label: order.status, color: "bg-gray-50 text-gray-700 border-gray-200" };
  const grandTotal = order.subtotal + (order.shippingMethod?.price || 0);

  return (
    <>
      <PageHero title={t("orders.orderStatus")} subtitle={t("orders.tracking")} description={`${t("orders.reference")} ${order.reference}`} />

      <section className="bg-brand-bg py-12 md:py-20">
        <div className="max-w-2xl mx-auto px-6 md:px-12">
          <div className="bg-white border border-[#E8E2DB] p-6 md:p-8 space-y-6">
            {/* Status */}
            <div className="flex items-center justify-between">
              <span className={`text-[10px] uppercase tracking-wider px-3 py-1 border rounded-sm ${status.color}`}>
                {status.label}
              </span>
              <p className="text-[#999] text-xs">{formatDate(order._createdAt)}</p>
            </div>

            {/* Timeline */}
            <StatusTimeline status={order.status} />

            {/* Customer */}
            <div className="border-t border-[#E8E2DB] pt-4">
              <p className="text-[10px] uppercase tracking-[0.15em] text-[#999] mb-2">{t("orders.customer")}</p>
              <p className="text-[#1A1A1A] text-sm">{order.customerName}</p>
              <p className="text-[#999] text-xs">{order.customerEmail}</p>
            </div>

            {/* Items */}
            <div className="border-t border-[#E8E2DB] pt-4">
              <p className="text-[10px] uppercase tracking-[0.15em] text-[#999] mb-3">{t("orders.items")}</p>
              <div className="space-y-3">
                {(order.items || []).map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <div>
                      <p className="text-[#1A1A1A]">{item.name} {item.size ? `(${item.size})` : ""}</p>
                      <p className="text-[#999] text-xs">Qty: {item.quantity}{item.unit ? ` ${item.unit}${item.quantity !== 1 ? "s" : ""}` : ""}</p>
                    </div>
                    <p className="text-[#1A1A1A]">{fmtPrice(item.price * item.quantity, order.currency)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping */}
            {order.shippingMethod && (
              <div className="border-t border-[#E8E2DB] pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-[#666]">Shipping ({order.shippingMethod.name})</span>
                  <span className="text-[#1A1A1A]">{fmtPrice(order.shippingMethod.price, order.currency)}</span>
                </div>
              </div>
            )}

            {/* Total */}
            <div className="border-t border-[#E8E2DB] pt-4 flex justify-between text-base font-medium text-[#1A1A1A]">
              <span>{t("orders.total")}</span>
              <span>{fmtPrice(grandTotal, order.currency)}</span>
            </div>

            {/* Shipping address */}
            {order.shippingAddress && (
              <div className="border-t border-[#E8E2DB] pt-4">
                <p className="text-[10px] uppercase tracking-[0.15em] text-[#999] mb-2">{t("orders.shippingAddress")}</p>
                <address className="not-italic text-sm text-[#1A1A1A] space-y-0.5">
                  {order.shippingAddress.line1 && <p>{order.shippingAddress.line1}</p>}
                  {order.shippingAddress.city && (
                    <p>{order.shippingAddress.city}{order.shippingAddress.state ? `, ${order.shippingAddress.state}` : ""} {order.shippingAddress.postalCode || ""}</p>
                  )}
                  {order.shippingAddress.country && <p>{order.shippingAddress.country}</p>}
                </address>
              </div>
            )}
          </div>

          <div className="text-center mt-8 flex justify-center gap-6 flex-wrap">
            <button
              type="button"
              onClick={() => fetchOrder(true)}
              disabled={refreshing}
              className="text-[#666] uppercase text-[10px] tracking-[0.15em] hover:text-[#C08A6F] transition-colors border-b border-[#666]/30 pb-1 disabled:opacity-50 flex items-center gap-1"
            >
              {refreshing ? (
                <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
              )}
              Refresh Status
            </button>
            <Link href="/orders" className="text-[#666] uppercase text-[10px] tracking-[0.15em] hover:text-[#C08A6F] transition-colors border-b border-[#666]/30 pb-1">
              {t("orders.title")}
            </Link>
            <Link href="/shop" className="text-[#666] uppercase text-[10px] tracking-[0.15em] hover:text-[#C08A6F] transition-colors border-b border-[#666]/30 pb-1">
              {t("common.continueShopping")}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import PageHero from "@/components/PageHero";

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  size?: string;
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

export default function OrderLookupPage({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${encodeURIComponent(reference)}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data);
        } else {
          setNotFound(true);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [reference]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  const fmtPrice = (n: number, cur: string) =>
    `${cur} ${n.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

  if (loading) {
    return (
      <>
        <PageHero title="Order Status" subtitle="Looking Up" description="Finding your order..." />
        <section className="bg-brand-bg py-16"><div className="max-w-2xl mx-auto px-6 text-center text-brand-muted text-sm">Loading...</div></section>
      </>
    );
  }

  if (notFound || !order) {
    return (
      <>
        <PageHero title="Order Not Found" subtitle="Tracking" description="We couldn't find an order with that reference." />
        <section className="bg-brand-bg py-16">
          <div className="max-w-2xl mx-auto px-6 text-center">
            <p className="text-brand-muted text-sm mb-6">The reference may be incorrect or the order may have been removed.</p>
            <Link href="/shop" className="inline-block bg-brand-accent text-white uppercase text-[10px] tracking-[0.2em] px-8 py-3 hover:bg-brand-accent/90 transition-all">
              Continue Shopping
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
      <PageHero title="Order Status" subtitle="Tracking" description={`Reference: ${order.reference}`} />

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

            {/* Customer */}
            <div className="border-t border-[#E8E2DB] pt-4">
              <p className="text-[10px] uppercase tracking-[0.15em] text-[#999] mb-2">Customer</p>
              <p className="text-[#1A1A1A] text-sm">{order.customerName}</p>
              <p className="text-[#999] text-xs">{order.customerEmail}</p>
            </div>

            {/* Items */}
            <div className="border-t border-[#E8E2DB] pt-4">
              <p className="text-[10px] uppercase tracking-[0.15em] text-[#999] mb-3">Items</p>
              <div className="space-y-3">
                {(order.items || []).map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <div>
                      <p className="text-[#1A1A1A]">{item.name} {item.size ? `(${item.size})` : ""}</p>
                      <p className="text-[#999] text-xs">Qty: {item.quantity}</p>
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
              <span>Total</span>
              <span>{fmtPrice(grandTotal, order.currency)}</span>
            </div>

            {/* Shipping address */}
            {order.shippingAddress && (
              <div className="border-t border-[#E8E2DB] pt-4">
                <p className="text-[10px] uppercase tracking-[0.15em] text-[#999] mb-2">Shipping Address</p>
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

          <div className="text-center mt-8">
            <Link href="/shop" className="text-[#666] uppercase text-[10px] tracking-[0.15em] hover:text-[#C08A6F] transition-colors border-b border-[#666]/30 pb-1">
              Continue Shopping
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import { useAuth } from "@/components/AuthProvider";
import { useSiteSettings } from "@/components/SiteSettingsProvider";
import { useLocale } from "@/components/LocaleProvider";
import { auth } from "@/lib/firebase";

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  _id: string;
  _createdAt: string;
  reference: string;
  status: string;
  paymentMethod?: string;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  currency: string;
  shippingMethod?: { name: string; price: number };
}

const STATUS_STYLES: Record<string, { label: string; color: string }> = {
  success: { label: "Paid", color: "bg-green-50 text-green-700" },
  pending: { label: "Pending", color: "bg-amber-50 text-amber-700" },
  awaiting_payment: { label: "Awaiting Payment", color: "bg-orange-50 text-orange-700" },
  failed: { label: "Failed", color: "bg-red-50 text-red-600" },
  processing: { label: "Processing", color: "bg-blue-50 text-blue-700" },
  shipped: { label: "Shipped", color: "bg-indigo-50 text-indigo-700" },
  delivered: { label: "Delivered", color: "bg-green-50 text-green-700" },
  refunded: { label: "Refunded", color: "bg-purple-50 text-purple-700" },
  disputed: { label: "Disputed", color: "bg-orange-50 text-orange-800" },
};

const STATUS_STEPS = ["pending", "processing", "shipped", "delivered"];

function StatusTimeline({ status }: { status: string }) {
  // Map status to step index
  const effectiveStatus = status === "success" || status === "awaiting_payment" ? "pending" : status;
  const currentIdx = STATUS_STEPS.indexOf(effectiveStatus);
  if (currentIdx < 0 && status !== "failed") return null;

  if (status === "failed") {
    return (
      <div className="flex items-center gap-2 mt-3">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
        <span className="text-red-600 text-xs">Payment failed</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 mt-3">
      {STATUS_STEPS.map((step, idx) => {
        const isComplete = idx <= currentIdx;
        const isCurrent = idx === currentIdx;
        return (
          <div key={step} className="flex items-center gap-1">
            <div className={`w-2.5 h-2.5 rounded-full transition-colors ${
              isComplete ? (isCurrent ? "bg-[#C08A6F]" : "bg-[#C08A6F]/60") : "bg-gray-200"
            }`} />
            <span className={`text-[9px] uppercase tracking-widest ${
              isComplete ? "text-[#1A1A1A]" : "text-gray-300"
            }`}>
              {step}
            </span>
            {idx < STATUS_STEPS.length - 1 && (
              <div className={`w-6 h-px ${idx < currentIdx ? "bg-[#C08A6F]/40" : "bg-gray-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function MyOrdersPage() {
  const { user, signInWithGoogle } = useAuth();
  const { formatPrice } = useSiteSettings();
  const { t } = useLocale();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [lookupRef, setLookupRef] = useState("");

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    async function fetchOrders() {
      try {
        const token = await auth.currentUser?.getIdToken();
        if (!token) return;
        const res = await fetch("/api/orders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          setOrders(await res.json());
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [user]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <>
      <PageHero
        title={t("orders.title")}
        subtitle={t("orders.subtitle")}
        description={t("orders.description")}
      />

      <section className="bg-brand-bg py-16 md:py-20">
        <div className="max-w-3xl mx-auto px-6">
          {/* Guest lookup */}
          {!user && !loading && (
            <div className="text-center space-y-6 mb-12">
              <p className="text-[#666] text-sm">{t("orders.guestPrompt")}</p>
              <button
                onClick={signInWithGoogle}
                className="bg-[#232323] text-white uppercase text-[10px] tracking-[0.2em] px-8 py-3 hover:bg-[#C08A6F] transition-colors"
              >
                Sign In with Google
              </button>
              <div className="flex items-center gap-4 max-w-sm mx-auto pt-4">
                <div className="flex-1 h-px bg-[#E8E2DB]" />
                <span className="text-[#999] text-[10px] uppercase tracking-widest">{t("common.or")}</span>
                <div className="flex-1 h-px bg-[#E8E2DB]" />
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (lookupRef.trim()) {
                    window.location.href = `/orders/${encodeURIComponent(lookupRef.trim())}`;
                  }
                }}
                className="flex items-center gap-3 max-w-sm mx-auto"
              >
                <input
                  value={lookupRef}
                  onChange={(e) => setLookupRef(e.target.value)}
                  placeholder={t("orders.lookupPlaceholder")}
                  className="flex-1 border border-[#E8E2DB] px-4 py-2.5 text-sm focus:outline-none focus:border-[#C08A6F] bg-white"
                />
                <button type="submit" className="bg-[#C08A6F] text-white uppercase text-[10px] tracking-[0.2em] px-6 py-2.5">
                  {t("orders.lookupButton")}
                </button>
              </form>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="text-center text-[#999] text-sm py-8">{t("orders.loadingOrders")}</div>
          )}

          {/* Authenticated user orders */}
          {user && !loading && orders.length === 0 && (
            <div className="text-center py-12">
              <p className="text-[#666] text-sm mb-6">{t("orders.emptyMessage")}</p>
              <Link href="/shop" className="bg-brand-accent text-white uppercase text-[10px] tracking-[0.2em] px-8 py-3 hover:bg-brand-accent/90 transition-all">
                {t("orders.startShopping")}
              </Link>
            </div>
          )}

          {user && !loading && orders.length > 0 && (
            <div className="space-y-4">
              {orders.map((order) => {
                const st = STATUS_STYLES[order.status] || { label: order.status, color: "bg-gray-50 text-gray-600" };
                const grandTotal = order.subtotal + (order.shippingMethod?.price || 0);

                return (
                  <Link
                    key={order._id}
                    href={`/orders/${order.reference}`}
                    className="block bg-white border border-[#E8E2DB] p-5 hover:border-[#C08A6F]/40 transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <p className="font-medium text-sm text-[#1A1A1A] truncate">{order.reference}</p>
                          <span className={`text-[10px] uppercase tracking-widest px-2.5 py-0.5 rounded-full ${st.color}`}>
                            {st.label}
                          </span>
                        </div>
                        <p className="text-[#999] text-xs">
                          {formatDate(order._createdAt)} · {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                        </p>
                        <StatusTimeline status={order.status} />
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-medium text-sm text-[#1A1A1A]">{formatPrice(grandTotal)}</p>
                        <p className="text-brand-accent text-[10px] uppercase tracking-widest mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {t("orders.viewDetails")}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

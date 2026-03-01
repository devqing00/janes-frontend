"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "./CartProvider";

interface ShippingRate {
  _key?: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
}

interface BankAccount {
  bankName: string;
  accountName: string;
  accountNumber: string;
  sortCode?: string;
}

interface DeliveryForm {
  name: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

type DeliveryStep = "empty" | "editing" | "done";
type ShippingStep = "empty" | "selecting" | "done";
type PaymentMethodKey = "paystack" | "bank_transfer";

const fmtPrice = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2 });

const EMPTY_DELIVERY: DeliveryForm = {
  name: "", line1: "", line2: "", city: "", state: "", country: "", postalCode: "",
};

const inputCls =
  "w-full border border-[#E8E2DB] px-3.5 py-2.5 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#C08A6F] bg-white placeholder:text-[#c5bcb3] transition-colors";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] uppercase tracking-[0.18em] text-[#666] font-medium mb-2">{children}</p>
  );
}

function CheckBadge() {
  return (
    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#C08A6F] text-white flex-shrink-0">
      <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-[11px] text-[#999]">
      <span className="w-1 h-1 rounded-full bg-[#C08A6F] flex-shrink-0" />
      {children}
    </div>
  );
}

const STORAGE_KEY = "janes_checkout_saved";

interface SavedCheckout {
  email: string;
  delivery: DeliveryForm;
}

const PAYMENT_METHODS: Record<PaymentMethodKey, { label: string; desc: string; icon: React.ReactNode }> = {
  paystack: {
    label: "Pay with Paystack",
    desc: "Secure card & bank payment",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
        <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M2 10h20" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  bank_transfer: {
    label: "Direct Bank Transfer",
    desc: "Transfer to our bank account",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
        <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v8m4-8v8m4-8v8m4-8v8m4-8v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
};

export default function CheckoutClient() {
  const { items, total } = useCart();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [deliveryStep, setDeliveryStep] = useState<DeliveryStep>("empty");
  const [delivery, setDelivery] = useState<DeliveryForm>(EMPTY_DELIVERY);
  const [draft, setDraft] = useState<DeliveryForm>(EMPTY_DELIVERY);
  const [draftErrors, setDraftErrors] = useState<Partial<DeliveryForm>>({});
  const [note, setNote] = useState("");
  const [shippingStep, setShippingStep] = useState<ShippingStep>("empty");
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
  const [ratesLoading, setRatesLoading] = useState(false);
  const [selectedRate, setSelectedRate] = useState<ShippingRate | null>(null);

  // Payment methods
  const [activeMethods, setActiveMethods] = useState<PaymentMethodKey[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodKey | null>(null);
  const [methodsLoading, setMethodsLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Autofill
  const [savedCheckout, setSavedCheckout] = useState<SavedCheckout | null>(null);
  const [showAutofill, setShowAutofill] = useState(false);

  const grandTotal = total + (selectedRate?.price ?? 0);
  const hasMethod = selectedMethod !== null;
  const canPay = email.includes("@") && deliveryStep === "done" && shippingStep === "done" && hasMethod && !submitting;

  // Load saved checkout from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: SavedCheckout = JSON.parse(raw);
        if (parsed.email && parsed.delivery?.name) {
          setSavedCheckout(parsed);
          setShowAutofill(true);
        }
      }
    } catch {
      // ignore corrupt storage
    }
  }, []);

  const applyAutofill = () => {
    if (!savedCheckout) return;
    setEmail(savedCheckout.email);
    setDelivery(savedCheckout.delivery);
    setDraft(savedCheckout.delivery);
    setDeliveryStep("done");
    setShowAutofill(false);
  };

  const dismissAutofill = () => setShowAutofill(false);

  // Keep stored email in sync when it changes after delivery is already saved
  useEffect(() => {
    if (deliveryStep !== "done" || !email.includes("@")) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: SavedCheckout = JSON.parse(raw);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...parsed, email }));
      }
    } catch { /* ignore */ }
  }, [email, deliveryStep]);

  // Fetch available payment methods
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/payment-methods");
        if (res.ok) {
          const data = await res.json();
          const methods = (data.methods ?? ["paystack"]) as PaymentMethodKey[];
          setActiveMethods(methods);
          setBankAccounts(data.bankAccounts ?? []);
          if (methods.length === 1) setSelectedMethod(methods[0]);
        }
      } catch {
        setActiveMethods(["paystack"]);
        setSelectedMethod("paystack");
      } finally {
        setMethodsLoading(false);
      }
    })();
  }, []);

  const fetchRates = useCallback(async () => {
    if (shippingRates.length > 0) return;
    setRatesLoading(true);
    try {
      const res = await fetch("/api/shipping-rates");
      setShippingRates(await res.json());
    } catch {
      setShippingRates([]);
    } finally {
      setRatesLoading(false);
    }
  }, [shippingRates.length]);

  useEffect(() => { fetchRates(); }, [fetchRates]);

  const openDeliveryForm = () => {
    setDraft(deliveryStep === "done" ? delivery : EMPTY_DELIVERY);
    setDraftErrors({});
    setDeliveryStep("editing");
  };

  const validateDelivery = (d: DeliveryForm) => {
    const e: Partial<DeliveryForm> = {};
    if (!d.name.trim()) e.name = "Required";
    if (!d.line1.trim()) e.line1 = "Required";
    if (!d.city.trim()) e.city = "Required";
    if (!d.country.trim()) e.country = "Required";
    return e;
  };

  const saveDelivery = () => {
    const errs = validateDelivery(draft);
    if (Object.keys(errs).length) { setDraftErrors(errs); return; }
    setDelivery(draft);
    setDeliveryStep("done");
    // Persist to localStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ email, delivery: draft }));
    } catch { /* quota exceeded or private mode — silently skip */ }
  };

  const cancelDelivery = () =>
    setDeliveryStep(deliveryStep === "editing" && delivery.name ? "done" : "empty");

  const draftChange = (field: keyof DeliveryForm, value: string) => {
    setDraft((p) => ({ ...p, [field]: value }));
    if (draftErrors[field]) setDraftErrors((p) => ({ ...p, [field]: undefined }));
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canPay) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name: delivery.name,
          items,
          paymentMethod: selectedMethod,
          shippingAddress: {
            line1: delivery.line1, line2: delivery.line2,
            city: delivery.city, state: delivery.state,
            country: delivery.country, postalCode: delivery.postalCode,
          },
          shippingMethod: selectedRate
            ? { name: selectedRate.name, price: selectedRate.price, estimatedDays: selectedRate.estimatedDays }
            : undefined,
          note: note.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        setSubmitError(err.error ?? "Something went wrong. Please try again.");
        return;
      }
      const data = await res.json();

      // Clear saved checkout after a successful submission
      try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }

      if (data.paymentMethod === "bank_transfer") {
        router.push(`/checkout/callback?method=bank_transfer&reference=${encodeURIComponent(data.reference)}&total=${data.grandTotal}`);
      } else {
        window.location.href = data.authorizationUrl;
      }
    } catch {
      setSubmitError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!items.length) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
        <p className="font-serif text-2xl text-[#1A1A1A] mb-3">Your bag is empty</p>
        <Link href="/shop" className="text-[10px] uppercase tracking-[0.2em] text-[#C08A6F] hover:underline mt-2">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16 pt-24 md:pt-28 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10 lg:gap-14 items-start">

      {/* LEFT: Checkout steps */}
      <form onSubmit={handlePay} className="space-y-7 order-2 lg:order-1">
        <h1 className="font-serif text-2xl text-[#1A1A1A]">Checkout</h1>

        {/* Autofill banner */}
        {showAutofill && savedCheckout && (
          <div className="border border-[#C08A6F] bg-[#fdf9f7] px-4 py-3.5 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <span className="mt-0.5 flex-shrink-0">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-[#C08A6F]">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v4.5a.75.75 0 001.5 0v-4.5zm-.75 7a.75.75 0 110-1.5.75.75 0 010 1.5z" clipRule="evenodd" />
                </svg>
              </span>
              <div className="min-w-0">
                <p className="text-[12px] font-medium text-[#1A1A1A]">
                  Use saved details for{" "}
                  <span className="text-[#C08A6F]">{savedCheckout.delivery.name}</span>?
                </p>
                <p className="text-[11px] text-[#999] mt-0.5 truncate">
                  {savedCheckout.email} &middot; {savedCheckout.delivery.city}{savedCheckout.delivery.country ? `, ${savedCheckout.delivery.country}` : ""}
                </p>
                <button
                  type="button"
                  onClick={applyAutofill}
                  className="mt-2 text-[10px] uppercase tracking-[0.15em] text-white bg-[#C08A6F] hover:bg-[#a8755c] px-4 py-1.5 transition-colors"
                >
                  Autofill Details
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={dismissAutofill}
              aria-label="Dismiss"
              className="text-[#bbb] hover:text-[#1A1A1A] transition-colors flex-shrink-0 mt-0.5"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          </div>
        )}

        {/* Email */}
        <div>
          <SectionLabel>Email Address</SectionLabel>
          <input
            type="email" required value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jane@example.com"
            className={inputCls}
          />
        </div>

        {/* Delivery Details */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[15px] font-semibold text-[#1A1A1A]">Delivery Details</p>
            {deliveryStep === "done" && (
              <button type="button" onClick={openDeliveryForm}
                className="text-[10px] uppercase tracking-[0.15em] text-[#C08A6F] hover:underline">
                Edit
              </button>
            )}
          </div>

          {deliveryStep === "empty" && (
            <div className="border border-[#E8E2DB] bg-[#FAFAF9] py-6 flex items-center justify-center">
              <button type="button" onClick={openDeliveryForm}
                className="text-[13px] font-semibold text-[#1A1A1A] border border-[#1A1A1A] px-8 py-2.5 hover:bg-[#1A1A1A] hover:text-white transition-colors">
                Add delivery details
              </button>
            </div>
          )}

          {deliveryStep === "editing" && (
            <div className="border border-[#C08A6F] bg-white p-5 space-y-3">
              <div>
                <label className="block text-[11px] text-[#666] mb-1">Full Name <span className="text-[#C08A6F]">*</span></label>
                <input value={draft.name} onChange={(e) => draftChange("name", e.target.value)} placeholder="Jane Smith"
                  className={`${inputCls} ${draftErrors.name ? "border-red-400" : ""}`} />
                {draftErrors.name && <p className="text-red-500 text-[10px] mt-0.5">{draftErrors.name}</p>}
              </div>
              <div>
                <label className="block text-[11px] text-[#666] mb-1">Address Line 1 <span className="text-[#C08A6F]">*</span></label>
                <input value={draft.line1} onChange={(e) => draftChange("line1", e.target.value)} placeholder="24 Victoria Island Crescent"
                  className={`${inputCls} ${draftErrors.line1 ? "border-red-400" : ""}`} />
                {draftErrors.line1 && <p className="text-red-500 text-[10px] mt-0.5">{draftErrors.line1}</p>}
              </div>
              <div>
                <label className="block text-[11px] text-[#666] mb-1">Address Line 2 <span className="text-[#999]">(optional)</span></label>
                <input value={draft.line2} onChange={(e) => draftChange("line2", e.target.value)} placeholder="Apartment, floor, suite…" className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-[#666] mb-1">City <span className="text-[#C08A6F]">*</span></label>
                  <input value={draft.city} onChange={(e) => draftChange("city", e.target.value)} placeholder="Lagos"
                    className={`${inputCls} ${draftErrors.city ? "border-red-400" : ""}`} />
                  {draftErrors.city && <p className="text-red-500 text-[10px] mt-0.5">{draftErrors.city}</p>}
                </div>
                <div>
                  <label className="block text-[11px] text-[#666] mb-1">State</label>
                  <input value={draft.state} onChange={(e) => draftChange("state", e.target.value)} placeholder="Lagos State" className={inputCls} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-[#666] mb-1">Country <span className="text-[#C08A6F]">*</span></label>
                  <input value={draft.country} onChange={(e) => draftChange("country", e.target.value)} placeholder="Nigeria"
                    className={`${inputCls} ${draftErrors.country ? "border-red-400" : ""}`} />
                  {draftErrors.country && <p className="text-red-500 text-[10px] mt-0.5">{draftErrors.country}</p>}
                </div>
                <div>
                  <label className="block text-[11px] text-[#666] mb-1">Postal Code</label>
                  <input value={draft.postalCode} onChange={(e) => draftChange("postalCode", e.target.value)} placeholder="100001" className={inputCls} />
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={saveDelivery}
                  className="flex-1 bg-[#1A1A1A] text-white text-[11px] uppercase tracking-[0.15em] py-3 hover:bg-[#C08A6F] transition-colors">
                  Save Details
                </button>
                <button type="button" onClick={cancelDelivery}
                  className="px-5 text-[11px] uppercase tracking-[0.15em] text-[#666] border border-[#E8E2DB] hover:text-[#1A1A1A] hover:border-[#1A1A1A] transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {deliveryStep === "done" && (
            <div className="border border-[#E8E2DB] bg-white px-4 py-3.5 flex items-start gap-3">
              <CheckBadge />
              <div className="text-sm text-[#1A1A1A] leading-relaxed">
                <p className="font-medium">{delivery.name}</p>
                <p className="text-[#666] text-[12px]">{delivery.line1}{delivery.line2 ? `, ${delivery.line2}` : ""}</p>
                <p className="text-[#666] text-[12px]">{[delivery.city, delivery.state, delivery.postalCode].filter(Boolean).join(", ")}</p>
                <p className="text-[#666] text-[12px]">{delivery.country}</p>
              </div>
            </div>
          )}
        </div>

        {/* Order note */}
        <div>
          <label className="block text-[13px] font-medium text-[#C08A6F] mb-2 tracking-wide">
            Order Note
          </label>
          <textarea
            value={note} onChange={(e) => setNote(e.target.value)} rows={3}
            placeholder="Special requests, sizing notes, or gift messages"
            className={`${inputCls} resize-none`}
          />
        </div>

        {/* Shipping Rate */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[13px] font-bold uppercase tracking-[0.12em] text-[#1A1A1A]">
              Shipping Method
            </p>
            {shippingStep === "done" && (
              <button type="button" onClick={() => setShippingStep("selecting")}
                className="text-[10px] uppercase tracking-[0.15em] text-[#C08A6F] hover:underline">
                Change
              </button>
            )}
          </div>

          {shippingStep === "empty" && (
            <div className="border border-[#E8E2DB] bg-[#FAFAF9] p-5 space-y-3">
              <p className="text-center text-[12px] text-[#999]">Choose your preferred delivery option</p>
              <div className="flex justify-center">
                <button type="button" onClick={() => setShippingStep("selecting")}
                  className="text-[11px] font-bold uppercase tracking-[0.2em] border border-[#1A1A1A] px-8 py-3 hover:bg-[#1A1A1A] hover:text-white transition-colors">
                  Select Shipping Method
                </button>
              </div>
            </div>
          )}

          {shippingStep === "selecting" && (
            <div className="border border-[#C08A6F] bg-white divide-y divide-[#F0EBE5]">
              {ratesLoading ? (
                <div className="p-6 flex items-center justify-center gap-2 text-[#999] text-sm">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Loading rates&hellip;
                </div>
              ) : shippingRates.length === 0 ? (
                <div className="p-6 text-center text-sm text-[#999]">No rates configured. Contact us.</div>
              ) : (
                shippingRates.map((rate, i) => (
                  <button key={rate._key ?? i} type="button"
                    onClick={() => { setSelectedRate(rate); setShippingStep("done"); }}
                    className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 hover:bg-[#FDF8F5] transition-colors group">
                    <div>
                      <p className="text-sm font-medium text-[#1A1A1A] group-hover:text-[#C08A6F] transition-colors">{rate.name}</p>
                      <p className="text-[11px] text-[#999] mt-0.5">{rate.description}</p>
                      {rate.estimatedDays && (
                        <p className="text-[10px] text-[#bbb] mt-0.5 uppercase tracking-wider">{rate.estimatedDays}</p>
                      )}
                    </div>
                    <p className="text-sm font-medium text-[#1A1A1A] flex-shrink-0">{fmtPrice(rate.price)}</p>
                  </button>
                ))
              )}
            </div>
          )}

          {shippingStep === "done" && selectedRate && (
            <div className="border border-[#E8E2DB] bg-white px-4 py-3.5 flex items-center gap-3">
              <CheckBadge />
              <div className="flex-1">
                <p className="text-sm font-medium text-[#1A1A1A]">{selectedRate.name}</p>
                <p className="text-[11px] text-[#999]">
                  {selectedRate.description}{selectedRate.estimatedDays ? ` · ${selectedRate.estimatedDays}` : ""}
                </p>
              </div>
              <p className="text-sm font-medium text-[#1A1A1A]">{fmtPrice(selectedRate.price)}</p>
            </div>
          )}
        </div>

        {/* Payment Method */}
        <div>
          <SectionLabel>Payment Method</SectionLabel>
          {methodsLoading ? (
            <div className="border border-[#E8E2DB] bg-[#FAFAF9] p-6 flex items-center justify-center gap-2 text-[#999] text-sm">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Loading&hellip;
            </div>
          ) : activeMethods.length <= 1 ? (
            /* Single method — auto-selected, just show info  */
            selectedMethod && (
              <div className="border border-[#E8E2DB] bg-white px-4 py-3.5 flex items-center gap-3">
                <CheckBadge />
                <div className="flex items-center gap-2 text-[#1A1A1A]">
                  {PAYMENT_METHODS[selectedMethod].icon}
                  <div>
                    <p className="text-sm font-medium">{PAYMENT_METHODS[selectedMethod].label}</p>
                    <p className="text-[11px] text-[#999]">{PAYMENT_METHODS[selectedMethod].desc}</p>
                  </div>
                </div>
              </div>
            )
          ) : (
            <div className="space-y-2">
              {activeMethods.map((key) => {
                const m = PAYMENT_METHODS[key];
                if (!m) return null;
                const sel = selectedMethod === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedMethod(key)}
                    className={`w-full text-left px-4 py-3.5 flex items-center gap-3 border transition-colors ${
                      sel
                        ? "border-[#C08A6F] bg-[#fdf9f7]"
                        : "border-[#E8E2DB] bg-white hover:border-[#C08A6F]"
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        sel ? "border-[#C08A6F]" : "border-[#ccc]"
                      }`}
                    >
                      {sel && <span className="w-2 h-2 rounded-full bg-[#C08A6F]" />}
                    </span>
                    <span className="text-[#666]">{m.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-[#1A1A1A]">{m.label}</p>
                      <p className="text-[11px] text-[#999]">{m.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Bank details preview when bank_transfer selected */}
          {selectedMethod === "bank_transfer" && bankAccounts.length > 0 && (
            <div className="mt-3 border border-[#E8E2DB] bg-[#FAFAF9] p-4 space-y-3">
              <p className="text-[10px] uppercase tracking-[0.15em] text-[#999]">Transfer to any of the following accounts</p>
              {bankAccounts.map((acct, i) => (
                <div key={i} className="text-sm text-[#1A1A1A] space-y-0.5">
                  <p className="font-medium">{acct.bankName}</p>
                  <p className="text-[#666] text-[12px]">{acct.accountName}</p>
                  <p className="text-[#666] text-[12px] font-mono tracking-wide">{acct.accountNumber}</p>
                  {acct.sortCode && <p className="text-[#999] text-[11px]">Sort code: {acct.sortCode}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        {submitError && <p className="text-red-500 text-sm">{submitError}</p>}

        <button type="submit" disabled={!canPay}
          className="w-full bg-[#C08A6F] text-white uppercase text-[11px] tracking-[0.2em] py-4 hover:bg-[#a8755c] transition-colors duration-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          {submitting ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              {selectedMethod === "bank_transfer" ? "Placing Order\u2026" : "Redirecting to Paystack\u2026"}
            </>
          ) : canPay ? (
            selectedMethod === "bank_transfer"
              ? `Place Order \u2013 ${fmtPrice(grandTotal)}`
              : `Pay ${fmtPrice(grandTotal)} with Paystack`
          ) : (
            "Complete all steps to continue"
          )}
        </button>

        {!canPay && !submitting && (
          <div className="flex flex-col gap-1.5">
            {!email.includes("@") && <Hint>Enter your email address</Hint>}
            {deliveryStep !== "done" && <Hint>Add your delivery details</Hint>}
            {shippingStep !== "done" && <Hint>Select a shipping rate</Hint>}
            {!hasMethod && <Hint>Choose a payment method</Hint>}
          </div>
        )}

        <p className="text-[#bbb] text-[10px] text-center">
          {selectedMethod === "bank_transfer"
            ? "After placing your order you\u2019ll receive bank details to complete your transfer."
            : "You\u2019ll be redirected to Paystack to complete payment securely."}
        </p>
      </form>

      {/* RIGHT: Order summary */}
      <div className="order-1 lg:order-2 lg:sticky lg:top-28">
        <h2 className="text-[10px] uppercase tracking-[0.2em] text-[#666] mb-5">Order Summary</h2>
        <div className="space-y-4 mb-5">
          {items.map((item) => (
            <div key={item._id + (item.size ?? "")} className="flex gap-3.5">
              <div className="relative w-14 h-[72px] bg-[#F5F0EB] flex-shrink-0 overflow-hidden">
                {item.image ? (
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#ddd]">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159" />
                    </svg>
                  </div>
                )}
                {item.quantity > 1 && (
                  <span className="absolute top-0 right-0 bg-[#1A1A1A] text-white text-[9px] leading-none px-1 py-0.5">
                    ×{item.quantity}
                  </span>
                )}
              </div>
              <div className="flex-1 flex items-center justify-between gap-2 min-w-0">
                <div className="min-w-0">
                  <p className="text-[13px] text-[#1A1A1A] leading-tight truncate">{item.name}</p>
                  {item.size && <p className="text-[11px] text-[#999] mt-0.5">Size: {item.size}</p>}
                </div>
                <p className="text-[13px] text-[#1A1A1A] flex-shrink-0">{fmtPrice(item.price * item.quantity)}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-[#E8E2DB] pt-4 space-y-2">
          <div className="flex justify-between text-[13px] text-[#666]">
            <span>Subtotal</span><span>{fmtPrice(total)}</span>
          </div>
          <div className="flex justify-between text-[13px]">
            <span className="text-[#666]">Shipping</span>
            {selectedRate
              ? <span className="text-[#1A1A1A]">{fmtPrice(selectedRate.price)}</span>
              : <span className="text-[#bbb] italic text-[12px]">Select rate</span>
            }
          </div>
          <div className="flex justify-between text-[15px] font-semibold text-[#1A1A1A] pt-3 border-t border-[#E8E2DB]">
            <span>Total</span>
            <span>{fmtPrice(selectedRate ? grandTotal : total)}</span>
          </div>
        </div>
        {note.trim() && (
          <div className="mt-4 pt-4 border-t border-[#E8E2DB]">
            <p className="text-[10px] uppercase tracking-[0.15em] text-[#C08A6F] mb-1">Your note</p>
            <p className="text-[12px] text-[#666] italic leading-relaxed">&ldquo;{note}&rdquo;</p>
          </div>
        )}
      </div>
    </div>
  );
}

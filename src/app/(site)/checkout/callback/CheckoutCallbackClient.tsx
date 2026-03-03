"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";

// States:
// loading      → initial, calling verify
// confirming   → verify returned success, now polling for webhook stamp
// success      → webhook confirmed (or verify confirmed + timeout)
// pending      → verify unclear, webhook not fired within timeout — order exists, awaiting confirmation
// failed       → Paystack explicitly declined / abandoned
// bank_transfer → bank order placed
type PageState = "loading" | "confirming" | "success" | "pending" | "failed" | "bank_transfer";

interface VerifyResult {
  verified: boolean;
  status: string;
  reference: string;
  customer?: { email: string };
}

interface OrderStatus {
  found: boolean;
  status: string;
  webhookVerified: boolean;
  paidAt: string | null;
  customerEmail: string | null;
}

interface BankAccount {
  bankName: string;
  accountName: string;
  accountNumber: string;
  sortCode?: string;
}

const POLL_INTERVAL_MS = 2500;
const POLL_TIMEOUT_MS = 35_000; // 35 s — Paystack webhooks usually fire within 5–10 s

function CallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart } = useCart();

  const [state, setState] = useState<PageState>("loading");
  const [email, setEmail] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [btReference, setBtReference] = useState("");
  const [btTotal, setBtTotal] = useState("");

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stopPolling = () => {
    if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null; }
  };

  // Poll /api/orders/status until webhook confirms or timeout
  const pollForWebhook = (ref: string, emailHint?: string) => {
    setState("confirming");
    const started = Date.now();

    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/orders/status?reference=${encodeURIComponent(ref)}`,
          { cache: "no-store" }
        );
        if (!res.ok) return;
        const data: OrderStatus = await res.json();

        if (data.webhookVerified || data.status === "success") {
          stopPolling();
          if (data.customerEmail) setEmail(data.customerEmail);
          clearCart();
          setState("success");
          return;
        }

        if (data.status === "failed") {
          stopPolling();
          setState("failed");
          return;
        }
      } catch { /* keep polling */ }

      // Timed out waiting for webhook
      if (Date.now() - started >= POLL_TIMEOUT_MS) {
        stopPolling();
        if (emailHint) setEmail(emailHint);
        clearCart();
        // Don't show "failed" — payment went through on Paystack's end,
        // webhook just hasn't arrived yet. Show pending confirmation screen.
        setState("pending");
      }
    }, POLL_INTERVAL_MS);
  };

  useEffect(() => {
    const method = searchParams.get("method");

    /* ── Bank Transfer ── */
    if (method === "bank_transfer") {
      const ref = searchParams.get("reference") ?? "";
      const total = searchParams.get("total") ?? "";
      setBtReference(ref);
      setBtTotal(total);
      fetch("/api/payment-methods")
        .then((r) => r.json())
        .then((data) => setBankAccounts(data.bankAccounts ?? []))
        .catch(() => {});
      clearCart();
      setState("bank_transfer");
      return;
    }

    /* ── Paystack ── */
    const ref = searchParams.get("reference") ?? searchParams.get("trxref");
    if (!ref) { router.replace("/checkout"); return; }
    setReference(ref);

    fetch(`/api/checkout/verify?reference=${encodeURIComponent(ref)}`)
      .then((r) => r.json())
      .then((data: VerifyResult) => {
        const customerEmail = data.customer?.email;
        if (customerEmail) setEmail(customerEmail);

        if (data.verified && data.status === "success") {
          // Verify confirmed — poll for the authoritative webhook stamp
          pollForWebhook(ref, customerEmail);
        } else if (data.status === "pending" || data.status === "processing") {
          // Paystack says pending — could be a race, wait for webhook
          pollForWebhook(ref, customerEmail);
        } else {
          // Explicitly declined / abandoned
          setState("failed");
        }
      })
      .catch(() => {
        // Network error on verify — fall back to polling in case webhook already fired
        pollForWebhook(ref);
      });

    return () => stopPolling();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ─────────────────────── Loading ─────────────────────── */
  if (state === "loading") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <svg className="animate-spin w-8 h-8 text-brand-accent" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        <p className="text-sm text-[#666] tracking-wide">Verifying your payment…</p>
      </div>
    );
  }

  /* ─────────────────────── Confirming (polling) ─────────── */
  if (state === "confirming") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-5 px-6">
        <div className="relative w-16 h-16">
          <svg className="animate-spin w-16 h-16 text-brand-accent/20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
          </svg>
          <svg className="animate-spin w-16 h-16 text-brand-accent absolute inset-0" viewBox="0 0 24 24" fill="none">
            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-brand-text font-serif text-xl mb-1">Confirming with Paystack</p>
          <p className="text-[#999] text-sm max-w-xs">
            Your payment was received. We&apos;re waiting for Paystack&apos;s server confirmation — this takes a few seconds.
          </p>
        </div>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-brand-accent/40 animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  /* ─────────────────────── Bank Transfer ───────────────── */
  if (state === "bank_transfer") {
    const fmtPrice = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2 });
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6 gap-6 max-w-lg mx-auto pt-24 md:pt-28 pb-16">
        <div className="w-16 h-16 rounded-full bg-brand-light flex items-center justify-center">
          <svg className="w-8 h-8 text-brand-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v8m4-8v8m4-8v8m4-8v8m4-8v8" />
          </svg>
        </div>
        <div>
          <h1 className="font-serif text-3xl text-brand-text mb-2">Order Placed</h1>
          <p className="text-[#666] text-sm max-w-sm">
            Please complete your payment by transferring the amount below to any of the following bank accounts.
          </p>
        </div>
        {btTotal && (
          <div className="bg-[#FAFAF9] border border-brand-border px-6 py-4 w-full">
            <p className="text-[10px] uppercase tracking-[0.15em] text-[#999] mb-1">Amount Due</p>
            <p className="text-2xl font-semibold text-brand-text">{fmtPrice(parseFloat(btTotal))}</p>
          </div>
        )}
        {bankAccounts.length > 0 && (
          <div className="w-full space-y-3">
            <p className="text-[10px] uppercase tracking-[0.15em] text-[#999]">Transfer To</p>
            {bankAccounts.map((acct, i) => (
              <div key={i} className="border border-brand-border bg-white p-4 text-left space-y-1">
                <p className="text-sm font-medium text-brand-text">{acct.bankName}</p>
                <p className="text-[12px] text-[#666]">{acct.accountName}</p>
                <p className="text-[13px] font-mono tracking-wide text-brand-text">{acct.accountNumber}</p>
                {acct.sortCode && <p className="text-[11px] text-[#999]">Sort code: {acct.sortCode}</p>}
              </div>
            ))}
          </div>
        )}
        {btReference && (
          <div className="bg-[#FAFAF9] border border-brand-border px-6 py-4 w-full">
            <p className="text-[10px] uppercase tracking-[0.15em] text-[#999] mb-1">Your Reference</p>
            <p className="text-sm font-mono text-brand-text break-all">{btReference}</p>
            <p className="text-[11px] text-[#999] mt-2">
              Please use this reference when making your transfer so we can match your payment.
            </p>
          </div>
        )}
        <p className="text-[#999] text-[11px] max-w-sm">
          Your order will be confirmed once we verify your transfer. This usually takes 1–2 business hours.
        </p>
        <Link
          href="/shop"
          className="text-[10px] uppercase tracking-[0.2em] border border-brand-text px-6 py-3 hover:bg-brand-text hover:text-white transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  /* ─────────────────────── Success ─────────────────────── */
  if (state === "success") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6 gap-6">
        <div className="w-16 h-16 rounded-full bg-brand-light flex items-center justify-center">
          <svg className="w-8 h-8 text-brand-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <h1 className="font-serif text-3xl text-brand-text mb-2">Thank you</h1>
          <p className="text-[#666] text-sm max-w-sm">
            Your order has been confirmed. A confirmation will be sent to{" "}
            {email ? (
              <span className="text-brand-text">{email}</span>
            ) : (
              "your email"
            )}
            .
          </p>
          {reference && (
            <p className="text-[#999] text-[11px] mt-3 tracking-wider">
              Reference: {reference}
            </p>
          )}
        </div>
        <Link
          href="/shop"
          className="text-[10px] uppercase tracking-[0.2em] border border-brand-text px-6 py-3 hover:bg-brand-text hover:text-white transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  /* ─────────────────────── Pending (webhook delayed) ────── */
  if (state === "pending") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6 gap-6">
        <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center">
          <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z" />
          </svg>
        </div>
        <div>
          <h1 className="font-serif text-2xl text-brand-text mb-2">Order Received</h1>
          <p className="text-[#666] text-sm max-w-sm">
            Your payment has been processed. We&apos;re finalising your order — you&apos;ll receive a confirmation email{" "}
            {email ? (
              <>at <span className="text-brand-text">{email}</span></>
            ) : "shortly"}.
          </p>
          {reference && (
            <p className="text-[#999] text-[11px] mt-3 tracking-wider">
              Reference: {reference}
            </p>
          )}
        </div>
        <p className="text-[#bbb] text-[11px] max-w-xs">
          If you don&apos;t receive a confirmation within 10 minutes, please contact us with your reference number.
        </p>
        <div className="flex gap-3">
          <Link
            href="/shop"
            className="text-[10px] uppercase tracking-[0.2em] border border-brand-text px-6 py-3 hover:bg-brand-text hover:text-white transition-colors"
          >
            Continue Shopping
          </Link>
          <Link
            href="/contact"
            className="text-[10px] uppercase tracking-[0.2em] text-[#999] px-6 py-3 hover:text-brand-text transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </div>
    );
  }

  /* ─────────────────────── Failed ──────────────────────── */
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6 gap-6">
      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
        <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
      </div>
      <div>
        <h1 className="font-serif text-2xl text-brand-text mb-2">Payment Unsuccessful</h1>
        <p className="text-[#666] text-sm max-w-sm">
          Your payment could not be verified. No charge has been made. Please try again.
        </p>
      </div>
      <Link
        href="/checkout"
        className="text-[10px] uppercase tracking-[0.2em] bg-brand-accent text-white px-6 py-3 hover:bg-[#a8755c] transition-colors"
      >
        Try Again
      </Link>
    </div>
  );
}

export default function CheckoutCallbackClient() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <svg className="animate-spin w-8 h-8 text-brand-accent" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}

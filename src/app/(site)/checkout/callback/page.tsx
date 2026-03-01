"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";

interface VerifyResult {
  verified: boolean;
  status: string;
  reference: string;
  customer?: { email: string };
}

interface BankAccount {
  bankName: string;
  accountName: string;
  accountNumber: string;
  sortCode?: string;
}

function CallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart } = useCart();
  const [state, setState] = useState<"loading" | "success" | "failed" | "bank_transfer">("loading");
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [btReference, setBtReference] = useState("");
  const [btTotal, setBtTotal] = useState("");

  useEffect(() => {
    const method = searchParams.get("method");

    /* ── Bank Transfer confirmation ── */
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

    /* ── Paystack verification ── */
    const reference = searchParams.get("reference") ?? searchParams.get("trxref");
    if (!reference) {
      router.replace("/checkout");
      return;
    }

    fetch(`/api/checkout/verify?reference=${encodeURIComponent(reference)}`)
      .then((r) => r.json())
      .then((data: VerifyResult) => {
        setResult(data);
        if (data.verified && data.status === "success") {
          setState("success");
          clearCart();
        } else {
          setState("failed");
        }
      })
      .catch(() => setState("failed"));
  }, [searchParams, router, clearCart]);

  if (state === "loading") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <svg className="animate-spin w-8 h-8 text-[#C08A6F]" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        <p className="text-sm text-[#666] tracking-wide">Verifying your payment…</p>
      </div>
    );
  }

  /* ── Bank Transfer confirmation view ── */
  if (state === "bank_transfer") {
    const fmtPrice = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2 });
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6 gap-6 max-w-lg mx-auto pt-24 md:pt-28 pb-16">
        <div className="w-16 h-16 rounded-full bg-[#F5F0EB] flex items-center justify-center">
          <svg className="w-8 h-8 text-[#C08A6F]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v8m4-8v8m4-8v8m4-8v8m4-8v8" />
          </svg>
        </div>
        <div>
          <h1 className="font-serif text-3xl text-[#1A1A1A] mb-2">Order Placed</h1>
          <p className="text-[#666] text-sm max-w-sm">
            Please complete your payment by transferring the amount below to any of the following bank accounts.
          </p>
        </div>

        {btTotal && (
          <div className="bg-[#FAFAF9] border border-[#E8E2DB] px-6 py-4 w-full">
            <p className="text-[10px] uppercase tracking-[0.15em] text-[#999] mb-1">Amount Due</p>
            <p className="text-2xl font-semibold text-[#1A1A1A]">{fmtPrice(parseFloat(btTotal))}</p>
          </div>
        )}

        {bankAccounts.length > 0 && (
          <div className="w-full space-y-3">
            <p className="text-[10px] uppercase tracking-[0.15em] text-[#999]">Transfer To</p>
            {bankAccounts.map((acct, i) => (
              <div key={i} className="border border-[#E8E2DB] bg-white p-4 text-left space-y-1">
                <p className="text-sm font-medium text-[#1A1A1A]">{acct.bankName}</p>
                <p className="text-[12px] text-[#666]">{acct.accountName}</p>
                <p className="text-[13px] font-mono tracking-wide text-[#1A1A1A]">{acct.accountNumber}</p>
                {acct.sortCode && <p className="text-[11px] text-[#999]">Sort code: {acct.sortCode}</p>}
              </div>
            ))}
          </div>
        )}

        {btReference && (
          <div className="bg-[#FAFAF9] border border-[#E8E2DB] px-6 py-4 w-full">
            <p className="text-[10px] uppercase tracking-[0.15em] text-[#999] mb-1">Your Reference</p>
            <p className="text-sm font-mono text-[#1A1A1A] break-all">{btReference}</p>
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
          className="text-[10px] uppercase tracking-[0.2em] border border-[#1A1A1A] px-6 py-3 hover:bg-[#1A1A1A] hover:text-white transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  if (state === "success") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6 gap-6">
        <div className="w-16 h-16 rounded-full bg-[#F5F0EB] flex items-center justify-center">
          <svg
            className="w-8 h-8 text-[#C08A6F]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <h1 className="font-serif text-3xl text-[#1A1A1A] mb-2">Thank you</h1>
          <p className="text-[#666] text-sm max-w-sm">
            Your order has been placed successfully. A confirmation will be sent to{" "}
            {result?.customer?.email ? (
              <span className="text-[#1A1A1A]">{result.customer.email}</span>
            ) : (
              "your email"
            )}
            .
          </p>
          {result?.reference && (
            <p className="text-[#999] text-[11px] mt-3 tracking-wider">
              Reference: {result.reference}
            </p>
          )}
        </div>
        <Link
          href="/shop"
          className="text-[10px] uppercase tracking-[0.2em] border border-[#1A1A1A] px-6 py-3 hover:bg-[#1A1A1A] hover:text-white transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6 gap-6">
      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
        <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
      </div>
      <div>
        <h1 className="font-serif text-2xl text-[#1A1A1A] mb-2">Payment Unsuccessful</h1>
        <p className="text-[#666] text-sm max-w-sm">
          Your payment could not be verified. No charge has been made. Please try again.
        </p>
      </div>
      <Link
        href="/checkout"
        className="text-[10px] uppercase tracking-[0.2em] bg-[#C08A6F] text-white px-6 py-3 hover:bg-[#a8755c] transition-colors"
      >
        Try Again
      </Link>
    </div>
  );
}

export default function CheckoutCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <svg className="animate-spin w-8 h-8 text-[#C08A6F]" viewBox="0 0 24 24" fill="none">
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

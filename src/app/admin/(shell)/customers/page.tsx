"use client";

import useSWR from "swr";
import { useState } from "react";

interface Customer {
  _id: string;
  _createdAt: string;
  firebaseUid?: string;
  email?: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  photoURL?: string;
  orderCount: number;
  totalSpend: number;
  currency: string;
}

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: currency || "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function AdminCustomersPage() {
  const { data: customers = [], isLoading } = useSWR<Customer[]>(
    "/api/admin/customers",
    fetcher,
    { revalidateOnFocus: false }
  );

  const [selected, setSelected] = useState<Customer | null>(null);
  const [search, setSearch] = useState("");

  const filtered = customers.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (c.email || "").toLowerCase().includes(q) ||
      (c.displayName || "").toLowerCase().includes(q) ||
      (c.firstName || "").toLowerCase().includes(q) ||
      (c.lastName || "").toLowerCase().includes(q)
    );
  });

  const displayName = (c: Customer) =>
    c.displayName || [c.firstName, c.lastName].filter(Boolean).join(" ") || c.email || "—";

  const location = (c: Customer) =>
    [c.city, c.state, c.country].filter(Boolean).join(", ") || "—";

  return (
    <div className="flex h-full min-h-0 overflow-hidden">
      {/* List panel */}
      <div
        className={`flex flex-col w-full lg:w-[380px] xl:w-[420px] flex-shrink-0 border-r border-gray-100 ${
          selected ? "hidden lg:flex" : "flex"
        }`}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h1 className="font-serif text-xl text-[#1A1A1A] tracking-wide">Customers</h1>
            <span className="text-sm text-[#999]">
              {isLoading ? "…" : `${customers.length} total`}
            </span>
          </div>
          <input
            type="search"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#1A1A1A] placeholder-[#999] focus:outline-none focus:ring-1 focus:ring-[#C08A6F] focus:border-[#C08A6F]"
          />
        </div>

        {/* Customer list */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-5 h-5 border-2 border-[#C08A6F] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-[#999] text-sm gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
              {search ? "No customers match your search" : "No customers yet"}
            </div>
          ) : (
            filtered.map((c) => (
              <button
                key={c._id}
                onClick={() => setSelected(c)}
                className={`w-full text-left px-6 py-4 transition-colors hover:bg-gray-50 ${
                  selected?._id === c._id ? "bg-[#FAF8F5]" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#1A1A1A] truncate">{displayName(c)}</p>
                    <p className="text-xs text-[#999] truncate mt-0.5">{c.email || "—"}</p>
                    <p className="text-xs text-[#bbb] mt-1">{location(c)}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-[#666]">
                      {c.orderCount} {c.orderCount === 1 ? "order" : "orders"}
                    </p>
                    {c.totalSpend > 0 && (
                      <p className="text-xs font-medium text-[#C08A6F] mt-0.5">
                        {formatCurrency(c.totalSpend, c.currency)}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Detail panel */}
      {selected ? (
        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          {/* Back button (mobile) */}
          <button
            onClick={() => setSelected(null)}
            className="lg:hidden flex items-center gap-1.5 text-sm text-[#666] hover:text-[#1A1A1A] mb-5 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
            Back
          </button>

          {/* Customer header */}
          <div className="flex items-start gap-4 mb-8">
            {selected.photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={selected.photoURL}
                alt={displayName(selected)}
                className="w-14 h-14 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-[#FAF8F5] flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 text-[#C08A6F]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
              </div>
            )}
            <div>
              <h2 className="font-serif text-xl text-[#1A1A1A]">{displayName(selected)}</h2>
              {selected.email && (
                <a
                  href={`mailto:${selected.email}`}
                  className="text-sm text-[#C08A6F] hover:underline mt-0.5 inline-block"
                >
                  {selected.email}
                </a>
              )}
              <p className="text-xs text-[#999] mt-1">
                Joined {formatDate(selected._createdAt)}
              </p>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-[#FAF8F5] rounded-xl px-5 py-4">
              <p className="text-xs text-[#999] uppercase tracking-widest mb-1">Orders</p>
              <p className="text-2xl font-light text-[#1A1A1A]">{selected.orderCount}</p>
            </div>
            <div className="bg-[#FAF8F5] rounded-xl px-5 py-4">
              <p className="text-xs text-[#999] uppercase tracking-widest mb-1">Total Spend</p>
              <p className="text-2xl font-light text-[#1A1A1A]">
                {selected.totalSpend > 0
                  ? formatCurrency(selected.totalSpend, selected.currency)
                  : "—"}
              </p>
            </div>
          </div>

          {/* Contact & address */}
          <div className="space-y-6">
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-[#999] mb-3">
                Contact
              </h3>
              <div className="bg-white border border-gray-100 rounded-xl divide-y divide-gray-50">
                <Row label="Email" value={selected.email} link={selected.email ? `mailto:${selected.email}` : undefined} />
                <Row label="Phone" value={selected.phone} link={selected.phone ? `tel:${selected.phone}` : undefined} />
                <Row label="Firebase UID" value={selected.firebaseUid} mono />
              </div>
            </section>

            {(selected.address || selected.city || selected.state || selected.country) && (
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-widest text-[#999] mb-3">
                  Default Address
                </h3>
                <div className="bg-white border border-gray-100 rounded-xl divide-y divide-gray-50">
                  <Row label="Street" value={selected.address} />
                  <Row label="City" value={selected.city} />
                  <Row label="State" value={selected.state} />
                  <Row label="Country" value={selected.country} />
                </div>
              </section>
            )}

            {/* Orders link */}
            <a
              href={`/admin/orders?email=${encodeURIComponent(selected.email || "")}`}
              className="flex items-center justify-between w-full bg-white border border-gray-200 rounded-xl px-5 py-4 text-sm text-[#1A1A1A] hover:border-[#C08A6F] transition-colors group"
            >
              <span>
                View {selected.orderCount} {selected.orderCount === 1 ? "order" : "orders"} in Orders
              </span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-[#999] group-hover:text-[#C08A6F] transition-colors">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </a>
          </div>
        </div>
      ) : (
        <div className="hidden lg:flex flex-1 items-center justify-center flex-col gap-3 text-[#ccc]">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
          </svg>
          <p className="text-sm">Select a customer</p>
        </div>
      )}
    </div>
  );
}

function Row({
  label,
  value,
  link,
  mono,
}: {
  label: string;
  value?: string;
  link?: string;
  mono?: boolean;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-4 px-5 py-3">
      <span className="text-xs text-[#999] w-28 flex-shrink-0 pt-0.5">{label}</span>
      {link ? (
        <a
          href={link}
          className={`text-sm text-[#C08A6F] hover:underline break-all ${mono ? "font-mono text-xs" : ""}`}
        >
          {value}
        </a>
      ) : (
        <span className={`text-sm text-[#1A1A1A] break-all ${mono ? "font-mono text-xs" : ""}`}>
          {value}
        </span>
      )}
    </div>
  );
}

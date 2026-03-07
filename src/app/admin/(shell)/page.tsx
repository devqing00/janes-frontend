"use client";

import Link from "next/link";
import useSWR from "swr";

type RecentProduct = {
  _id: string;
  name: string;
  category: string;
  price: number;
  status: string;
  imageUrl?: string;
  isFabricVariant?: boolean;
  tag?: {
    title: string;
    slug: string;
    fabricPrice: number;
    fabricPricePerN: number;
    fabricUnit: string;
  };
};

type OrderSummary = {
  _id: string;
  status: string;
  subtotal: number;
  currency: string;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

// Orders API returns { orders: [], totalCount, page, limit } – unwrap the array
const ordersFetcher = (url: string) =>
  fetch(url)
    .then((r) => r.json())
    .then((d) => (Array.isArray(d.orders) ? d.orders : Array.isArray(d) ? d : []));

function getDisplayPrice(p: RecentProduct): string {
  if (p.isFabricVariant && p.tag?.fabricPrice) {
    const perN = p.tag.fabricPricePerN > 0 ? p.tag.fabricPricePerN : 1;
    const unit = p.tag.fabricUnit || "yard";
    return `₦${(p.tag.fabricPrice / perN).toLocaleString()}/${unit}`;
  }
  return `₦${(p.price ?? 0).toLocaleString()}`;
}

function getDisplayName(p: RecentProduct): string {
  if (p.isFabricVariant && p.tag?.title) {
    return p.tag.title;
  }
  return p.name;
}

export default function AdminDashboardPage() {
  const { data: products = [], isLoading: productsLoading } = useSWR<RecentProduct[]>(
    "/api/admin/products",
    fetcher,
    { revalidateOnFocus: true }
  );
  const { data: collections = [], isLoading: collectionsLoading } = useSWR<{ _id: string }[]>(
    "/api/admin/collections",
    fetcher,
    { revalidateOnFocus: true }
  );
  const { data: messages = [] } = useSWR<{ read: boolean }[]>(
    "/api/admin/contact",
    fetcher,
    { revalidateOnFocus: true }
  );
  const { data: orders = [], isLoading: ordersLoading } = useSWR<OrderSummary[]>(
    "/api/admin/orders",
    ordersFetcher,
    { revalidateOnFocus: true }
  );

  const loading = productsLoading || collectionsLoading || ordersLoading;
  const published = products.filter((p) => p.status === "published").length;
  const unread = Array.isArray(messages) ? messages.filter((m) => !m.read).length : 0;
  const paidOrders = Array.isArray(orders) ? orders.filter((o) => o.status === "success" || o.status === "delivered") : [];
  const revenue = paidOrders.reduce((sum, o) => sum + (o.subtotal || 0), 0);
  const revenueCurrency = paidOrders[0]?.currency || "NGN";

  const stats = loading ? null : {
    products: products.length,
    collections: collections.length,
    published,
    drafts: products.length - published,
    unread,
    orders: Array.isArray(orders) ? orders.length : 0,
    revenue,
  };

  const recent = products.slice(0, 5);

  const statCards = stats
    ? [
        { label: "Products", value: stats.products, href: "/admin/products" },
        { label: "Collections", value: stats.collections, href: "/admin/collections" },
        { label: "Orders", value: stats.orders, href: "/admin/orders" },
        { label: "Revenue", value: `${revenueCurrency} ${revenue.toLocaleString()}`, href: "/admin/orders" },
        { label: "Unread Messages", value: stats.unread, href: "/admin/messages" },
      ]
    : [];

  return (
    <>
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-semibold text-[#1A1A1A]">
          Dashboard
        </h1>
        <p className="text-[#666] text-sm mt-1">
          Welcome back. Here&apos;s an overview of your store.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5"
              >
                <div className="skeleton h-3 w-16 mb-3" />
                <div className="skeleton h-8 w-12" />
              </div>
            ))
          : statCards.map((stat) => (
              <Link
                key={stat.label}
                href={stat.href}
                className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 hover:border-[#C08A6F]/50 hover:shadow-sm transition-all"
              >
                <p className="text-[#666] text-[10px] uppercase tracking-widest">
                  {stat.label}
                </p>
                <p className="text-[#1A1A1A] text-2xl sm:text-3xl font-semibold mt-2">
                  {stat.value}
                </p>
              </Link>
            ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <Link
          href="/admin/products/new"
          className="flex items-center gap-4 bg-[#232323] text-white rounded-xl p-4 sm:p-5 hover:bg-[#C08A6F] transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
          </div>
          <div>
            <p className="font-medium text-sm">Add New Product</p>
            <p className="text-white/60 text-xs mt-0.5">
              Create a new product listing
            </p>
          </div>
        </Link>
        <Link
          href="/admin/collections/new"
          className="flex items-center gap-4 bg-white border border-gray-200 rounded-xl p-4 sm:p-5 hover:border-[#C08A6F]/50 hover:shadow-sm transition-all"
        >
          <div className="w-10 h-10 rounded-full bg-[#FAF8F5] flex items-center justify-center text-[#C08A6F] shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
          </div>
          <div>
            <p className="font-medium text-sm text-[#1A1A1A]">
              New Collection
            </p>
            <p className="text-[#666] text-xs mt-0.5">
              Create a seasonal collection
            </p>
          </div>
        </Link>
      </div>

      {/* Recent products */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 sm:px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-medium text-[#1A1A1A] text-sm">
            Recent Products
          </h2>
          <Link
            href="/admin/products"
            className="text-[#C08A6F] text-xs hover:underline"
          >
            View all
          </Link>
        </div>

        {loading ? (
          <div className="p-5 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="skeleton w-10 h-12 shrink-0 rounded" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-3 w-40" />
                  <div className="skeleton h-2 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : recent.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-[#666] text-sm mb-3">No products yet</p>
            <Link
              href="/admin/products/new"
              className="text-[#C08A6F] text-sm hover:underline"
            >
              Create your first product
            </Link>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <table className="w-full hidden sm:table">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-widest text-[#666] border-b border-gray-100">
                  <th className="px-5 py-3 font-medium">Product</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 font-medium text-right">Price</th>
                  <th className="px-5 py-3 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((product) => (
                  <tr
                    key={product._id}
                    onClick={() => window.location.href = `/admin/products/${product._id}`}
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-3 text-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-11 rounded bg-[#F5F0EB] overflow-hidden relative flex-shrink-0">
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#C08A6F]/40">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" /></svg>
                            </div>
                          )}
                        </div>
                        <span className="font-medium text-[#1A1A1A] truncate max-w-[280px]">
                          {getDisplayName(product)}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-[#666]">
                      <span className="inline-flex items-center gap-1.5">
                        {product.isFabricVariant && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#C08A6F] inline-block" title="Fabric variant" />
                        )}
                        {product.category}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-[#1A1A1A] text-right font-medium tabular-nums">
                      {getDisplayPrice(product)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span
                        className={`inline-block text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full font-medium ${
                          product.status === "published"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {product.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile list */}
            <div className="sm:hidden divide-y divide-gray-50">
              {recent.map((product) => (
                <Link
                  key={product._id}
                  href={`/admin/products/${product._id}`}
                  className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50/50"
                >
                  <div className="w-10 h-12 rounded bg-[#F5F0EB] overflow-hidden relative flex-shrink-0">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#C08A6F]/40">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" /></svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1A1A1A] truncate">
                      {getDisplayName(product)}
                    </p>
                    <p className="text-xs text-[#666] mt-0.5 flex items-center gap-1">
                      {product.isFabricVariant && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C08A6F] inline-block" />
                      )}
                      {product.category} &middot; {getDisplayPrice(product)}
                    </p>
                  </div>
                  <span
                    className={`text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full shrink-0 font-medium ${
                      product.status === "published"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {product.status}
                  </span>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}

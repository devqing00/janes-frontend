"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import useSWR from "swr";

type Product = {
  _id: string;
  name: string;
  category: string;
  price: number;
  status: string;
  imageUrl: string | null;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function AdminProductsPage() {
  const { data: products = [], isLoading: loading } = useSWR<Product[]>(
    "/api/admin/products",
    fetcher,
    { revalidateOnFocus: true }
  );
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === "All" || p.category === filterCat;
    return matchSearch && matchCat;
  });

  const categories = ["All", ...new Set(products.map((p) => p.category))];

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-[#1A1A1A]">Products</h1>
          <p className="text-[#666] text-sm mt-1">
            {loading ? "Loading..." : `${products.length} products total`}
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center justify-center gap-2 bg-[#232323] text-white text-sm px-5 py-2.5 rounded-lg hover:bg-[#C08A6F] transition-colors shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 sm:max-w-sm">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#666]">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C08A6F] transition-colors bg-white"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`text-xs px-4 py-2.5 rounded-lg border transition-colors whitespace-nowrap ${
                filterCat === cat
                  ? "bg-[#232323] text-white border-[#232323]"
                  : "bg-white text-[#666] border-gray-200 hover:border-gray-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="skeleton w-10 h-12 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-3 w-48" />
                <div className="skeleton h-2 w-28" />
              </div>
              <div className="skeleton h-5 w-16 hidden sm:block" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12 mx-auto text-gray-300 mb-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
          </svg>
          <p className="text-[#666] text-sm mb-3">
            {products.length === 0 ? "No products yet" : "No products match your search"}
          </p>
          {products.length === 0 && (
            <Link href="/admin/products/new" className="text-[#C08A6F] text-sm hover:underline">
              Create your first product
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hidden sm:block">
            <table className="w-full">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-widest text-[#666] border-b border-gray-100">
                  <th className="px-5 py-3 font-medium">Product</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 font-medium">Price</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => (
                  <tr key={product._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-12 rounded overflow-hidden bg-[#F5F0EB] shrink-0">
                          {product.imageUrl ? (
                            <Image src={product.imageUrl} alt={product.name} fill className="object-cover" sizes="40px" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#999]">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <span className="text-sm text-[#1A1A1A] font-medium">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-[#666]">{product.category}</td>
                    <td className="px-5 py-3 text-sm text-[#1A1A1A]">${product.price}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-block text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full ${
                        product.status === "published" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
                      }`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <Link href={`/admin/products/${product._id}`} className="text-[#C08A6F] text-xs hover:underline">
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden space-y-3">
            {filtered.map((product) => (
              <Link
                key={product._id}
                href={`/admin/products/${product._id}`}
                className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 p-3 hover:border-[#C08A6F]/40 transition-colors"
              >
                <div className="relative w-14 h-16 rounded-lg overflow-hidden bg-[#F5F0EB] shrink-0">
                  {product.imageUrl ? (
                    <Image src={product.imageUrl} alt={product.name} fill className="object-cover" sizes="56px" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#999]">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1A1A1A] truncate">{product.name}</p>
                  <p className="text-xs text-[#666] mt-0.5">{product.category} &middot; ${product.price}</p>
                </div>
                <span className={`text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full shrink-0 ${
                  product.status === "published" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
                }`}>
                  {product.status}
                </span>
              </Link>
            ))}
          </div>
        </>
      )}
    </>
  );
}

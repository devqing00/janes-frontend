"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useMemo } from "react";
import useSWR from "swr";

type Tag = { title: string; slug: string; fabricPrice?: number; fabricPricePerN?: number; fabricUnit?: string };

type Product = {
  _id: string;
  name: string;
  category: string;
  price: number;
  status: string;
  imageUrl: string | null;
  isFabricVariant?: boolean;
  tag?: Tag | null;
};

function displayPrice(p: Product): string {
  if (p.isFabricVariant && p.tag?.fabricPrice) {
    const perN = p.tag.fabricPricePerN ?? 1;
    const unit = p.tag.fabricUnit ?? "yard";
    return `₦${p.tag.fabricPrice.toLocaleString()}/${perN > 1 ? `${perN} ` : ""}${unit}${perN > 1 ? "s" : ""}`;
  }
  return `₦${(p.price ?? 0).toLocaleString()}`;
}

const ITEMS_PER_PAGE = 20;
const fetcher = (url: string) => fetch(url).then((r) => r.json());

/* ── Thumbnail cell ─────────────────────── */
function Thumb({ src, alt, size = "sm" }: { src: string | null; alt: string; size?: "sm" | "md" }) {
  const cls = size === "md" ? "w-14 h-16" : "w-10 h-12";
  return (
    <div className={`relative ${cls} rounded overflow-hidden bg-[#F5F0EB] shrink-0`}>
      {src ? (
        <Image src={src} alt={alt} fill className="object-cover" sizes="56px" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-[#999]">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
          </svg>
        </div>
      )}
    </div>
  );
}

/* ── Status badge ─────────────────────── */
function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-block text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full ${
      status === "published" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
    }`}>
      {status}
    </span>
  );
}

/* ── Fabric accordion group ─────────────────────── */
function FabricAccordion({ tagSlug, tag, products }: { tagSlug: string; tag: Tag | null; products: Product[] }) {
  const [open, setOpen] = useState(false);
  const priceLabel = tag?.fabricPrice
    ? (() => {
        const perN = tag.fabricPricePerN ?? 1;
        const unit = tag.fabricUnit ?? "yard";
        return `₦${tag.fabricPrice.toLocaleString()}/${perN > 1 ? `${perN} ` : ""}${unit}${perN > 1 ? "s" : ""}`;
      })()
    : null;

  const publishedCount = products.filter((p) => p.status === "published").length;

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white transition-shadow hover:shadow-sm">
      {/* Accordion header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-gray-50/60 transition-colors"
      >
        {/* Preview thumbnails stack */}
        <div className="flex -space-x-2 shrink-0">
          {products.slice(0, 4).map((p) => (
            <div key={p._id} className="relative w-9 h-10 rounded border-2 border-white overflow-hidden bg-[#F5F0EB] shadow-sm">
              {p.imageUrl && <Image src={p.imageUrl} alt={p.name} fill className="object-cover" sizes="36px" />}
            </div>
          ))}
          {products.length > 4 && (
            <div className="relative w-9 h-10 rounded border-2 border-white bg-[#F5F0EB] flex items-center justify-center shadow-sm">
              <span className="text-[9px] font-semibold text-[#666]">+{products.length - 4}</span>
            </div>
          )}
        </div>

        {/* Tag info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-[#1A1A1A] truncate">{tag?.title || tagSlug}</span>
            <span className="text-[9px] uppercase tracking-wider text-[#C08A6F] bg-[#FDF8F4] px-1.5 py-0.5 rounded font-medium">fabric</span>
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-xs text-[#666]">{products.length} variant{products.length !== 1 ? "s" : ""}</span>
            {priceLabel && <span className="text-xs text-[#1A1A1A] font-medium">{priceLabel}</span>}
            <span className="text-[10px] text-green-600">{publishedCount} published</span>
          </div>
        </div>

        {/* Expand chevron */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className={`w-4 h-4 text-[#999] shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {/* Expanded rows */}
      {open && (
        <div className="border-t border-gray-100">
          {/* Desktop sub-table */}
          <table className="w-full hidden sm:table">
            <thead>
              <tr className="bg-[#FAFAFA] text-left text-[10px] uppercase tracking-widest text-[#999]">
                <th className="px-5 py-2.5 font-medium">Variant</th>
                <th className="px-5 py-2.5 font-medium">Status</th>
                <th className="px-5 py-2.5 font-medium">Edit</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, idx) => (
                <tr key={p._id} className={`border-t border-gray-50 hover:bg-gray-50/40 transition-colors ${idx === products.length - 1 ? "" : ""}`}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Thumb src={p.imageUrl} alt={p.name} />
                      <span className="text-sm text-[#1A1A1A] truncate max-w-[240px]">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3"><StatusBadge status={p.status} /></td>
                  <td className="px-5 py-3">
                    <Link href={`/admin/products/${p._id}`} className="text-[#C08A6F] text-xs hover:underline">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile list */}
          <div className="sm:hidden divide-y divide-gray-50">
            {products.map((p) => (
              <Link
                key={p._id}
                href={`/admin/products/${p._id}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50/60 transition-colors"
              >
                <Thumb src={p.imageUrl} alt={p.name} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#1A1A1A] truncate">{p.name}</p>
                </div>
                <StatusBadge status={p.status} />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Flat product row (desktop) ─────────────────────── */
function ProductRow({ product }: { product: Product }) {
  return (
    <tr className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
      <td className="px-5 py-3">
        <div className="flex items-center gap-3">
          <Thumb src={product.imageUrl} alt={product.name} />
          <span className="text-sm text-[#1A1A1A] font-medium truncate max-w-[220px] lg:max-w-xs">
            {product.name}
          </span>
        </div>
      </td>
      <td className="px-5 py-3 text-sm text-[#666]">{product.category}</td>
      <td className="px-5 py-3 text-sm text-[#1A1A1A]">{displayPrice(product)}</td>
      <td className="px-5 py-3"><StatusBadge status={product.status} /></td>
      <td className="px-5 py-3">
        <Link href={`/admin/products/${product._id}`} className="text-[#C08A6F] text-xs hover:underline">
          Edit
        </Link>
      </td>
    </tr>
  );
}

/* ── Pagination ─────────────────────── */
function Pagination({ page, total, onChange }: { page: number; total: number; onChange: (p: number) => void }) {
  if (total <= 1) return null;
  const pages = Array.from({ length: total }, (_, i) => i + 1);
  // Show at most 7 page buttons (first 2, last 2, current ±1, with ellipsis)
  const visible = pages.filter(
    (p) => p === 1 || p === 2 || p === total || p === total - 1 || Math.abs(p - page) <= 1
  );
  const withEllipsis: (number | "...")[] = [];
  visible.forEach((p, i) => {
    if (i > 0 && p - (visible[i - 1] as number) > 1) withEllipsis.push("...");
    withEllipsis.push(p);
  });

  return (
    <div className="flex items-center justify-between mt-4">
      <p className="text-xs text-[#666]">Page {page} of {total}</p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          className="p-1.5 rounded border border-gray-200 text-[#666] disabled:opacity-30 hover:border-[#C08A6F] hover:text-[#C08A6F] transition-colors disabled:pointer-events-none"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </button>
        {withEllipsis.map((p, i) =>
          p === "..." ? (
            <span key={`e${i}`} className="px-1 text-xs text-[#999]">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p as number)}
              className={`min-w-[28px] h-7 rounded border text-xs transition-colors ${
                p === page
                  ? "bg-[#232323] text-white border-[#232323]"
                  : "border-gray-200 text-[#666] hover:border-[#C08A6F] hover:text-[#C08A6F]"
              }`}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => onChange(page + 1)}
          disabled={page === total}
          className="p-1.5 rounded border border-gray-200 text-[#666] disabled:opacity-30 hover:border-[#C08A6F] hover:text-[#C08A6F] transition-colors disabled:pointer-events-none"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>
    </div>
  );
}

/* ── Main page ─────────────────────── */
export default function AdminProductsPage() {
  const { data: products = [], isLoading: loading } = useSWR<Product[]>(
    "/api/admin/products",
    fetcher,
    { revalidateOnFocus: true }
  );
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [page, setPage] = useState(1);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))],
    [products]
  );

  /* Split into fabric vs regular after search+category filter */
  const searchLower = search.toLowerCase();
  const allFiltered = useMemo(
    () =>
      products.filter((p) => {
        const matchSearch =
          p.name.toLowerCase().includes(searchLower) ||
          (p.tag?.title?.toLowerCase().includes(searchLower) ?? false);
        const matchCat = filterCat === "All" || p.category === filterCat;
        return matchSearch && matchCat;
      }),
    [products, searchLower, filterCat]
  );

  const fabricProducts = useMemo(() => allFiltered.filter((p) => p.isFabricVariant), [allFiltered]);
  const regularProducts = useMemo(() => allFiltered.filter((p) => !p.isFabricVariant), [allFiltered]);

  /* Group fabrics by tag slug */
  const fabricGroups = useMemo(() => {
    const map = new Map<string, { tag: Tag | null; products: Product[] }>();
    fabricProducts.forEach((p) => {
      const key = p.tag?.slug || "untagged";
      if (!map.has(key)) map.set(key, { tag: p.tag ?? null, products: [] });
      map.get(key)!.products.push(p);
    });
    return map;
  }, [fabricProducts]);

  /* Pagination for regular products */
  const totalPages = Math.ceil(regularProducts.length / ITEMS_PER_PAGE);
  const paginatedRegular = regularProducts.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleCatChange = (cat: string) => {
    setFilterCat(cat);
    setPage(1);
  };
  const handleSearch = (v: string) => {
    setSearch(v);
    setPage(1);
  };

  const showFabricSection = filterCat === "All" || filterCat === "Fabrics";
  const showRegularSection = filterCat !== "Fabrics";
  const totalVisible = allFiltered.length;

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-[#1A1A1A]">Products</h1>
          <p className="text-[#666] text-sm mt-1">
            {loading ? "Loading…" : `${products.length} products total`}
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
            placeholder="Search products…"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C08A6F] transition-colors bg-white"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCatChange(cat)}
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

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4">
              <div className="skeleton w-10 h-12 shrink-0 rounded" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-3 w-52" />
                <div className="skeleton h-2 w-32" />
              </div>
              <div className="skeleton h-5 w-16 hidden sm:block rounded-full" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && totalVisible === 0 && (
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
      )}

      {/* ── Fabric groups (accordion) ─────────── */}
      {!loading && showFabricSection && fabricGroups.size > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#666]">Fabric Collections</h2>
            <span className="text-[10px] bg-[#FDF8F4] text-[#C08A6F] border border-[#C08A6F]/20 px-2 py-0.5 rounded-full font-medium">
              {fabricProducts.length} variants · {fabricGroups.size} tags
            </span>
          </div>
          <div className="space-y-2.5">
            {Array.from(fabricGroups.entries()).map(([tagSlug, { tag, products: grpProducts }]) => (
              <FabricAccordion key={tagSlug} tagSlug={tagSlug} tag={tag} products={grpProducts} />
            ))}
          </div>
        </div>
      )}

      {/* ── Regular products table ─────────────── */}
      {!loading && showRegularSection && regularProducts.length > 0 && (
        <div>
          {filterCat === "All" && fabricGroups.size > 0 && (
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#666]">Other Products</h2>
              <span className="text-[10px] bg-gray-100 text-[#666] px-2 py-0.5 rounded-full font-medium">
                {regularProducts.length}
              </span>
            </div>
          )}

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
                {paginatedRegular.map((product) => (
                  <ProductRow key={product._id} product={product} />
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden space-y-3">
            {paginatedRegular.map((product) => (
              <Link
                key={product._id}
                href={`/admin/products/${product._id}`}
                className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 p-3 hover:border-[#C08A6F]/40 transition-colors"
              >
                <Thumb src={product.imageUrl} alt={product.name} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1A1A1A] truncate">{product.name}</p>
                  <p className="text-xs text-[#666] mt-0.5">{product.category} · {displayPrice(product)}</p>
                </div>
                <StatusBadge status={product.status} />
              </Link>
            ))}
          </div>

          <Pagination page={page} total={totalPages} onChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
        </div>
      )}
    </>
  );
}

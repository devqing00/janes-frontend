"use client";

import ImageUpload, { type UploadedImage } from "@/components/admin/ImageUpload";
import { useToast } from "@/components/admin/Toast";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import useSWR from "swr";

interface CategoryItem {
  _id: string;
  title: string;
  slug: string;
  level: number;
  parent?: { _id: string; slug: string } | null;
}

const catFetcher = (url: string) => fetch(url).then((r) => r.json());

export default function NewProductPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const { data: allCategories = [] } = useSWR<CategoryItem[]>("/api/admin/categories", catFetcher);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    categoryId: "",
    subcategoryId: "",
    tagIds: [] as string[],
    priceType: "single" as "single" | "range",
    price: "",
    priceMax: "",
    description: "",
    details: "",
    sizes: "",
    status: "draft",
  });

  const mainCategories = useMemo(() => allCategories.filter((c) => c.level === 1), [allCategories]);
  const subCategories = useMemo(
    () => allCategories.filter((c) => c.level === 2 && c.parent?._id === form.categoryId),
    [allCategories, form.categoryId]
  );
  const tags = useMemo(
    () => allCategories.filter((c) => c.level === 3 && c.parent?._id === form.subcategoryId),
    [allCategories, form.subcategoryId]
  );

  // Detect if the selected main category is "fabrics" — fabric products are thin records
  const isFabricCategory = useMemo(() => {
    if (!form.categoryId) return false;
    const mainCat = allCategories.find((c) => c._id === form.categoryId);
    return mainCat?.slug === "fabrics";
  }, [allCategories, form.categoryId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "name"
        ? {
            slug: value
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/(^-|-$)/g, ""),
          }
        : {}),
      // Reset child selections when parent changes
      ...(name === "categoryId" ? { subcategoryId: "", tagIds: [] } : {}),
      ...(name === "subcategoryId" ? { tagIds: [] } : {}),
    }));
  };

  const toggleTag = (tagId: string) => {
    setForm((prev) => ({
      ...prev,
      tagIds: prev.tagIds.includes(tagId) ? prev.tagIds.filter((id) => id !== tagId) : [...prev.tagIds, tagId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isFabricCategory) {
        // Fabric mode: create one product per uploaded image
        if (images.length === 0) {
          toast("Upload at least one image", "error");
          setSaving(false);
          return;
        }
        if (form.tagIds.length === 0) {
          toast("Select a tag", "error");
          setSaving(false);
          return;
        }

        const selectedTag = allCategories.find((c) => form.tagIds.includes(c._id) && c.level === 3);
        const tagName = selectedTag?.title || "Fabric";
        const tagSlug = selectedTag?.slug || "variant";

        let created = 0;
        for (let i = 0; i < images.length; i++) {
          const ts = Date.now();
          const res = await fetch("/api/admin/products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              categoryId: form.categoryId,
              subcategoryId: form.subcategoryId,
              tagIds: form.tagIds,
              images: [images[i].assetRef],
              status: form.status,
              isFabricVariant: true,
              name: `${tagName} Variant ${ts}-${i}`,
              slug: `fabric-${tagSlug}-${ts}-${i}`,
              price: 0,
            }),
          });
          if (res.ok) created++;
        }

        if (created > 0) {
          toast(`${created} fabric variant${created > 1 ? "s" : ""} created`);
          router.push("/admin/products");
        } else {
          toast("Failed to create variants", "error");
        }
      } else {
        // Regular product
        const body: Record<string, unknown> = {
          categoryId: form.categoryId,
          subcategoryId: form.subcategoryId,
          tagIds: form.tagIds,
          images: images.map((img) => img.assetRef),
          status: form.status,
          isFabricVariant: false,
          name: form.name,
          slug: form.slug,
          priceType: form.priceType,
          price: form.price,
          priceMax: form.priceMax,
          description: form.description,
          details: form.details,
          sizes: form.sizes,
        };

        const res = await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (res.ok) {
          toast("Product created successfully");
          router.push("/admin/products");
        } else {
          toast("Failed to create product", "error");
        }
      }
    } catch {
      toast("Something went wrong", "error");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#C08A6F] transition-colors bg-white";

  return (
      <div className="max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <button
            onClick={() => router.back()}
            aria-label="Go back"
            className="text-[#666] hover:text-[#1A1A1A] transition-colors p-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-[#1A1A1A]">New Product</h1>
            <p className="text-[#666] text-sm mt-1">Add a new product to your catalogue</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          {/* Category selection — always visible */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 space-y-5">
            <h2 className="font-medium text-[#1A1A1A] text-sm uppercase tracking-widest">
              {isFabricCategory ? "Fabric Variant" : "Basic Information"}
            </h2>

            {isFabricCategory && (
              <div className="bg-[#FDF8F4] border border-[#E8DED5] rounded-lg p-4 text-xs text-[#666] leading-relaxed">
                <strong className="text-[#C08A6F]">Fabric mode:</strong> Each uploaded image becomes a separate variant.
                Pricing, unit, and descriptions are set on the tag in&nbsp;
                <span className="font-medium text-[#1A1A1A]">Categories</span>.
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              {/* Name & slug — only for regular products */}
              {!isFabricCategory && (
                <>
                  <div className="sm:col-span-2">
                    <label className="text-[#666] text-xs block mb-1.5">Product Name</label>
                    <input name="name" required value={form.name} onChange={handleChange} className={inputClass} placeholder="e.g. Cream Linen Kimono Set" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[#666] text-xs block mb-1.5">URL Slug</label>
                    <input name="slug" required value={form.slug} onChange={handleChange} className={inputClass + " font-mono text-xs"} placeholder="cream-linen-kimono-set" />
                  </div>
                </>
              )}

              <div>
                <label htmlFor="categoryId" className="text-[#666] text-xs block mb-1.5">Category</label>
                <select id="categoryId" name="categoryId" value={form.categoryId} onChange={handleChange} className={inputClass} required>
                  <option value="">— Select —</option>
                  {mainCategories.map((c) => (
                    <option key={c._id} value={c._id}>{c.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="subcategoryId" className="text-[#666] text-xs block mb-1.5">Subcategory</label>
                <select id="subcategoryId" name="subcategoryId" value={form.subcategoryId} onChange={handleChange} className={inputClass}>
                  <option value="">— Select —</option>
                  {subCategories.map((c) => (
                    <option key={c._id} value={c._id}>{c.title}</option>
                  ))}
                </select>
              </div>
              {tags.length > 0 && (
                <div className="sm:col-span-2">
                  <label className="text-[#666] text-xs block mb-1.5">{isFabricCategory ? "Tag (required)" : "Tags"}</label>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <button key={tag._id} type="button" onClick={() => toggleTag(tag._id)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${form.tagIds.includes(tag._id) ? "bg-[#C08A6F] text-white border-[#C08A6F]" : "bg-white text-[#666] border-gray-200 hover:border-[#C08A6F]"}`}>
                        {tag.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Pricing & sizes — only for regular products */}
              {!isFabricCategory && (
                <>
                  <div className="sm:col-span-2">
                    <label htmlFor="priceType" className="text-[#666] text-xs block mb-1.5">Price Type</label>
                    <div className="flex gap-3">
                      {(["single", "range"] as const).map((pt) => (
                        <button
                          key={pt}
                          type="button"
                          onClick={() => setForm((prev) => ({ ...prev, priceType: pt, ...(pt === "single" ? { priceMax: "" } : {}) }))}
                          className={`flex-1 text-xs py-2.5 rounded-lg border transition-colors ${
                            form.priceType === pt
                              ? "bg-[#C08A6F] text-white border-[#C08A6F]"
                              : "bg-white text-[#666] border-gray-200 hover:border-[#C08A6F]"
                          }`}
                        >
                          {pt === "single" ? "Single (fixed)" : "Range (min – max)"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-[#666] text-xs block mb-1.5">
                      {form.priceType === "range" ? "Min Price (NGN)" : "Price (NGN)"}
                    </label>
                    <input name="price" type="number" required value={form.price} onChange={handleChange} className={inputClass} placeholder="420" />
                  </div>
                  {form.priceType === "range" && (
                    <div>
                      <label className="text-[#666] text-xs block mb-1.5">Max Price (NGN)</label>
                      <input name="priceMax" type="number" required value={form.priceMax} onChange={handleChange} className={inputClass} placeholder="5000" />
                    </div>
                  )}
                  {form.priceType !== "range" && (
                    <div>
                      <label className="text-[#666] text-xs block mb-1.5">Sizes (comma separated)</label>
                      <input name="sizes" value={form.sizes} onChange={handleChange} className={inputClass} placeholder="XS, S, M, L, XL" />
                    </div>
                  )}
                  {form.priceType === "range" && (
                    <div className="sm:col-span-2">
                      <label className="text-[#666] text-xs block mb-1.5">Sizes (comma separated)</label>
                      <input name="sizes" value={form.sizes} onChange={handleChange} className={inputClass} placeholder="XS, S, M, L, XL" />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Description — only for regular products */}
          {!isFabricCategory && (
            <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 space-y-5">
              <h2 className="font-medium text-[#1A1A1A] text-sm uppercase tracking-widest">Description</h2>
              <div>
                <label className="text-[#666] text-xs block mb-1.5">Product Description</label>
                <textarea name="description" rows={4} value={form.description} onChange={handleChange} className={inputClass + " resize-none"} placeholder="Describe the product, its materials, and styling suggestions..." />
              </div>
              <div>
                <label className="text-[#666] text-xs block mb-1.5">Details (one per line)</label>
                <textarea name="details" rows={4} value={form.details} onChange={handleChange} className={inputClass + " resize-none"} placeholder={"100% Italian linen\nRelaxed oversized fit\nHand wash cold"} />
              </div>
            </div>
          )}

          {/* Images */}
          <ImageUpload images={images} onImagesChange={setImages} />

          {/* Status & submit */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <label htmlFor="status" className="text-[#666] text-xs">Status:</label>
              <select id="status" name="status" value={form.status} onChange={handleChange} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C08A6F] transition-colors bg-white">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => router.back()} className="flex-1 sm:flex-none text-[#666] text-sm px-5 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="flex-1 sm:flex-none bg-[#232323] text-white text-sm px-6 py-2.5 rounded-lg hover:bg-[#C08A6F] transition-colors disabled:opacity-50">
                {saving ? "Saving..." : isFabricCategory && images.length > 1 ? `Save ${images.length} Variants` : "Save Product"}
              </button>
            </div>
          </div>
        </form>
      </div>
  );
}

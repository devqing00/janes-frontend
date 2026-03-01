"use client";

import ImageUpload, { type UploadedImage } from "@/components/admin/ImageUpload";
import { useToast } from "@/components/admin/Toast";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewCollectionPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    status: "draft",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const autoSlug = () => {
    if (!form.slug && form.title) {
      setForm((prev) => ({
        ...prev,
        slug: prev.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, ""),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast("Title is required", "error");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          image: images.length > 0 ? images[0].assetRef : undefined,
        }),
      });
      if (res.ok) {
        toast("Collection created successfully");
        router.push("/admin/collections");
      } else {
        const data = await res.json().catch(() => ({}));
        toast(data.error || "Failed to create collection", "error");
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
          <button onClick={() => router.back()} className="text-[#666] hover:text-[#1A1A1A] transition-colors p-1">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-[#1A1A1A]">New Collection</h1>
            <p className="text-[#666] text-sm mt-1">Create a new product collection</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          {/* Basic info */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 space-y-5">
            <h2 className="font-medium text-[#1A1A1A] text-sm uppercase tracking-widest">Collection Details</h2>
            <div className="space-y-4 sm:space-y-5">
              <div>
                <label className="text-[#666] text-xs block mb-1.5">Title *</label>
                <input
                  name="title"
                  required
                  value={form.title}
                  onChange={handleChange}
                  onBlur={autoSlug}
                  className={inputClass}
                  placeholder="e.g. Summer 2025"
                />
              </div>
              <div>
                <label className="text-[#666] text-xs block mb-1.5">URL Slug</label>
                <input
                  name="slug"
                  value={form.slug}
                  onChange={handleChange}
                  className={inputClass + " font-mono text-xs"}
                  placeholder="summer-2025"
                />
              </div>
              <div>
                <label className="text-[#666] text-xs block mb-1.5">Description</label>
                <textarea
                  name="description"
                  rows={4}
                  value={form.description}
                  onChange={handleChange}
                  className={inputClass + " resize-none"}
                  placeholder="Describe the collection..."
                />
              </div>
            </div>
          </div>

          {/* Cover image */}
          <ImageUpload
            images={images}
            onImagesChange={setImages}
            multiple={false}
          />

          {/* Status & submit */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <label className="text-[#666] text-xs">Status:</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C08A6F] transition-colors bg-white"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 sm:flex-none text-[#666] text-sm px-5 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 sm:flex-none bg-[#232323] text-white text-sm px-6 py-2.5 rounded-lg hover:bg-[#C08A6F] transition-colors disabled:opacity-50"
              >
                {saving ? "Creating..." : "Create Collection"}
              </button>
            </div>
          </div>
        </form>
      </div>
  );
}

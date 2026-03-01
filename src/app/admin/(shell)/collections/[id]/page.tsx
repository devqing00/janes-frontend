"use client";

import ConfirmModal from "@/components/admin/ConfirmModal";
import ImageUpload, { type UploadedImage } from "@/components/admin/ImageUpload";
import { useToast } from "@/components/admin/Toast";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function EditCollectionPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    status: "draft",
  });

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/admin/collections/${id}`);
        if (res.ok) {
          const data = await res.json();
          setForm({
            title: data.title || "",
            slug: data.slug || "",
            description: data.description || "",
            status: data.status || "draft",
          });
          // API returns "image": image.asset->{ _id, url }
          if (data.image?.url && data.image?._id) {
            setImages([
              {
                _id: data.image._id,
                url: data.image.url,
                assetRef: {
                  _type: "image" as const,
                  asset: { _type: "reference" as const, _ref: data.image._id },
                },
              },
            ]);
          }
        } else {
          toast("Collection not found", "error");
          router.push("/admin/collections");
        }
      } catch {
        toast("Failed to load collection", "error");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, router, toast]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/collections/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          image: images.length > 0 ? images[0].assetRef : undefined,
        }),
      });
      if (res.ok) {
        toast("Collection updated successfully");
        router.push("/admin/collections");
      } else {
        toast("Failed to update collection", "error");
      }
    } catch {
      toast("Something went wrong", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/collections/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast("Collection deleted");
        router.push("/admin/collections");
      } else {
        toast("Failed to delete collection", "error");
      }
    } catch {
      toast("Something went wrong", "error");
    } finally {
      setDeleting(false);
    }
  };

  const inputClass =
    "w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#C08A6F] transition-colors bg-white";

  if (loading) {
    return (
        <div className="max-w-3xl space-y-6">
          <div className="flex items-center gap-4">
            <div className="skeleton w-5 h-5" />
            <div className="space-y-2">
              <div className="skeleton h-6 w-40" />
              <div className="skeleton h-3 w-56" />
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton h-10 w-full" />
            ))}
          </div>
        </div>
    );
  }

  return (
    <>
      <div className="max-w-3xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4">
            <button onClick={() => router.back()} className="text-[#666] hover:text-[#1A1A1A] transition-colors p-1">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-[#1A1A1A]">Edit Collection</h1>
              <p className="text-[#666] text-sm mt-1 truncate max-w-xs">{form.title || "Untitled"}</p>
            </div>
          </div>
          <button
            onClick={() => setShowDeleteModal(true)}
            disabled={deleting}
            className="text-red-500 text-xs border border-red-200 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 self-start sm:self-auto"
          >
            {deleting ? "Deleting..." : "Delete Collection"}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          {/* Basic info */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 space-y-5">
            <h2 className="font-medium text-[#1A1A1A] text-sm uppercase tracking-widest">Collection Details</h2>
            <div className="space-y-4 sm:space-y-5">
              <div>
                <label className="text-[#666] text-xs block mb-1.5">Title *</label>
                <input name="title" required value={form.title} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className="text-[#666] text-xs block mb-1.5">URL Slug</label>
                <input name="slug" value={form.slug} onChange={handleChange} className={inputClass + " font-mono text-xs"} />
              </div>
              <div>
                <label className="text-[#666] text-xs block mb-1.5">Description</label>
                <textarea name="description" rows={4} value={form.description} onChange={handleChange} className={inputClass + " resize-none"} />
              </div>
            </div>
          </div>

          {/* Cover image */}
          <ImageUpload images={images} onImagesChange={setImages} multiple={false} />

          {/* Status & submit */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <label className="text-[#666] text-xs">Status:</label>
              <select name="status" value={form.status} onChange={handleChange} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C08A6F] transition-colors bg-white">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => router.back()} className="flex-1 sm:flex-none text-[#666] text-sm px-5 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="flex-1 sm:flex-none bg-[#232323] text-white text-sm px-6 py-2.5 rounded-lg hover:bg-[#C08A6F] transition-colors disabled:opacity-50">
                {saving ? "Saving..." : "Update Collection"}
              </button>
            </div>
          </div>
        </form>
      </div>

      <ConfirmModal
        open={showDeleteModal}
        title="Delete Collection"
        message={`"${form.title || "This collection"}" will be permanently removed. This action cannot be undone.`}
        confirmLabel={deleting ? "Deleting..." : "Delete"}
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </>
  );
}

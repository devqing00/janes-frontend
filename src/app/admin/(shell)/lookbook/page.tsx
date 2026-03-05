"use client";

import { useState, useEffect, useRef } from "react";
import { useToast } from "@/components/admin/Toast";
import Image from "next/image";

type LookbookImage = {
  id: string;
  url: string;
  assetId: string;
  caption: string;
};

export default function LookbookAdminPage() {
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<LookbookImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing lookbook data
  useEffect(() => {
    fetch("/api/admin/lookbook")
      .then((r) => r.json())
      .then((data) => {
        setTitle(data.lookbookTitle || "");
        setSubtitle(data.lookbookSubtitle || "");
        setDescription(data.lookbookDescription || "");
        const imgs: LookbookImage[] = (data.lookbookImages || []).map(
          (img: { url: string; assetId: string; caption?: string }) => ({
            id: img.assetId,
            url: img.url,
            assetId: img.assetId,
            caption: img.caption || "",
          })
        );
        setImages(imgs);
      })
      .catch(() => toast("Failed to load lookbook data", "error"))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const uploadFiles = async (files: FileList) => {
    setUploading(true);
    const newImages: LookbookImage[] = [];

    for (const file of Array.from(files)) {
      if (file.size > 10 * 1024 * 1024) {
        toast(`${file.name} exceeds 10 MB limit`, "error");
        continue;
      }
      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });
        if (res.ok) {
          const data = await res.json();
          newImages.push({
            id: data._id,
            url: data.url,
            assetId: data.assetRef.asset._ref,
            caption: "",
          });
        } else {
          toast(`Failed to upload ${file.name}`, "error");
        }
      } catch {
        toast(`Failed to upload ${file.name}`, "error");
      }
    }

    if (newImages.length > 0) {
      setImages((prev) => [...prev, ...newImages]);
      toast(`${newImages.length} image${newImages.length > 1 ? "s" : ""} uploaded`, "success");
    }
    setUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) uploadFiles(e.dataTransfer.files);
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const updateCaption = (id: string, caption: string) => {
    setImages((prev) => prev.map((img) => (img.id === id ? { ...img, caption } : img)));
  };

  const moveImage = (fromIdx: number, toIdx: number) => {
    setImages((prev) => {
      const next = [...prev];
      const [item] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, item);
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/lookbook", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lookbookTitle: title,
          lookbookSubtitle: subtitle,
          lookbookDescription: description,
          lookbookImages: images.map((img) => ({
            assetId: img.assetId,
            caption: img.caption,
          })),
        }),
      });
      if (res.ok) {
        toast("Lookbook saved", "success");
      } else {
        toast("Failed to save lookbook", "error");
      }
    } catch {
      toast("Failed to save lookbook", "error");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#1A1A1A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="font-serif text-xl sm:text-2xl text-[#1A1A1A] tracking-wide">Lookbook</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage lookbook content and images shown on the public Lookbook page
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="self-start bg-[#1A1A1A] text-white text-sm px-6 py-2.5 hover:bg-[#333] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shrink-0"
        >
          {saving && (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="space-y-8">
        {/* Text Content */}
        <section className="bg-white border border-gray-200 p-6 space-y-5">
          <h2 className="font-medium text-[#1A1A1A] text-sm uppercase tracking-widest">
            Page Content
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. The Lookbook"
                className="w-full border border-gray-200 px-3 py-2.5 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">
                Subtitle
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g. Season 01 — Quiet Luxury"
                className="w-full border border-gray-200 px-3 py-2.5 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A brief description shown at the top of the lookbook page..."
              rows={3}
              className="w-full border border-gray-200 px-3 py-2.5 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors resize-none"
            />
          </div>
        </section>

        {/* Images */}
        <section className="bg-white border border-gray-200 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-medium text-[#1A1A1A] text-sm uppercase tracking-widest">
              Images
              {images.length > 0 && (
                <span className="ml-2 text-xs font-normal text-gray-400 normal-case tracking-normal">
                  ({images.length})
                </span>
              )}
            </h2>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="text-xs text-[#1A1A1A] border border-gray-300 px-3 py-1.5 hover:border-[#1A1A1A] transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <span className="w-3 h-3 border border-[#1A1A1A] border-t-transparent rounded-full animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Add Images
                </>
              )}
            </button>
          </div>

          {/* Drop Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-none transition-colors cursor-pointer flex flex-col items-center justify-center py-10 text-center ${
              dragOver ? "border-[#1A1A1A] bg-gray-50" : "border-gray-200 hover:border-gray-400"
            }`}
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-[#1A1A1A] border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-400">Uploading...</p>
              </div>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-10 h-10 text-gray-300 mb-3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21ZM9 9.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                </svg>
                <p className="text-sm text-gray-400">
                  Drag &amp; drop images here, or{" "}
                  <span className="text-[#1A1A1A] underline underline-offset-2">browse</span>
                </p>
                <p className="text-xs text-gray-300 mt-1">JPG, PNG, WEBP · max 10 MB each</p>
              </>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && uploadFiles(e.target.files)}
          />

          {/* Image Grid */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {images.map((img, idx) => (
                <div key={img.id} className="group relative">
                  {/* Image */}
                  <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
                    <Image
                      src={img.url}
                      alt={img.caption || "Lookbook image"}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, 33vw"
                    />
                    {/* Overlay controls */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors">
                      {/* Remove button */}
                      <button
                        onClick={() => removeImage(img.id)}
                        className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-50"
                        title="Remove image"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-red-500">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      {/* Move buttons */}
                      <div className="absolute bottom-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {idx > 0 && (
                          <button
                            onClick={() => moveImage(idx, idx - 1)}
                            className="w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50"
                            title="Move left"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                            </svg>
                          </button>
                        )}
                        {idx < images.length - 1 && (
                          <button
                            onClick={() => moveImage(idx, idx + 1)}
                            className="w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50"
                            title="Move right"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Caption input */}
                  <input
                    type="text"
                    value={img.caption}
                    onChange={(e) => updateCaption(img.id, e.target.value)}
                    placeholder="Add a caption..."
                    className="mt-1.5 w-full border border-gray-200 px-2.5 py-1.5 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors placeholder:text-gray-300"
                  />
                </div>
              ))}
            </div>
          )}

          {images.length === 0 && !uploading && (
            <p className="text-center text-sm text-gray-400 py-4">
              No images yet. Upload some to get started.
            </p>
          )}
        </section>
      </div>

      {/* Sticky Save Bar */}
      <div className="fixed bottom-0 left-0 lg:left-64 right-0 bg-white border-t border-gray-200 px-4 sm:px-8 py-3 sm:py-4 flex items-center justify-between z-30">
        <p className="text-xs text-gray-400">
          {images.length} image{images.length !== 1 ? "s" : ""} · Changes are saved manually
        </p>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#1A1A1A] text-white text-sm px-8 py-2.5 hover:bg-[#333] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {saving && (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* Bottom padding for sticky bar */}
      <div className="h-20" />
    </div>
  );
}

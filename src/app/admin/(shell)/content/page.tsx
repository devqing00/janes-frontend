"use client";

import ImageUpload, { UploadedImage } from "@/components/admin/ImageUpload";
import { useToast } from "@/components/admin/Toast";
import { useState, useEffect } from "react";

/* ── Types ── */
interface CategoryCard {
  title: string;
  image: UploadedImage | null;
  link: string;
}

interface EditorialItem {
  image: UploadedImage | null;
  title: string;
  category: string;
}

interface LookbookImage {
  image: UploadedImage | null;
  caption: string;
}

interface ContentForm {
  // Hero
  tagline: string;
  heroImages: UploadedImage[];
  heroSeasonLabel: string;
  heroCTAText: string;
  // Categories
  categoryCards: CategoryCard[];
  // Editorial Grid
  editorialItems: EditorialItem[];
  // Parallax
  parallaxImage: UploadedImage | null;
  parallaxSubtitle: string;
  parallaxHeading: string;
  parallaxCTAText: string;
  parallaxCTALink: string;
  // Lookbook
  lookbookTitle: string;
  lookbookSubtitle: string;
  lookbookDescription: string;
  lookbookImages: LookbookImage[];
}

const defaults: ContentForm = {
  tagline: "",
  heroImages: [],
  heroSeasonLabel: "",
  heroCTAText: "Explore Collection",
  categoryCards: [],
  editorialItems: [],
  parallaxImage: null,
  parallaxSubtitle: "",
  parallaxHeading: "",
  parallaxCTAText: "",
  parallaxCTALink: "",
  lookbookTitle: "",
  lookbookSubtitle: "",
  lookbookDescription: "",
  lookbookImages: [],
};

export default function ContentPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ContentForm>(defaults);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/content");
        if (res.ok) {
          const data = await res.json();
          setForm({
            tagline: data.tagline || "",
            heroImages: data.heroImages || [],
            heroSeasonLabel: data.heroSeasonLabel || "",
            heroCTAText: data.heroCTAText || "Explore Collection",
            categoryCards: data.categoryCards || [],
            editorialItems: data.editorialItems || [],
            parallaxImage: data.parallaxImage || null,
            parallaxSubtitle: data.parallaxSubtitle || "",
            parallaxHeading: data.parallaxHeading || "",
            parallaxCTAText: data.parallaxCTAText || "",
            parallaxCTALink: data.parallaxCTALink || "",
            lookbookTitle: data.lookbookTitle || "",
            lookbookSubtitle: data.lookbookSubtitle || "",
            lookbookDescription: data.lookbookDescription || "",
            lookbookImages: data.lookbookImages || [],
          });
        }
      } catch {
        toast("Failed to load content", "error");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) toast("Content saved successfully");
      else toast("Failed to save content", "error");
    } catch {
      toast("Something went wrong", "error");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#C08A6F] transition-colors bg-white";

  /* ── Category Card helpers ── */
  const addCategoryCard = () =>
    setForm((p) => ({
      ...p,
      categoryCards: [...p.categoryCards, { title: "", image: null, link: "" }],
    }));
  const updateCategoryCard = (idx: number, patch: Partial<CategoryCard>) =>
    setForm((p) => ({
      ...p,
      categoryCards: p.categoryCards.map((c, i) => (i === idx ? { ...c, ...patch } : c)),
    }));
  const removeCategoryCard = (idx: number) =>
    setForm((p) => ({
      ...p,
      categoryCards: p.categoryCards.filter((_, i) => i !== idx),
    }));

  /* ── Editorial Item helpers ── */
  const addEditorialItem = () =>
    setForm((p) => ({
      ...p,
      editorialItems: [...p.editorialItems, { image: null, title: "", category: "" }],
    }));
  const updateEditorialItem = (idx: number, patch: Partial<EditorialItem>) =>
    setForm((p) => ({
      ...p,
      editorialItems: p.editorialItems.map((e, i) => (i === idx ? { ...e, ...patch } : e)),
    }));
  const removeEditorialItem = (idx: number) =>
    setForm((p) => ({
      ...p,
      editorialItems: p.editorialItems.filter((_, i) => i !== idx),
    }));

  /* ── Lookbook Image helpers ── */
  const addLookbookImage = () =>
    setForm((p) => ({
      ...p,
      lookbookImages: [...p.lookbookImages, { image: null, caption: "" }],
    }));
  const updateLookbookImage = (idx: number, patch: Partial<LookbookImage>) =>
    setForm((p) => ({
      ...p,
      lookbookImages: p.lookbookImages.map((l, i) => (i === idx ? { ...l, ...patch } : l)),
    }));
  const removeLookbookImage = (idx: number) =>
    setForm((p) => ({
      ...p,
      lookbookImages: p.lookbookImages.filter((_, i) => i !== idx),
    }));

  if (loading) {
    return (
        <div className="max-w-4xl space-y-6">
          <div className="space-y-2">
            <div className="skeleton h-6 w-32" />
            <div className="skeleton h-3 w-56" />
          </div>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <div className="skeleton h-4 w-32" />
              <div className="skeleton h-10 w-full" />
              <div className="skeleton h-32 w-full" />
            </div>
          ))}
        </div>
    );
  }

  return (
      <div className="max-w-4xl">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-semibold text-[#1A1A1A]">
            Content
          </h1>
          <p className="text-[#666] text-sm mt-1">
            Manage homepage & lookbook editorial content
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          {/* ═══════ HERO SECTION ═══════ */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 space-y-5">
            <h2 className="font-medium text-[#1A1A1A] text-sm uppercase tracking-widest">
              Hero Section
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-[#666] text-xs block mb-1.5">
                  Tagline (displayed as the hero heading)
                </label>
                <textarea
                  rows={3}
                  value={form.tagline}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, tagline: e.target.value }))
                  }
                  className={inputClass + " resize-none"}
                  placeholder='e.g. "Luxurious and Contemporary Fashion for Every One"'
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[#666] text-xs block mb-1.5">
                    Season Label
                  </label>
                  <input
                    value={form.heroSeasonLabel}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        heroSeasonLabel: e.target.value,
                      }))
                    }
                    className={inputClass}
                    placeholder="SS 2026"
                  />
                </div>
                <div>
                  <label className="text-[#666] text-xs block mb-1.5">
                    CTA Button Text
                  </label>
                  <input
                    value={form.heroCTAText}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, heroCTAText: e.target.value }))
                    }
                    className={inputClass}
                    placeholder="Explore Collection"
                  />
                </div>
              </div>
            </div>
            <ImageUpload
              label="Hero Images (3 images: left, top-right, bottom-right)"
              images={form.heroImages}
              onImagesChange={(imgs) =>
                setForm((p) => ({ ...p, heroImages: imgs }))
              }
            />
          </div>

          {/* ═══════ CATEGORIES SECTION ═══════ */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-medium text-[#1A1A1A] text-sm uppercase tracking-widest">
                Category Cards
              </h2>
              <button
                type="button"
                onClick={addCategoryCard}
                className="text-[#C08A6F] text-xs uppercase tracking-wider hover:underline"
              >
                + Add Card
              </button>
            </div>
            {form.categoryCards.length === 0 && (
              <p className="text-[#999] text-sm">
                No category cards yet. Click &quot;+ Add Card&quot; to create one.
              </p>
            )}
            {form.categoryCards.map((card, idx) => (
              <div
                key={idx}
                className="border border-gray-100 rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[#666] text-xs font-medium">
                    Card {idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeCategoryCard(idx)}
                    className="text-red-500 text-xs hover:underline"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[#666] text-xs block mb-1">
                      Title
                    </label>
                    <input
                      value={card.title}
                      onChange={(e) =>
                        updateCategoryCard(idx, { title: e.target.value })
                      }
                      className={inputClass}
                      placeholder="Womenswear"
                    />
                  </div>
                  <div>
                    <label className="text-[#666] text-xs block mb-1">
                      Link URL
                    </label>
                    <input
                      value={card.link}
                      onChange={(e) =>
                        updateCategoryCard(idx, { link: e.target.value })
                      }
                      className={inputClass}
                      placeholder="/shop?category=Womenswear"
                    />
                  </div>
                </div>
                <ImageUpload
                  label="Card Image"
                  images={card.image ? [card.image] : []}
                  onImagesChange={(imgs) =>
                    updateCategoryCard(idx, {
                      image: imgs.length > 0 ? imgs[imgs.length - 1] : null,
                    })
                  }
                  multiple={false}
                />
              </div>
            ))}
          </div>

          {/* ═══════ EDITORIAL GRID ═══════ */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-medium text-[#1A1A1A] text-sm uppercase tracking-widest">
                Editorial Grid
              </h2>
              <button
                type="button"
                onClick={addEditorialItem}
                className="text-[#C08A6F] text-xs uppercase tracking-wider hover:underline"
              >
                + Add Item
              </button>
            </div>
            <p className="text-[#999] text-xs">
              3 items recommended (first is large, other two stack on the right).
            </p>
            {form.editorialItems.map((item, idx) => (
              <div
                key={idx}
                className="border border-gray-100 rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[#666] text-xs font-medium">
                    Item {idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeEditorialItem(idx)}
                    className="text-red-500 text-xs hover:underline"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[#666] text-xs block mb-1">
                      Title
                    </label>
                    <input
                      value={item.title}
                      onChange={(e) =>
                        updateEditorialItem(idx, { title: e.target.value })
                      }
                      className={inputClass}
                      placeholder="The Art of Draping"
                    />
                  </div>
                  <div>
                    <label className="text-[#666] text-xs block mb-1">
                      Category Label
                    </label>
                    <input
                      value={item.category}
                      onChange={(e) =>
                        updateEditorialItem(idx, { category: e.target.value })
                      }
                      className={inputClass}
                      placeholder="Editorial"
                    />
                  </div>
                </div>
                <ImageUpload
                  label="Image"
                  images={item.image ? [item.image] : []}
                  onImagesChange={(imgs) =>
                    updateEditorialItem(idx, {
                      image: imgs.length > 0 ? imgs[imgs.length - 1] : null,
                    })
                  }
                  multiple={false}
                />
              </div>
            ))}
          </div>

          {/* ═══════ PARALLAX SECTION ═══════ */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 space-y-5">
            <h2 className="font-medium text-[#1A1A1A] text-sm uppercase tracking-widest">
              Parallax Section
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[#666] text-xs block mb-1.5">
                    Subtitle
                  </label>
                  <input
                    value={form.parallaxSubtitle}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        parallaxSubtitle: e.target.value,
                      }))
                    }
                    className={inputClass}
                    placeholder="Our Philosophy"
                  />
                </div>
                <div>
                  <label className="text-[#666] text-xs block mb-1.5">
                    CTA Text
                  </label>
                  <input
                    value={form.parallaxCTAText}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        parallaxCTAText: e.target.value,
                      }))
                    }
                    className={inputClass}
                    placeholder="Our Story"
                  />
                </div>
              </div>
              <div>
                <label className="text-[#666] text-xs block mb-1.5">
                  Heading
                </label>
                <textarea
                  rows={2}
                  value={form.parallaxHeading}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      parallaxHeading: e.target.value,
                    }))
                  }
                  className={inputClass + " resize-none"}
                  placeholder="Fashion that transcends the ordinary"
                />
              </div>
              <div>
                <label className="text-[#666] text-xs block mb-1.5">
                  CTA Link
                </label>
                <input
                  value={form.parallaxCTALink}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      parallaxCTALink: e.target.value,
                    }))
                  }
                  className={inputClass}
                  placeholder="/about"
                />
              </div>
            </div>
            <ImageUpload
              label="Background Image"
              images={form.parallaxImage ? [form.parallaxImage] : []}
              onImagesChange={(imgs) =>
                setForm((p) => ({
                  ...p,
                  parallaxImage:
                    imgs.length > 0 ? imgs[imgs.length - 1] : null,
                }))
              }
              multiple={false}
            />
          </div>

          {/* ═══════ LOOKBOOK ═══════ */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-medium text-[#1A1A1A] text-sm uppercase tracking-widest">
                Lookbook
              </h2>
              <button
                type="button"
                onClick={addLookbookImage}
                className="text-[#C08A6F] text-xs uppercase tracking-wider hover:underline"
              >
                + Add Image
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[#666] text-xs block mb-1.5">
                    Page Title
                  </label>
                  <input
                    value={form.lookbookTitle}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        lookbookTitle: e.target.value,
                      }))
                    }
                    className={inputClass}
                    placeholder="Lookbook"
                  />
                </div>
                <div>
                  <label className="text-[#666] text-xs block mb-1.5">
                    Italic Subtitle
                  </label>
                  <input
                    value={form.lookbookSubtitle}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        lookbookSubtitle: e.target.value,
                      }))
                    }
                    className={inputClass}
                    placeholder="SS26"
                  />
                </div>
              </div>
              <div>
                <label className="text-[#666] text-xs block mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={form.lookbookDescription}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      lookbookDescription: e.target.value,
                    }))
                  }
                  className={inputClass + " resize-none"}
                  placeholder="A visual diary of our latest collection..."
                />
              </div>
            </div>
            {form.lookbookImages.map((lbi, idx) => (
              <div
                key={idx}
                className="border border-gray-100 rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[#666] text-xs font-medium">
                    Image {idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeLookbookImage(idx)}
                    className="text-red-500 text-xs hover:underline"
                  >
                    Remove
                  </button>
                </div>
                <div>
                  <label className="text-[#666] text-xs block mb-1">
                    Caption
                  </label>
                  <input
                    value={lbi.caption}
                    onChange={(e) =>
                      updateLookbookImage(idx, { caption: e.target.value })
                    }
                    className={inputClass}
                    placeholder="Look 1 — Linen drape set"
                  />
                </div>
                <ImageUpload
                  label="Image"
                  images={lbi.image ? [lbi.image] : []}
                  onImagesChange={(imgs) =>
                    updateLookbookImage(idx, {
                      image: imgs.length > 0 ? imgs[imgs.length - 1] : null,
                    })
                  }
                  multiple={false}
                />
              </div>
            ))}
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-[#232323] text-white text-sm px-8 py-2.5 rounded-lg hover:bg-[#C08A6F] transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Content"}
            </button>
          </div>
        </form>
      </div>
  );
}

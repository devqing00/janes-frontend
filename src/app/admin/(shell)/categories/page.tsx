"use client";

import { useState, useCallback, useMemo } from "react";
import useSWR, { mutate } from "swr";
import { useToast } from "@/components/admin/Toast";
import ConfirmModal from "@/components/admin/ConfirmModal";

/* ── Types ── */
interface Category {
  _id: string;
  title: string;
  slug: string;
  level: number;
  order: number;
  description?: string;
  image?: string;
  parent?: { _id: string; slug: string } | null;
}

interface FormState {
  title: string;
  slug: string;
  level: number;
  parentId: string;
  description: string;
  order: number;
}

const EMPTY_FORM: FormState = { title: "", slug: "", level: 1, parentId: "", description: "", order: 0 };
const API = "/api/admin/categories";
const fetcher = (url: string) => fetch(url).then((r) => r.json());

/* ── helpers ── */
function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const LEVEL_LABELS: Record<number, string> = { 1: "Main Category", 2: "Sub-Section", 3: "Tag" };
const LEVEL_COLORS: Record<number, string> = {
  1: "bg-[#232323] text-white",
  2: "bg-[#C08A6F] text-white",
  3: "bg-[#E8DED5] text-[#1A1A1A]",
};

export default function AdminCategoriesPage() {
  const { data: categories = [], isLoading } = useSWR<Category[]>(API, fetcher, { revalidateOnFocus: true });
  const { toast } = useToast();

  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  /* ── Tree builder ── */
  const tree = useMemo(() => {
    const level1 = categories.filter((c) => c.level === 1).sort((a, b) => a.order - b.order);
    const level2 = categories.filter((c) => c.level === 2).sort((a, b) => a.order - b.order);
    const level3 = categories.filter((c) => c.level === 3).sort((a, b) => a.order - b.order);
    return level1.map((l1) => ({
      ...l1,
      children: level2
        .filter((l2) => l2.parent?._id === l1._id)
        .map((l2) => ({
          ...l2,
          children: level3.filter((l3) => l3.parent?._id === l2._id),
        })),
    }));
  }, [categories]);

  /* ── Handlers ── */
  const openNew = useCallback((level: number, parentId = "") => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, level, parentId, order: categories.filter((c) => c.level === level).length });
    setShowForm(true);
  }, [categories]);

  const openEdit = useCallback((cat: Category) => {
    setEditing(cat._id);
    setForm({
      title: cat.title,
      slug: cat.slug,
      level: cat.level,
      parentId: cat.parent?._id || "",
      description: cat.description || "",
      order: cat.order ?? 0,
    });
    setShowForm(true);
  }, []);

  const cancel = useCallback(() => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(false);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "order" || name === "level" ? Number(value) : value,
      ...(name === "title" && !editing ? { slug: slugify(value) } : {}),
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const body: Record<string, unknown> = { ...form, slug: form.slug || slugify(form.title) };
      if (editing) body._id = editing;

      const res = await fetch(API, {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        toast(editing ? "Category updated" : "Category created");
        cancel();
        mutate(API);
      } else {
        const err = await res.json();
        toast(err.error || "Failed to save", "error");
      }
    } catch {
      toast("Something went wrong", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(deleteTarget._id);
    try {
      const res = await fetch(`${API}?id=${deleteTarget._id}`, { method: "DELETE" });
      if (res.ok) {
        toast("Category deleted");
        if (editing === deleteTarget._id) cancel();
        mutate(API);
      } else {
        const err = await res.json();
        toast(err.error || "Failed to delete", "error");
      }
    } catch {
      toast("Something went wrong", "error");
    } finally {
      setDeleting(null);
      setDeleteTarget(null);
    }
  };

  /* ── Possible parents for the current form ── */
  const parentOptions = useMemo(() => {
    if (form.level === 1) return [];
    if (form.level === 2) return categories.filter((c) => c.level === 1);
    return categories.filter((c) => c.level === 2);
  }, [form.level, categories]);

  const inputClass = "w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#C08A6F] transition-colors bg-white";
  const isFormOpen = showForm;

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-[#1A1A1A]">Categories</h1>
          <p className="text-[#666] text-sm mt-1">
            {isLoading ? "Loading..." : `${categories.length} categories across 3 levels`}
          </p>
        </div>
        <button
          onClick={() => openNew(1)}
          className="flex items-center justify-center gap-2 bg-[#232323] text-white text-sm px-5 py-2.5 rounded-lg hover:bg-[#C08A6F] transition-colors shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Main Category
        </button>
      </div>

      {/* Form panel (create / edit) */}
      {isFormOpen && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-medium text-[#1A1A1A] text-sm uppercase tracking-widest">
              {editing ? "Edit Category" : `New ${LEVEL_LABELS[form.level] || "Category"}`}
            </h2>
            <button onClick={cancel} className="text-[#666] hover:text-[#1A1A1A] text-xs">Cancel</button>
          </div>
          <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[#666] text-xs block mb-1.5">Title</label>
              <input name="title" required value={form.title} onChange={handleChange} className={inputClass} placeholder="e.g. Womenswear" />
            </div>
            <div>
              <label className="text-[#666] text-xs block mb-1.5">Slug</label>
              <input name="slug" value={form.slug} onChange={handleChange} className={inputClass + " font-mono text-xs"} placeholder="auto-generated" />
            </div>
            {form.level > 1 && (
              <div>
                <label className="text-[#666] text-xs block mb-1.5">Parent</label>
                <select name="parentId" value={form.parentId} onChange={handleChange} className={inputClass} required>
                  <option value="">— Select parent —</option>
                  {parentOptions.map((p) => (
                    <option key={p._id} value={p._id}>{p.title}</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="text-[#666] text-xs block mb-1.5">Order</label>
              <input name="order" type="number" value={form.order} onChange={handleChange} className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[#666] text-xs block mb-1.5">Description (optional)</label>
              <textarea name="description" rows={2} value={form.description} onChange={handleChange} className={inputClass + " resize-none"} placeholder="Short description..." />
            </div>
            <div className="sm:col-span-2 flex gap-3 justify-end">
              <button type="button" onClick={cancel} className="text-[#666] text-sm px-5 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
              <button type="submit" disabled={saving} className="bg-[#232323] text-white text-sm px-6 py-2.5 rounded-lg hover:bg-[#C08A6F] transition-colors disabled:opacity-50">
                {saving ? "Saving..." : editing ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="skeleton h-5 w-5 shrink-0 rounded" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-40" />
                <div className="skeleton h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tree view */}
      {!isLoading && tree.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-[#666] text-sm mb-4">No categories yet.</p>
          <button onClick={() => openNew(1)} className="text-[#C08A6F] text-sm hover:underline">Create your first category</button>
        </div>
      )}

      {!isLoading && tree.length > 0 && (
        <div className="space-y-4">
          {tree.map((l1) => (
            <div key={l1._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Level 1 row */}
              <div className={`flex items-center justify-between px-5 py-4 ${editing === l1._id ? "bg-[#FAF8F5]" : ""}`}>
                <div className="flex items-center gap-3">
                  <span className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium ${LEVEL_COLORS[1]}`}>Main</span>
                  <h3 className="font-medium text-[#1A1A1A] text-sm">{l1.title}</h3>
                  <span className="text-[#999] text-xs font-mono">/{l1.slug}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => openNew(2, l1._id)} title="Add sub-section" className="text-[#999] hover:text-[#C08A6F] p-1.5 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  </button>
                  <button onClick={() => openEdit(l1)} title="Edit" className="text-[#999] hover:text-[#1A1A1A] p-1.5 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                    </svg>
                  </button>
                  <button onClick={() => setDeleteTarget(l1)} title="Delete" className="text-[#999] hover:text-red-500 p-1.5 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Level 2 children */}
              {l1.children.length > 0 && (
                <div className="border-t border-gray-100">
                  {l1.children.map((l2) => (
                    <div key={l2._id}>
                      <div className={`flex items-center justify-between px-5 py-3 pl-10 ${editing === l2._id ? "bg-[#FAF8F5]" : "bg-gray-50/50"}`}>
                        <div className="flex items-center gap-3">
                          <span className="text-[#ccc] text-xs">├─</span>
                          <span className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium ${LEVEL_COLORS[2]}`}>Sub</span>
                          <span className="text-[#1A1A1A] text-sm">{l2.title}</span>
                          <span className="text-[#999] text-xs font-mono">/{l2.slug}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => openNew(3, l2._id)} title="Add tag" className="text-[#999] hover:text-[#C08A6F] p-1.5 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                          </button>
                          <button onClick={() => openEdit(l2)} title="Edit" className="text-[#999] hover:text-[#1A1A1A] p-1.5 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                            </svg>
                          </button>
                          <button onClick={() => setDeleteTarget(l2)} title="Delete" className="text-[#999] hover:text-red-500 p-1.5 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Level 3 children (tags) */}
                      {l2.children.length > 0 && (
                        <div>
                          {l2.children.map((l3) => (
                            <div key={l3._id} className={`flex items-center justify-between px-5 py-2.5 pl-16 ${editing === l3._id ? "bg-[#FAF8F5]" : ""}`}>
                              <div className="flex items-center gap-3">
                                <span className="text-[#ddd] text-xs">│ └─</span>
                                <span className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium ${LEVEL_COLORS[3]}`}>Tag</span>
                                <span className="text-[#444] text-sm">{l3.title}</span>
                                <span className="text-[#bbb] text-xs font-mono">/{l3.slug}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <button onClick={() => openEdit(l3)} title="Edit" className="text-[#bbb] hover:text-[#1A1A1A] p-1.5 transition-colors">
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                                  </svg>
                                </button>
                                <button onClick={() => setDeleteTarget(l3)} title="Delete" className="text-[#bbb] hover:text-red-500 p-1.5 transition-colors">
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation */}
      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Category"
        message={`"${deleteTarget?.title || ""}" will be permanently removed. Categories with children or linked products cannot be deleted.`}
        confirmLabel={deleting ? "Deleting..." : "Delete"}
        danger
        loading={!!deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}

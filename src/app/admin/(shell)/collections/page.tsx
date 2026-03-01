"use client";

import { useToast } from "@/components/admin/Toast";
import ConfirmModal from "@/components/admin/ConfirmModal";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import useSWR from "swr";

interface Collection {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  status?: string;
  image?: { url: string };
  productCount?: number;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function CollectionsPage() {
  const { toast } = useToast();
  const { data: collections = [], isLoading: loading, mutate } = useSWR<Collection[]>(
    "/api/admin/collections",
    fetcher,
    { revalidateOnFocus: true }
  );
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/collections/${deleteTarget.id}`, { method: "DELETE" });
      if (res.ok) {
        mutate(collections.filter((c) => c._id !== deleteTarget.id), false);
        toast("Collection deleted");
        setDeleteTarget(null);
        mutate();
      } else {
        toast("Failed to delete collection", "error");
      }
    } catch {
      toast("Something went wrong", "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-[#1A1A1A]">Collections</h1>
          <p className="text-[#666] text-sm mt-1">
            {loading ? "Loading..." : `${collections.length} collection${collections.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Link
          href="/admin/collections/new"
          className="inline-flex items-center gap-2 bg-[#232323] text-white text-sm px-5 py-2.5 rounded-lg hover:bg-[#C08A6F] transition-colors self-start"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Collection
        </Link>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="skeleton h-40 w-full rounded-none" />
              <div className="p-4 space-y-2">
                <div className="skeleton h-4 w-3/4" />
                <div className="skeleton h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && collections.length === 0 && (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12 mx-auto text-gray-300 mb-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 0 1-1.125-1.125v-3.75ZM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 0 1-1.125-1.125v-8.25ZM3.75 16.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 0 1-1.125-1.125v-2.25Z" />
          </svg>
          <p className="text-[#666] mb-4">No collections yet</p>
          <Link
            href="/admin/collections/new"
            className="inline-flex items-center gap-2 bg-[#232323] text-white text-sm px-5 py-2.5 rounded-lg hover:bg-[#C08A6F] transition-colors"
          >
            Create your first collection
          </Link>
        </div>
      )}

      {/* Collection grid */}
      {!loading && collections.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {collections.map((col) => (
            <div key={col._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden group hover:border-[#C08A6F]/30 transition-colors">
              {/* Image */}
              <div className="relative h-40 bg-gray-100">
                {col.image?.url ? (
                  <Image src={col.image.url} alt={col.title} fill className="object-cover" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-10 h-10">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                    </svg>
                  </div>
                )}
                {/* Status badge */}
                <span
                  className={`absolute top-3 right-3 text-[10px] font-medium uppercase tracking-wider px-2.5 py-1 rounded-full ${
                    col.status === "published"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {col.status || "draft"}
                </span>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-medium text-[#1A1A1A] mb-1 truncate">{col.title}</h3>
                {col.description && (
                  <p className="text-[#666] text-xs line-clamp-2 mb-3">{col.description}</p>
                )}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <Link
                    href={`/admin/collections/${col._id}`}
                    className="text-[#C08A6F] text-xs hover:underline"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => setDeleteTarget({ id: col._id, title: col.title })}
                    className="text-red-400 text-xs hover:text-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Collection"
        message={`"${deleteTarget?.title || "This collection"}" will be permanently removed. This action cannot be undone.`}
        confirmLabel={deleting ? "Deleting..." : "Delete"}
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}

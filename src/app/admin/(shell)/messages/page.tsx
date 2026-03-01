"use client";

import ConfirmModal from "@/components/admin/ConfirmModal";
import { useToast } from "@/components/admin/Toast";
import { useState } from "react";
import useSWR from "swr";

type Message = {
  _id: string;
  _createdAt: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function AdminMessagesPage() {
  const { toast } = useToast();
  const {
    data: messages = [],
    isLoading,
    isValidating,
    mutate,
  } = useSWR<Message[]>("/api/admin/contact", fetcher, {
    refreshInterval: 30000,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  });

  const [selected, setSelected] = useState<Message | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Message | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  async function handleToggleRead(msg: Message) {
    const next = !msg.read;
    mutate(
      messages.map((m) => (m._id === msg._id ? { ...m, read: next } : m)),
      false
    );
    if (selected?._id === msg._id) setSelected({ ...msg, read: next });
    try {
      const res = await fetch(`/api/admin/contact/${msg._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: next }),
      });
      if (!res.ok) throw new Error();
      mutate();
    } catch {
      mutate();
      if (selected?._id === msg._id) setSelected(msg);
      toast("Failed to update message", "error");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/contact/${deleteTarget._id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        mutate(
          messages.filter((m) => m._id !== deleteTarget._id),
          false
        );
        if (selected?._id === deleteTarget._id) setSelected(null);
        toast("Message deleted");
        setDeleteTarget(null);
        mutate();
      } else {
        toast("Failed to delete message", "error");
      }
    } catch {
      toast("Something went wrong", "error");
    } finally {
      setDeleting(false);
    }
  }

  function handleOpen(msg: Message) {
    setSelected(msg);
    if (!msg.read) handleToggleRead(msg);
  }

  const filtered = messages.filter((m) => {
    if (filter === "unread") return !m.read;
    if (filter === "read") return m.read;
    return true;
  });

  const unreadCount = messages.filter((m) => !m.read).length;

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-[#1A1A1A] flex items-center gap-2">
            Messages
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center bg-[#C08A6F] text-white text-[10px] font-semibold rounded-full w-5 h-5">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-[#666] text-sm mt-1">
            {isLoading
              ? "Loading..."
              : `${messages.length} total · ${unreadCount} unread`}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Manual refresh */}
          <button
            onClick={() => mutate()}
            disabled={isValidating}
            title="Refresh messages"
            className="flex items-center gap-1.5 text-[#666] hover:text-[#1A1A1A] text-xs border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={`w-3.5 h-3.5 ${isValidating ? "animate-spin" : ""}`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
              />
            </svg>
            {isValidating ? "Refreshing..." : "Refresh"}
          </button>

          {/* Filter tabs */}
          <div className="flex gap-2">
            {(["all", "unread", "read"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-xs px-4 py-2 rounded-lg border transition-colors capitalize ${
                  filter === f
                    ? "bg-[#232323] text-white border-[#232323]"
                    : "bg-white text-[#666] border-gray-200 hover:border-gray-300"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4">
              <div className="skeleton w-2 h-2 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-3 w-40" />
                <div className="skeleton h-2 w-64" />
              </div>
              <div className="skeleton h-3 w-20 hidden sm:block" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1}
            stroke="currentColor"
            className="w-12 h-12 mx-auto text-gray-300 mb-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
            />
          </svg>
          <p className="text-[#666] text-sm">
            {filter === "all" ? "No messages yet" : `No ${filter} messages`}
          </p>
        </div>
      ) : (
        <div className="flex gap-5 h-[calc(100vh-12rem)] min-h-[400px]">
          {/* Message list */}
          <div
            className={`bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 overflow-y-auto flex-shrink-0 transition-all ${
              selected
                ? "hidden lg:flex lg:flex-col lg:w-80 xl:w-96"
                : "w-full flex flex-col"
            }`}
          >
            {filtered.map((msg) => (
              <button
                key={msg._id}
                onClick={() => handleOpen(msg)}
                className={`w-full text-left px-4 py-4 hover:bg-gray-50 transition-colors flex items-start gap-3 ${
                  selected?._id === msg._id ? "bg-[#FDF9F7]" : ""
                }`}
              >
                <span
                  className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${
                    msg.read ? "bg-transparent" : "bg-[#C08A6F]"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span
                      className={`text-sm truncate ${
                        !msg.read
                          ? "font-semibold text-[#1A1A1A]"
                          : "font-medium text-[#444]"
                      }`}
                    >
                      {msg.name}
                    </span>
                    <span className="text-[10px] text-[#999] shrink-0">
                      {new Date(msg._createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <p
                    className={`text-xs truncate ${
                      !msg.read ? "text-[#444]" : "text-[#888]"
                    }`}
                  >
                    {msg.subject || "(No subject)"}
                  </p>
                  <p className="text-xs text-[#aaa] truncate mt-0.5">
                    {msg.message}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Message detail */}
          {selected && (
            <div className="flex-1 bg-white rounded-xl border border-gray-200 flex flex-col overflow-hidden">
              <div className="px-5 sm:px-6 py-4 border-b border-gray-100 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <button
                    onClick={() => setSelected(null)}
                    className="lg:hidden mb-3 text-[#666] hover:text-[#1A1A1A] transition-colors flex items-center gap-1.5 text-xs"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                      />
                    </svg>
                    Back
                  </button>
                  <h2 className="font-semibold text-[#1A1A1A] text-base leading-snug">
                    {selected.subject || "(No subject)"}
                  </h2>
                  <p className="text-[#666] text-xs mt-1">
                    From{" "}
                    <span className="font-medium text-[#444]">{selected.name}</span>{" "}
                    &lt;
                    <a
                      href={`mailto:${selected.email}`}
                      className="text-[#C08A6F] hover:underline"
                    >
                      {selected.email}
                    </a>
                    &gt; &nbsp;·&nbsp; {formatDate(selected._createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleToggleRead(selected)}
                    title={selected.read ? "Mark as unread" : "Mark as read"}
                    className="text-[#666] hover:text-[#1A1A1A] transition-colors p-1.5 rounded-lg hover:bg-gray-100"
                  >
                    {selected.read ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 9v.906a2.25 2.25 0 0 1-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 0 0 1.183 1.981l6.478 3.488m8.839 2.51-4.66-2.51m0 0-1.023-.55a2.25 2.25 0 0 0-2.134 0l-1.022.55m0 0-4.661 2.51m16.5 1.615a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V8.844a2.25 2.25 0 0 1 1.183-1.981l7.5-4.039a2.25 2.25 0 0 1 2.134 0l7.5 4.039a2.25 2.25 0 0 1 1.183 1.98V19.5Z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={() => setDeleteTarget(selected)}
                    title="Delete message"
                    className="text-red-400 hover:text-red-600 transition-colors p-1.5 rounded-lg hover:bg-red-50"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5">
                <p className="text-[#333] text-sm leading-relaxed whitespace-pre-wrap">
                  {selected.message}
                </p>
              </div>

              <div className="px-5 sm:px-6 py-4 border-t border-gray-100">
                <a
                  href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject || "")}`}
                  className="inline-flex items-center gap-2 bg-[#232323] text-white text-xs px-5 py-2.5 rounded-lg hover:bg-[#C08A6F] transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
                  </svg>
                  Reply via Email
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Message"
        message={`Delete the message from ${deleteTarget?.name || "this sender"}? This cannot be undone.`}
        confirmLabel={deleting ? "Deleting..." : "Delete"}
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}

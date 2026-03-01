import type { Metadata } from "next";
import { ToastProvider } from "@/components/admin/Toast";

export const metadata: Metadata = {
  title: "JANES Admin",
  robots: "noindex, nofollow",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div data-admin="" className="min-h-screen bg-[#f8fafc]">
      <ToastProvider>{children}</ToastProvider>
    </div>
  );
}

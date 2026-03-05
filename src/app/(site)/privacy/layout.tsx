import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://janes.com";

export const metadata: Metadata = {
  title: "Privacy Policy | JANES",
  description:
    "Read the JANES privacy policy. Learn how we collect, use, and protect your personal information when you shop at Nigeria's premium contemporary fashion store.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: "Privacy Policy | JANES",
    description: "How JANES handles your personal data and protects your privacy.",
    url: `${siteUrl}/privacy`,
    type: "website",
  },
  robots: { index: false, follow: true },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}

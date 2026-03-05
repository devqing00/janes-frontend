import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://janes.com";

export const metadata: Metadata = {
  title: "Terms of Service | JANES",
  description:
    "Review JANES terms and conditions governing use of our website, product purchases, and the rights and obligations of customers shopping at Nigeria's premium fashion brand.",
  alternates: { canonical: "/terms" },
  openGraph: {
    title: "Terms of Service | JANES",
    description: "Terms and conditions for shopping at JANES.",
    url: `${siteUrl}/terms`,
    type: "website",
  },
  robots: { index: false, follow: true },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}

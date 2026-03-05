import type { Metadata } from "next";
import type { ReactNode } from "react";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://janes.com";

export const metadata: Metadata = {
  title: "FAQ | JANES — Frequently Asked Questions",
  description:
    "Find answers to common questions about JANES — shipping to Nigeria and worldwide, returns policy, fabric orders, sizing, payment methods, and more.",
  keywords: [
    "JANES FAQ", "Nigerian fashion FAQ", "shipping Nigeria", "JANES returns policy",
    "fabric ordering Nigeria", "JANES sizing guide", "payment methods JANES",
  ],
  alternates: { canonical: "/faq" },
  openGraph: {
    title: "FAQ | JANES — Frequently Asked Questions",
    description: "Common questions about JANES: shipping, returns, sizing, fabric orders, and payment methods.",
    url: `${siteUrl}/faq`,
    type: "website",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Do you ship internationally?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, JANES ships worldwide. Domestic Nigerian orders typically arrive within 3–5 business days; international orders within 7–14 business days.",
      },
    },
    {
      "@type": "Question",
      name: "What is your returns policy?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We accept returns within 14 days of delivery for unused items in original condition. Custom and fabric orders are non-refundable.",
      },
    },
    {
      "@type": "Question",
      name: "How do I find my size?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Each product page includes a sizing guide. You can also contact us for personalised sizing assistance.",
      },
    },
    {
      "@type": "Question",
      name: "Can I order fabric by the yard?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Select fabric products are available per yard or per length. Pricing is shown per unit on the product page.",
      },
    },
  ],
};

export default function FAQLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {children}
    </>
  );
}

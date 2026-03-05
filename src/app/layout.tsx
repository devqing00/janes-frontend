import type { Metadata } from "next";
import localFont from "next/font/local";
import { Montserrat } from "next/font/google";
import "./globals.css";

const saolDisplay = localFont({
  src: "../../public/assets/fonts/SaolDisplay-Regular.ttf",
  variable: "--font-saol",
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "JANES — Premium Nigerian Fashion Brand",
    template: "%s | JANES",
  },
  description:
    "Shop JANES — Nigeria's premium contemporary fashion brand. Discover Ankara fabrics, Aso-Oke collections, womenswear, menswear, and bespoke African print designs. Delivered across Lagos and Nigeria.",
  keywords: [
    "Nigerian fashion brand",
    "African fashion Nigeria",
    "Ankara fabric online",
    "Aso-Oke collection",
    "Nigerian designer clothing",
    "Lagos fashion brand",
    "African print dresses",
    "Nigerian womenswear",
    "buy fabric Nigeria",
    "premium African fashion",
    "JANES fashion",
    "Nigerian clothing store",
    "Adire fabric Nigeria",
    "Nigerian wedding attire",
  ],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://janes.com"),
  openGraph: {
    title: "JANES — Premium Nigerian Fashion Brand",
    description: "Nigeria's premier contemporary fashion brand. Shop Ankara, Aso-Oke, womenswear & bespoke African designs.",
    siteName: "JANES",
    type: "website",
    locale: "en_NG",
    url: "/",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "JANES Fashion" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "JANES — Premium Nigerian Fashion Brand",
    description: "Nigeria's premier contemporary fashion brand. Shop Ankara, Aso-Oke & bespoke African designs.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  alternates: { canonical: "/" },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${saolDisplay.variable} ${montserrat.variable} antialiased bg-brand-bg text-brand-text`}
      >
        {children}
      </body>
    </html>
  );
}

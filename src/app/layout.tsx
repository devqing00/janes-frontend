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
  title: "JANES — Luxurious & Contemporary Fashion",
  description:
    "Premium fashion portfolio and e-commerce platform featuring womenswear, menswear, and raw fabrics by JANES.",
  openGraph: {
    title: "JANES — Luxurious & Contemporary Fashion",
    description: "Premium fashion for the modern individual.",
    siteName: "JANES",
    type: "website",
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

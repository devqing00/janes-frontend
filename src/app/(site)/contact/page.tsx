import ContactPageClient from "@/components/ContactPageClient";
import { client } from "@/lib/sanity";

export const metadata = {
  title: "Contact | JANES — Get in Touch",
  description:
    "Contact JANES for styling consultations, wholesale inquiries, fabric orders, and customer support. We're based in Lagos, Nigeria and available to assist you.",
  keywords: [
    "contact JANES fashion", "JANES Lagos contact", "Nigerian fashion wholesale inquiry",
    "styling consultation Nigeria", "JANES customer service",
  ],
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact | JANES — Get in Touch",
    description: "Reach out to JANES for styling, wholesale, or customer support. Based in Lagos, Nigeria.",
    url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://janes.com"}/contact`,
    type: "website",
  },
};

async function getContactInfo() {
  try {
    const settings = await client.fetch(
      `*[_type == "siteSettings"][0]{ email, phone, address, instagramHandle }`
    );
    return {
      email: settings?.email || "",
      phone: settings?.phone || "",
      address: settings?.address || "",
      instagram: settings?.instagramHandle || "",
    };
  } catch {
    return { email: "", phone: "", address: "", instagram: "" };
  }
}

export default async function ContactPage() {
  const info = await getContactInfo();
  return <ContactPageClient contactInfo={info} />;
}

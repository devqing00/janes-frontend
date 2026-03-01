import ContactPageClient from "@/components/ContactPageClient";
import { client } from "@/lib/sanity";

export const metadata = {
  title: "Contact — JANES",
  description: "Get in touch with JANES for styling, wholesale, or general inquiries.",
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

import LookbookPageClient from "@/components/LookbookPageClient";
import { client } from "@/lib/sanity";

export const metadata = {
  title: "Lookbook | JANES — Editorial Fashion Photography",
  description:
    "Explore the JANES lookbook — a visual diary of our latest Nigerian fashion collections captured with editorial artistry. Discover styling inspiration rooted in contemporary African culture.",
  keywords: [
    "JANES lookbook", "Nigerian fashion editorial", "African fashion photography",
    "Lagos fashion lookbook", "contemporary African style", "JANES fashion campaign",
  ],
  alternates: { canonical: "/lookbook" },
  openGraph: {
    title: "Lookbook | JANES — Editorial Fashion Photography",
    description: "A visual diary of JANES latest collections — editorial fashion photography celebrating African aesthetics.",
    url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://janes.com"}/lookbook`,
    type: "website",
  },
};

async function getLookbookContent() {
  try {
    const settings = await client.fetch(
      `*[_type == "siteSettings"][0]{
        lookbookTitle,
        lookbookSubtitle,
        lookbookDescription,
        lookbookImages[]{ "url": image.asset->url, caption }
      }`
    );
    return settings;
  } catch (err) {
    console.error("Failed to fetch lookbook content:", err);
    return null;
  }
}

export default async function LookbookPage() {
  const content = await getLookbookContent();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const images = content?.lookbookImages?.map((l: any) => ({
    src: l.url || "",
    alt: l.caption || "",
  })).filter((img: { src: string }) => img.src);

  return (
    <LookbookPageClient
      title={content?.lookbookTitle}
      titleItalic={content?.lookbookSubtitle}
      description={content?.lookbookDescription}
      images={images}
    />
  );
}

import LookbookPageClient from "@/components/LookbookPageClient";
import { client } from "@/lib/sanity";

export const metadata = {
  title: "Lookbook — JANES",
  description: "A visual diary of our latest collection captured in editorial style.",
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

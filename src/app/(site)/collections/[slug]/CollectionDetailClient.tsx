"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import PageHero from "@/components/PageHero";

interface Collection {
  _id: string;
  title: string;
  slug: string;
  description: string;
  season?: string;
  year?: string;
  image: string | null;
  heroImages?: string[];
  lookbookImages?: string[];
}

export default function CollectionDetailClient({ collection }: { collection: Collection }) {
  const allImages = [
    ...(collection.heroImages || []),
    ...(collection.lookbookImages || []),
  ].filter(Boolean);

  return (
    <>
      <PageHero
        title={collection.title}
        subtitle={[collection.season, collection.year].filter(Boolean).join(" ") || "Collection"}
        description={collection.description}
      />

      {/* Lookbook-style image grid */}
      {allImages.length > 0 && (
        <section className="bg-brand-bg py-16 md:py-24">
          <div className="mx-auto max-w-[1440px] px-6 md:px-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {allImages.map((url, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ delay: i * 0.08, duration: 0.6 }}
                  className={i === 0 ? "md:col-span-2" : ""}
                >
                  <div
                    className={`relative overflow-hidden bg-[#F5F0EB] ${
                      i === 0 ? "aspect-[16/9]" : "aspect-[3/4]"
                    }`}
                  >
                    <Image
                      src={url}
                      alt={`${collection.title} — Image ${i + 1}`}
                      fill
                      className="object-cover"
                      sizes={i === 0 ? "100vw" : "(max-width: 768px) 100vw, 50vw"}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {allImages.length === 0 && (
        <section className="bg-brand-bg py-16 md:py-24">
          <div className="mx-auto max-w-[1440px] px-6 md:px-12 text-center">
            <p className="text-brand-muted text-sm">
              Images for this collection will be available soon.
            </p>
          </div>
        </section>
      )}

      {/* Back link */}
      <section className="bg-brand-bg pb-16 md:pb-24">
        <div className="mx-auto max-w-[1440px] px-6 md:px-12 text-center">
          <Link
            href="/collections"
            className="inline-block uppercase text-[10px] tracking-[0.2em] text-[#666] border-b border-[#666]/30 pb-1 hover:border-[#C08A6F] hover:text-[#C08A6F] transition-colors"
          >
            ← All Collections
          </Link>
        </div>
      </section>
    </>
  );
}

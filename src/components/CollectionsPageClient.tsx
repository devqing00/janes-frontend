"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import PageHero from "@/components/PageHero";

interface Collection {
  _id: string;
  title: string;
  slug: string;
  description: string;
  image: string | null;
  images: (string | null)[];
  season?: string;
  year?: number;
}

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" as const },
  },
};

export default function CollectionsPageClient() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCollections() {
      try {
        const res = await fetch("/api/collections");
        if (res.ok) {
          const data = await res.json();
          setCollections(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Failed to fetch collections:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCollections();
  }, []);

  return (
    <>
      <PageHero
        title="Collections"
        subtitle="Seasonal Archives"
        description="Each collection is a chapter in our ongoing story — explore the evolution of JANES across seasons."
      />

      <section className="bg-brand-bg">
        {loading && (
          <div className="py-24 md:py-36">
            <div className="mx-auto max-w-[1440px] px-6 md:px-12">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="grid grid-cols-12 gap-6 md:gap-10 items-center mb-20">
                  <div className="col-span-12 md:col-span-5 space-y-4">
                    <div className="bg-brand-light h-4 w-24 animate-pulse rounded" />
                    <div className="bg-brand-light h-12 w-64 animate-pulse rounded" />
                    <div className="bg-brand-light h-16 w-full animate-pulse rounded" />
                  </div>
                  <div className="col-span-12 md:col-span-7 grid grid-cols-2 gap-3">
                    <div className="aspect-[3/4] bg-brand-light animate-pulse rounded" />
                    <div className="aspect-[3/4] bg-brand-light animate-pulse rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && collections.length === 0 && (
          <div className="py-24 md:py-36 text-center">
            <p className="text-brand-muted text-sm">No collections available yet.</p>
          </div>
        )}

        {!loading && collections.map((col, idx) => {
          const collectionImages = (col.images || []).filter(Boolean);
          const displayImage = collectionImages[0] || col.image;

          return (
            <div
              key={col._id}
              className={`py-24 md:py-36 ${
                idx % 2 === 1 ? "bg-white" : "bg-brand-bg"
              }`}
            >
              <div className="mx-auto max-w-[1440px] px-6 md:px-12">
                <div
                  className={`grid grid-cols-12 gap-6 md:gap-10 items-center ${
                    idx % 2 === 1 ? "md:direction-rtl" : ""
                  }`}
                >
                  {/* Text */}
                  <motion.div
                    className={`col-span-12 md:col-span-5 ${
                      idx % 2 === 1 ? "md:order-2" : ""
                    }`}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={fadeUp}
                  >
                    <p className="text-brand-muted uppercase text-[10px] tracking-widest mb-4">
                      Collection {String(idx + 1).padStart(2, "0")}
                    </p>
                    <h2 className="font-serif text-brand-text text-4xl sm:text-5xl md:text-6xl leading-[1.05]">
                      {col.title}
                    </h2>
                    {col.description && (
                      <p className="text-brand-muted text-sm leading-relaxed mt-6 max-w-md">
                        {col.description}
                      </p>
                    )}
                    <Link
                      href={`/collections/${col.slug}`}
                      className="inline-block mt-8 bg-brand-accent text-white uppercase text-[10px] tracking-[0.2em] px-8 py-3 hover:bg-brand-accent/90 transition-all"
                    >
                      View Collection
                    </Link>
                  </motion.div>

                  {/* Images */}
                  <div
                    className={`col-span-12 md:col-span-7 ${
                      idx % 2 === 1 ? "md:order-1" : ""
                    }`}
                  >
                    {displayImage ? (
                      <motion.div
                        className="aspect-[3/4] relative overflow-hidden"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={fadeUp}
                      >
                        <Image
                          src={displayImage}
                          alt={col.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 58vw"
                        />
                      </motion.div>
                    ) : (
                      <div className="aspect-[3/4] bg-brand-light flex items-center justify-center text-brand-muted text-sm">
                        No Image
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </section>
    </>
  );
}

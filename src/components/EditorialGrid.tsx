"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useLocale } from "@/components/LocaleProvider";

/* ── Layout config mapped by index ── */
const LAYOUT = [
  { span: "md:col-span-7 md:row-span-2", aspect: "aspect-[4/5] md:aspect-auto md:h-full" },
  { span: "md:col-span-5", aspect: "aspect-[3/4]" },
  { span: "md:col-span-5", aspect: "aspect-[3/4]" },
];

const FALLBACK_ITEMS = [
  { image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&q=80", title: "The Art of Draping", category: "Editorial" },
  { image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80", title: "Bold Colour", category: "Trend Report" },
  { image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&q=80", title: "Structured Ease", category: "Styling" },
];

export interface EditorialItemData {
  image: string;
  title: string;
  category: string;
}

export interface EditorialGridProps {
  items?: EditorialItemData[];
}

export default function EditorialGrid({ items }: EditorialGridProps) {
  const { t } = useLocale();
  const editorialItems = items && items.length > 0 ? items : [
    { image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&q=80", title: t("home.editorialItem1Title"), category: t("home.editorialItem1Category") },
    { image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80", title: t("home.editorialItem2Title"), category: t("home.editorialItem2Category") },
    { image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&q=80", title: t("home.editorialItem3Title"), category: t("home.editorialItem3Category") },
  ];
  return (
    <section className="bg-[#FAF8F5] py-24 md:py-36">
      <div className="mx-auto max-w-[1440px] px-6 md:px-12">
        <motion.div
          className="mb-16 md:mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
        >
          <p className="text-[#666] uppercase text-[10px] tracking-[0.3em] mb-3">
            {t("home.editorialLabel")}
          </p>
          <h2 className="font-serif text-[#1A1A1A] text-4xl sm:text-5xl md:text-6xl leading-[1.05]">
            {t("home.editorialHeading1")} <span className="italic font-normal">{t("home.editorialHeading2")}</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-5">
          {editorialItems.map((item, i) => {
            const layout = LAYOUT[i] || LAYOUT[LAYOUT.length - 1];
            return (
              <motion.div
                key={item.title + i}
                className={layout.span}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ delay: i * 0.12, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <Link href="/lookbook" className="group block relative overflow-hidden h-full">
                  <div className={`relative ${layout.aspect} min-h-[300px]`}>
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-[1.04] transition-transform duration-[1s]"
                      sizes={i === 0 ? "(max-width: 768px) 100vw, 58vw" : "(max-width: 768px) 100vw, 42vw"}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                      <p className="text-white/60 uppercase text-[9px] tracking-[0.2em] mb-1">
                        {item.category}
                      </p>
                      <h3 className="font-serif text-white text-xl md:text-2xl">
                        {item.title}
                      </h3>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

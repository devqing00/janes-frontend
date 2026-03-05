"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import PageHero from "@/components/PageHero";
import { useLocale } from "@/components/LocaleProvider";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" as const },
  },
};

export default function AboutPageClient() {
  const { t } = useLocale();
  return (
    <>
      <PageHero
        title={t("about.title")}
        titleItalic={t("about.titleItalic")}
        subtitle={t("about.subtitle")}
        description={t("about.description")}
      />

      {/* Story section */}
      <section className="bg-brand-bg py-24 md:py-40">
        <div className="mx-auto max-w-[1440px] px-6 md:px-12">
          <div className="grid grid-cols-12 gap-8 md:gap-14 items-center">
            <motion.div
              className="col-span-12 md:col-span-6 aspect-[3/4] relative overflow-hidden"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeUp}
            >
              <Image
                src="https://images.pexels.com/photos/28988328/pexels-photo-28988328.jpeg?auto=compress&cs=tinysrgb&w=800&q=80"
                alt="JANES atelier"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </motion.div>

            <motion.div
              className="col-span-12 md:col-span-6"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={{
                hidden: { opacity: 0, y: 40 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    delay: 0.2,
                    duration: 0.8,
                    ease: "easeOut" as const,
                  },
                },
              }}
            >
              <p className="text-brand-muted uppercase text-[10px] tracking-widest mb-6">
                {t("about.storyLabel")}
              </p>
              <h2 className="font-serif text-brand-text text-4xl sm:text-5xl md:text-6xl leading-[1.05]">
                {t("about.storyHeading1")}{" "}
                <span className="italic font-normal">{t("about.storyHeading2")}</span>
              </h2>
              <div className="mt-8 space-y-5 text-brand-muted text-sm leading-relaxed max-w-lg">
                <p>
                  {t("about.storyParagraph1")}
                </p>
                <p>
                  {t("about.storyParagraph2")}
                </p>
                <p>
                  {t("about.storyParagraph3")}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values section */}
      <section className="bg-white py-24 md:py-36">
        <div className="mx-auto max-w-[1440px] px-6 md:px-12">
          <motion.div
            className="text-center mb-16 md:mb-24"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
          >
            <p className="text-brand-muted uppercase text-[10px] tracking-widest mb-4">
              {t("about.valuesLabel")}
            </p>
            <h2 className="font-serif text-brand-text text-4xl sm:text-5xl md:text-6xl leading-[1.05]">
              {t("about.valuesHeading1")} <span className="italic font-normal">{t("about.valuesHeading2")}</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            {[
              {
                title: t("about.craftsmanshipTitle"),
                desc: t("about.craftsmanshipDesc"),
              },
              {
                title: t("about.sustainabilityTitle"),
                desc: t("about.sustainabilityDesc"),
              },
              {
                title: t("about.timelessnessTitle"),
                desc: t("about.timelessnessDesc"),
              },
            ].map((value, i) => (
              <motion.div
                key={value.title}
                className="text-center"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: {
                      delay: i * 0.12,
                      duration: 0.7,
                      ease: "easeOut" as const,
                    },
                  },
                }}
              >
                <p className="text-brand-accent uppercase text-[10px] tracking-widest mb-3">
                  0{i + 1}
                </p>
                <h3 className="font-serif text-brand-text text-2xl md:text-3xl mb-4">
                  {value.title}
                </h3>
                <p className="text-brand-muted text-sm leading-relaxed max-w-sm mx-auto">
                  {value.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Full-width image break */}
      <section className="relative h-[50vh] md:h-[70vh] overflow-hidden">
        <Image
          src="https://images.pexels.com/photos/29324632/pexels-photo-29324632.jpeg?auto=compress&cs=tinysrgb&w=1400&q=80"
          alt={t("about.workshopImageAlt")}
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/10" />
      </section>

      {/* Designer note */}
      <section className="bg-brand-bg py-24 md:py-36">
        <div className="mx-auto max-w-[1440px] px-6 md:px-12">
          <motion.div
            className="max-w-2xl mx-auto text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
          >
            <p className="text-brand-muted uppercase text-[10px] tracking-widest mb-6">
              {t("about.designerLabel")}
            </p>
            <blockquote className="font-serif text-brand-text text-2xl sm:text-3xl md:text-4xl leading-snug italic">
              &ldquo;{t("about.designerQuote")}&rdquo;
            </blockquote>
            <p className="text-brand-muted text-sm mt-8 uppercase tracking-widest">
              {t("about.designerAttribution")}
            </p>
          </motion.div>
        </div>
      </section>
    </>
  );
}

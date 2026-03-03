"use client";

import { motion } from "framer-motion";
import PageHero from "@/components/PageHero";
import { useLocale } from "@/components/LocaleProvider";

export default function FAQPage() {
  const { t } = useLocale();

  const faqs = Array.from({ length: 8 }, (_, i) => ({
    question: t(`faq.q${i + 1}`),
    answer: t(`faq.a${i + 1}`),
  }));

  return (
    <>
      <PageHero
        title={t("faq.title")}
        titleItalic={t("faq.titleItalic")}
        subtitle={t("faq.subtitle")}
        description={t("faq.description")}
      />

      <section className="bg-[#FAF8F5] py-24 md:py-36">
        <div className="mx-auto max-w-[900px] px-6 md:px-12">
          <div className="space-y-0">
            {faqs.map((faq, i) => (
              <motion.details
                key={i}
                className="group border-b border-[#1A1A1A]/10"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.05, duration: 0.5 }}
              >
                <summary className="flex items-center justify-between py-6 md:py-8 cursor-pointer list-none">
                  <span className="text-[#1A1A1A] text-sm md:text-base font-medium pr-8">
                    {faq.question}
                  </span>
                  <span className="text-[#C08A6F] text-xl shrink-0 transition-transform duration-300 group-open:rotate-45">
                    +
                  </span>
                </summary>
                <div className="pb-6 md:pb-8 pr-12">
                  <p className="text-[#666] text-sm leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </motion.details>
            ))}
          </div>

          {/* Contact CTA */}
          <motion.div
            className="mt-20 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-[#666] text-sm mb-4">
              {t("faq.ctaPrompt")}
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 bg-[#232323] text-white uppercase text-[10px] tracking-[0.2em] px-8 py-3.5 hover:bg-[#C08A6F] transition-colors duration-300"
            >
              {t("faq.ctaButton")}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </a>
          </motion.div>
        </div>
      </section>
    </>
  );
}

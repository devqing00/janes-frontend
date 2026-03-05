"use client";

import PageHero from "@/components/PageHero";
import { useLocale } from "@/components/LocaleProvider";

export default function TermsPage() {
  const { t } = useLocale();

  return (
    <>
      <PageHero
        title={t("terms.title")}
        titleItalic={t("terms.titleItalic")}
        subtitle={t("terms.subtitle")}
      />

      <section className="bg-[#FAF8F5] py-24 md:py-36">
        <div className="mx-auto max-w-[900px] px-6 md:px-12">
          <div className="animate-fadeIn">
            <p className="text-[#666] text-xs uppercase tracking-widest mb-12">
              {t("terms.lastUpdated")}
            </p>

            <div className="space-y-12 text-[#666] text-sm leading-relaxed">
              <div>
                <h2 className="font-serif text-[#1A1A1A] text-2xl md:text-3xl mb-4">
                  {t("terms.s1Heading")}
                </h2>
                <p>{t("terms.s1p1")}</p>
                <p className="mt-4">{t("terms.s1p2")}</p>
              </div>

              <div>
                <h2 className="font-serif text-[#1A1A1A] text-2xl md:text-3xl mb-4">
                  {t("terms.s2Heading")}
                </h2>
                <p>{t("terms.s2p1")}</p>
                <p className="mt-4">{t("terms.s2p2")}</p>
              </div>

              <div>
                <h2 className="font-serif text-[#1A1A1A] text-2xl md:text-3xl mb-4">
                  {t("terms.s3Heading")}
                </h2>
                <p>{t("terms.s3p")}</p>
              </div>

              <div>
                <h2 className="font-serif text-[#1A1A1A] text-2xl md:text-3xl mb-4">
                  {t("terms.s4Heading")}
                </h2>
                <p>{t("terms.s4p")}</p>
              </div>

              <div>
                <h2 className="font-serif text-[#1A1A1A] text-2xl md:text-3xl mb-4">
                  {t("terms.s5Heading")}
                </h2>
                <p>{t("terms.s5p")}</p>
              </div>

              <div>
                <h2 className="font-serif text-[#1A1A1A] text-2xl md:text-3xl mb-4">
                  {t("terms.s6Heading")}
                </h2>
                <p>{t("terms.s6p")}</p>
              </div>

              <div>
                <h2 className="font-serif text-[#1A1A1A] text-2xl md:text-3xl mb-4">
                  {t("terms.s7Heading")}
                </h2>
                <p>
                  {t("terms.s7p").split("legal@janes.com")[0]}
                  <a href="mailto:legal@janes.com" className="text-[#C08A6F] hover:underline">
                    legal@janes.com
                  </a>
                  {t("terms.s7p").split("legal@janes.com")[1]}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

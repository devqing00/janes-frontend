"use client";

import PageHero from "@/components/PageHero";
import { useLocale } from "@/components/LocaleProvider";

export default function PrivacyPage() {
  const { t } = useLocale();

  return (
    <>
      <PageHero
        title={t("privacy.title")}
        titleItalic={t("privacy.titleItalic")}
        subtitle={t("privacy.subtitle")}
      />

      <section className="bg-[#FAF8F5] py-24 md:py-36">
        <div className="mx-auto max-w-[900px] px-6 md:px-12">
          <div
            className="prose-custom animate-fadeIn"
          >
            <p className="text-[#666] text-xs uppercase tracking-widest mb-12">
              {t("privacy.lastUpdated")}
            </p>

            <div className="space-y-12 text-[#666] text-sm leading-relaxed">
              <div>
                <h2 className="font-serif text-[#1A1A1A] text-2xl md:text-3xl mb-4">
                  {t("privacy.s1Heading")}
                </h2>
                <p>{t("privacy.s1p1")}</p>
                <p className="mt-4">{t("privacy.s1p2")}</p>
              </div>

              <div>
                <h2 className="font-serif text-[#1A1A1A] text-2xl md:text-3xl mb-4">
                  {t("privacy.s2Heading")}
                </h2>
                <ul className="space-y-2 mt-4">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <li key={n} className="flex items-start gap-3">
                      <span className="text-[#C08A6F] mt-1">—</span>
                      {t(`privacy.s2i${n}`)}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h2 className="font-serif text-[#1A1A1A] text-2xl md:text-3xl mb-4">
                  {t("privacy.s3Heading")}
                </h2>
                <p>{t("privacy.s3p")}</p>
              </div>

              <div>
                <h2 className="font-serif text-[#1A1A1A] text-2xl md:text-3xl mb-4">
                  {t("privacy.s4Heading")}
                </h2>
                <p>{t("privacy.s4p")}</p>
              </div>

              <div>
                <h2 className="font-serif text-[#1A1A1A] text-2xl md:text-3xl mb-4">
                  {t("privacy.s5Heading")}
                </h2>
                <p>{t("privacy.s5p")}</p>
              </div>

              <div>
                <h2 className="font-serif text-[#1A1A1A] text-2xl md:text-3xl mb-4">
                  {t("privacy.s6Heading")}
                </h2>
                <p>
                  {t("privacy.s6p").split("privacy@janes.com")[0]}
                  <a href="mailto:privacy@janes.com" className="text-[#C08A6F] hover:underline">
                    privacy@janes.com
                  </a>
                  {t("privacy.s6p").split("privacy@janes.com")[1]}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

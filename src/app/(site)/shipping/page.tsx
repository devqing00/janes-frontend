"use client";

import PageHero from "@/components/PageHero";
import { useLocale } from "@/components/LocaleProvider";

export default function ShippingPage() {
  const { t } = useLocale();

  return (
    <>
      <PageHero
        title={t("shipping.title")}
        titleItalic={t("shipping.titleItalic")}
        subtitle={t("shipping.subtitle")}
        description={t("shipping.description")}
      />

      <section className="bg-[#FAF8F5] py-24 md:py-36">
        <div className="mx-auto max-w-[900px] px-6 md:px-12">
          {/* Shipping */}
          <div className="animate-fadeIn">
            <h2 className="font-serif text-[#1A1A1A] text-3xl md:text-4xl mb-8">{t("shipping.shippingHeading")}</h2>
            <div className="space-y-6 text-[#666] text-sm leading-relaxed">
              <p>{t("shipping.shippingIntro")}</p>

              <div className="border border-[#E8E2DB] p-6 md:p-8 space-y-4">
                <div className="flex justify-between items-start border-b border-[#E8E2DB] pb-4">
                  <div>
                    <p className="text-[#1A1A1A] font-medium text-sm">{t("shipping.domestic")}</p>
                    <p className="text-[#666] text-xs mt-1">{t("shipping.domesticTime")}</p>
                  </div>
                  <p className="text-[#1A1A1A] text-sm">₦3,500</p>
                </div>
                <div className="flex justify-between items-start border-b border-[#E8E2DB] pb-4">
                  <div>
                    <p className="text-[#1A1A1A] font-medium text-sm">{t("shipping.africa")}</p>
                    <p className="text-[#666] text-xs mt-1">{t("shipping.africaTime")}</p>
                  </div>
                  <p className="text-[#1A1A1A] text-sm">$25</p>
                </div>
                <div className="flex justify-between items-start border-b border-[#E8E2DB] pb-4">
                  <div>
                    <p className="text-[#1A1A1A] font-medium text-sm">{t("shipping.intlStandard")}</p>
                    <p className="text-[#666] text-xs mt-1">{t("shipping.intlStandardTime")}</p>
                  </div>
                  <p className="text-[#1A1A1A] text-sm">$35</p>
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[#1A1A1A] font-medium text-sm">{t("shipping.intlExpress")}</p>
                    <p className="text-[#666] text-xs mt-1">{t("shipping.intlExpressTime")}</p>
                  </div>
                  <p className="text-[#1A1A1A] text-sm">$55</p>
                </div>
              </div>

              <p>{t("shipping.shippingNote")}</p>
            </div>
          </div>

          {/* Returns */}
          <div className="mt-20 animate-fadeIn" style={{ animationDelay: "0.15s" }}>
            <h2 className="font-serif text-[#1A1A1A] text-3xl md:text-4xl mb-8">{t("shipping.returnsHeading")}</h2>
            <div className="space-y-6 text-[#666] text-sm leading-relaxed">
              <p>{t("shipping.returnsIntro")}</p>
              <div className="space-y-4">
                <h3 className="text-[#1A1A1A] font-medium text-sm uppercase tracking-widest">
                  {t("shipping.returnConditionsHeading")}
                </h3>
                <ul className="space-y-2 text-[#666] text-sm">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <li key={n} className="flex items-start gap-3">
                      <span className="text-[#C08A6F] mt-1">—</span>
                      {t(`shipping.returnCondition${n}`)}
                    </li>
                  ))}
                </ul>
              </div>
              <p>{t("shipping.returnProcess")}</p>
              <p>{t("shipping.refundTimeline")}</p>
            </div>
          </div>

          {/* Exchanges */}
          <div className="mt-20 animate-fadeIn" style={{ animationDelay: "0.3s" }}>
            <h2 className="font-serif text-[#1A1A1A] text-3xl md:text-4xl mb-8">{t("shipping.exchangesHeading")}</h2>
            <div className="space-y-6 text-[#666] text-sm leading-relaxed">
              <p>{t("shipping.exchangesIntro")}</p>
              <p>{t("shipping.exchangesTip")}</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

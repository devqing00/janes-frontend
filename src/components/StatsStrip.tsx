"use client";

import { useLocale } from "@/components/LocaleProvider";

export default function StatsStrip() {
  const { t } = useLocale();

  const stats = [
    { value: t("stats.designsCount"), label: t("stats.originalDesigns") },
    { value: t("stats.established"), label: t("stats.establishedYear") },
    { value: t("stats.location"), label: t("stats.locationLabel") },
    { value: t("stats.originalPercent"), label: t("stats.originalLabel") },
  ];

  return (
    <div className="bg-white border-b border-brand-text/5 py-6 md:py-8">
      <div className="mx-auto max-w-[1440px] px-6 md:px-12">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-brand-text/8">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className="px-6 md:px-10 first:pl-0 last:pr-0 text-center animate-fadeIn"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <p className="font-serif text-brand-text text-2xl md:text-3xl">{s.value}</p>
              <p className="text-brand-muted uppercase text-[9px] tracking-[0.25em] mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

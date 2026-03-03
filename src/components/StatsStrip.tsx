"use client";

import { motion } from "framer-motion";

const stats = [
  { value: "150+", label: "Original Designs" },
  { value: "EST.", label: "2020" },
  { value: "Lagos,", label: "Nigeria" },
  { value: "100%", label: "Original" },
];

export default function StatsStrip() {
  return (
    <div className="bg-white border-b border-brand-text/5 py-6 md:py-8">
      <div className="mx-auto max-w-[1440px] px-6 md:px-12">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-brand-text/8">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              className="px-6 md:px-10 first:pl-0 last:pr-0 text-center"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
            >
              <p className="font-serif text-brand-text text-2xl md:text-3xl">{s.value}</p>
              <p className="text-brand-muted uppercase text-[9px] tracking-[0.25em] mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

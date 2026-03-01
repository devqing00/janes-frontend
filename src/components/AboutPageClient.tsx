"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import PageHero from "@/components/PageHero";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" as const },
  },
};

export default function AboutPageClient() {
  return (
    <>
      <PageHero
        title="About"
        titleItalic="Us"
        subtitle="Our Story"
        description="Founded on the belief that fashion should be both luxurious and accessible, JANES bridges heritage craftsmanship with modern sensibility."
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
                src="https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&q=80"
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
                The Vision
              </p>
              <h2 className="font-serif text-brand-text text-4xl sm:text-5xl md:text-6xl leading-[1.05]">
                Crafted with{" "}
                <span className="italic font-normal">Passion</span>
              </h2>
              <div className="mt-8 space-y-5 text-brand-muted text-sm leading-relaxed max-w-lg">
                <p>
                  JANES was born from a desire to create fashion that speaks to
                  the modern individual — clothing that is as thoughtfully made
                  as it is beautifully designed.
                </p>
                <p>
                  Every piece begins with the finest raw fabrics sourced from
                  artisan mills across Italy, India, and Japan. Our design
                  process honors traditional tailoring techniques while embracing
                  contemporary silhouettes that move with the body.
                </p>
                <p>
                  We believe in slow fashion — garments that are meant to last,
                  to age gracefully, and to become more cherished with every
                  wear. Quality over quantity, always.
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
              What We Stand For
            </p>
            <h2 className="font-serif text-brand-text text-4xl sm:text-5xl md:text-6xl leading-[1.05]">
              Our <span className="italic font-normal">Values</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            {[
              {
                title: "Craftsmanship",
                desc: "Every stitch, every seam, every button is placed with intention. We work with master tailors who bring decades of experience to each garment.",
              },
              {
                title: "Sustainability",
                desc: "From ethically sourced fabrics to minimal-waste pattern cutting, we're committed to reducing our environmental footprint at every stage.",
              },
              {
                title: "Timelessness",
                desc: "We design beyond trends. Our pieces are made to be wardrobe staples — versatile, enduring, and always elegant.",
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
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1400&q=80"
          alt="JANES workshop"
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
              From the Designer
            </p>
            <blockquote className="font-serif text-brand-text text-2xl sm:text-3xl md:text-4xl leading-snug italic">
              &ldquo;I design for the woman and man who sees clothing as an
              extension of their identity — not a costume, but a quiet
              declaration of self.&rdquo;
            </blockquote>
            <p className="text-brand-muted text-sm mt-8 uppercase tracking-widest">
              — Jane Stitches, Creative Director
            </p>
          </motion.div>
        </div>
      </section>
    </>
  );
}

"use client";

import { motion } from "framer-motion";
import PageHero from "@/components/PageHero";

const faqs = [
  {
    question: "How do I determine my size?",
    answer: "We provide detailed size charts on each product page. For the best fit, we recommend measuring yourself and comparing to our chart. Our garments generally follow a relaxed, contemporary fit. If you're between sizes, we suggest sizing down for a more tailored look or up for an oversized silhouette.",
  },
  {
    question: "What fabrics do you use?",
    answer: "We source our fabrics from artisan mills across Italy, India, and Japan. Our materials include premium cotton, linen, silk, cashmere, and wool blends. Every fabric is selected for its quality, drape, and longevity. We also offer raw fabric rolls for designers and makers.",
  },
  {
    question: "Do you offer international shipping?",
    answer: "Yes, we ship worldwide. Standard international shipping takes 7-14 business days, while express shipping takes 3-5 business days. Shipping costs vary by destination and are calculated at checkout. Orders over $500 qualify for complimentary express shipping.",
  },
  {
    question: "What is your return policy?",
    answer: "We accept returns within 14 days of delivery for unworn items in original condition with all tags attached. Items must be returned in their original packaging. Sale items are final sale. Please visit our Shipping & Returns page for detailed instructions.",
  },
  {
    question: "Do you offer wholesale?",
    answer: "Yes, we work with select boutiques and retailers worldwide. For wholesale inquiries, please contact us at wholesale@janes.com with information about your store and the collections you're interested in.",
  },
  {
    question: "How should I care for my garments?",
    answer: "Each garment comes with specific care instructions on its label. As a general rule, we recommend cold or lukewarm hand washing for delicate items. Avoid tumble drying — instead, lay flat or hang to dry. For cashmere and wool pieces, we recommend professional dry cleaning.",
  },
  {
    question: "Can I visit your showroom?",
    answer: "Our Lagos showroom is open Monday through Saturday, 10am to 7pm WAT. We welcome walk-ins, but we recommend booking an appointment for a personalised styling experience. Contact us at hello@janes.com to schedule your visit.",
  },
  {
    question: "Do you have a loyalty programme?",
    answer: "We're developing an exclusive membership programme that will offer early access to collections, private events, and special pricing. Sign up for our newsletter to be the first to hear about it.",
  },
];

export default function FAQPage() {
  return (
    <>
      <PageHero
        title="Frequently Asked"
        titleItalic="Questions"
        subtitle="Client Care"
        description="Everything you need to know about your JANES experience."
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
              Still have questions?
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 bg-[#232323] text-white uppercase text-[10px] tracking-[0.2em] px-8 py-3.5 hover:bg-[#C08A6F] transition-colors duration-300"
            >
              Contact Us
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

"use client";

import { motion } from "framer-motion";
import PageHero from "@/components/PageHero";

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        title="Privacy"
        titleItalic="Policy"
        subtitle="Legal"
      />

      <section className="bg-[#FAF8F5] py-24 md:py-36">
        <div className="mx-auto max-w-[900px] px-6 md:px-12">
          <motion.div
            className="prose-custom"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-[#666] text-xs uppercase tracking-widest mb-12">
              Last updated: March 2026
            </p>

            <div className="space-y-12 text-[#666] text-sm leading-relaxed">
              <div>
                <h2 className="font-serif text-[#1A1A1A] text-2xl md:text-3xl mb-4">
                  Information We Collect
                </h2>
                <p>
                  When you visit JANES, we collect certain information about your device,
                  your interaction with our site, and information necessary to process your
                  purchases. We may also collect additional information if you contact us
                  for customer support.
                </p>
                <p className="mt-4">
                  Personal information we collect includes: name, email address, shipping
                  address, payment information, and phone number when provided.
                </p>
              </div>

              <div>
                <h2 className="font-serif text-[#1A1A1A] text-2xl md:text-3xl mb-4">
                  How We Use Your Information
                </h2>
                <ul className="space-y-2 mt-4">
                  <li className="flex items-start gap-3">
                    <span className="text-[#C08A6F] mt-1">—</span>
                    To fulfill orders and process transactions
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#C08A6F] mt-1">—</span>
                    To communicate with you about your order
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#C08A6F] mt-1">—</span>
                    To send marketing communications (with your consent)
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#C08A6F] mt-1">—</span>
                    To improve our website and services
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#C08A6F] mt-1">—</span>
                    To comply with legal obligations
                  </li>
                </ul>
              </div>

              <div>
                <h2 className="font-serif text-[#1A1A1A] text-2xl md:text-3xl mb-4">
                  Cookies
                </h2>
                <p>
                  We use cookies and similar technologies to provide a better experience,
                  analyse traffic, and for personalisation. You can manage your cookie
                  preferences through your browser settings.
                </p>
              </div>

              <div>
                <h2 className="font-serif text-[#1A1A1A] text-2xl md:text-3xl mb-4">
                  Data Security
                </h2>
                <p>
                  We implement appropriate technical and organisational measures to protect
                  your personal data against unauthorised access, alteration, disclosure,
                  or destruction. Payment processing is handled securely through our
                  third-party payment provider.
                </p>
              </div>

              <div>
                <h2 className="font-serif text-[#1A1A1A] text-2xl md:text-3xl mb-4">
                  Your Rights
                </h2>
                <p>
                  You have the right to access, correct, or delete your personal information.
                  You may also opt out of marketing communications at any time by clicking
                  the unsubscribe link in our emails or contacting us directly.
                </p>
              </div>

              <div>
                <h2 className="font-serif text-[#1A1A1A] text-2xl md:text-3xl mb-4">
                  Contact
                </h2>
                <p>
                  For questions about this privacy policy or our data practices, please
                  contact us at{" "}
                  <a href="mailto:privacy@janes.com" className="text-[#C08A6F] hover:underline">
                    privacy@janes.com
                  </a>
                  .
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}

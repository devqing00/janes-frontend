"use client";

import { motion } from "framer-motion";
import PageHero from "@/components/PageHero";

export default function TermsPage() {
  return (
    <>
      <PageHero
        title="Terms of"
        titleItalic="Service"
        subtitle="Legal"
      />

      <section className="bg-[#FAF8F5] py-24 md:py-36">
        <div className="mx-auto max-w-[900px] px-6 md:px-12">
          <motion.div
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
                  General Conditions
                </h2>
                <p>
                  By accessing and placing an order with JANES, you confirm that you are in
                  agreement with and bound by the terms and conditions contained herein. These
                  terms apply to the entire website and any communication between you and JANES.
                </p>
                <p className="mt-4">
                  We reserve the right to refuse service to anyone for any reason at any time.
                  Prices for our products are subject to change without notice.
                </p>
              </div>

              <div>
                <h2 className="font-serif text-[#1A1A1A] text-2xl md:text-3xl mb-4">
                  Products & Orders
                </h2>
                <p>
                  We have made every effort to display colours and images of our products as
                  accurately as possible. However, we cannot guarantee that your device&apos;s
                  display of any colour will be completely accurate.
                </p>
                <p className="mt-4">
                  We reserve the right to limit the quantities of any products or services
                  that we offer. All descriptions of products and pricing are subject to
                  change at any time without notice, at our sole discretion.
                </p>
              </div>

              <div>
                <h2 className="font-serif text-[#1A1A1A] text-2xl md:text-3xl mb-4">
                  Payment
                </h2>
                <p>
                  All payments are processed securely. We accept major credit/debit cards
                  and bank transfers. By submitting your payment details, you warrant that
                  you are authorised to use the payment method provided.
                </p>
              </div>

              <div>
                <h2 className="font-serif text-[#1A1A1A] text-2xl md:text-3xl mb-4">
                  Intellectual Property
                </h2>
                <p>
                  All content on this website — including text, graphics, logos, images,
                  and software — is the property of JANES and is protected by copyright
                  and intellectual property laws. You may not reproduce, distribute, or
                  create derivative works from any content without our express written
                  permission.
                </p>
              </div>

              <div>
                <h2 className="font-serif text-[#1A1A1A] text-2xl md:text-3xl mb-4">
                  Limitation of Liability
                </h2>
                <p>
                  JANES shall not be liable for any indirect, incidental, special,
                  consequential, or punitive damages resulting from your use of or
                  inability to use our services. Our total liability shall not exceed
                  the amount paid by you for the specific product or service that gave
                  rise to the claim.
                </p>
              </div>

              <div>
                <h2 className="font-serif text-[#1A1A1A] text-2xl md:text-3xl mb-4">
                  Governing Law
                </h2>
                <p>
                  These terms shall be governed by and construed in accordance with the
                  laws of the Federal Republic of Nigeria. Any disputes arising shall be
                  subject to the exclusive jurisdiction of the courts of Lagos, Nigeria.
                </p>
              </div>

              <div>
                <h2 className="font-serif text-[#1A1A1A] text-2xl md:text-3xl mb-4">
                  Contact
                </h2>
                <p>
                  Questions about the Terms of Service should be sent to us at{" "}
                  <a href="mailto:legal@janes.com" className="text-[#C08A6F] hover:underline">
                    legal@janes.com
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

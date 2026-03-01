"use client";

import { motion } from "framer-motion";
import PageHero from "@/components/PageHero";

export default function ShippingPage() {
  return (
    <>
      <PageHero
        title="Shipping &"
        titleItalic="Returns"
        subtitle="Delivery Information"
        description="All you need to know about getting your JANES pieces to your door."
      />

      <section className="bg-[#FAF8F5] py-24 md:py-36">
        <div className="mx-auto max-w-[900px] px-6 md:px-12">
          {/* Shipping */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="font-serif text-[#1A1A1A] text-3xl md:text-4xl mb-8">Shipping</h2>
            <div className="space-y-6 text-[#666] text-sm leading-relaxed">
              <p>
                We offer worldwide delivery on all orders. All packages are carefully wrapped
                in our signature tissue paper and placed in a branded box to ensure your garments
                arrive in perfect condition.
              </p>

              <div className="border border-[#E8E2DB] p-6 md:p-8 space-y-4">
                <div className="flex justify-between items-start border-b border-[#E8E2DB] pb-4">
                  <div>
                    <p className="text-[#1A1A1A] font-medium text-sm">Nigeria (Domestic)</p>
                    <p className="text-[#666] text-xs mt-1">3-5 business days</p>
                  </div>
                  <p className="text-[#1A1A1A] text-sm">₦3,500</p>
                </div>
                <div className="flex justify-between items-start border-b border-[#E8E2DB] pb-4">
                  <div>
                    <p className="text-[#1A1A1A] font-medium text-sm">Africa</p>
                    <p className="text-[#666] text-xs mt-1">5-10 business days</p>
                  </div>
                  <p className="text-[#1A1A1A] text-sm">$25</p>
                </div>
                <div className="flex justify-between items-start border-b border-[#E8E2DB] pb-4">
                  <div>
                    <p className="text-[#1A1A1A] font-medium text-sm">International Standard</p>
                    <p className="text-[#666] text-xs mt-1">7-14 business days</p>
                  </div>
                  <p className="text-[#1A1A1A] text-sm">$35</p>
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[#1A1A1A] font-medium text-sm">International Express</p>
                    <p className="text-[#666] text-xs mt-1">3-5 business days</p>
                  </div>
                  <p className="text-[#1A1A1A] text-sm">$55</p>
                </div>
              </div>

              <p>
                Orders over $500 qualify for complimentary express shipping. You will receive a
                tracking number via email once your order has been dispatched.
              </p>
            </div>
          </motion.div>

          {/* Returns */}
          <motion.div
            className="mt-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="font-serif text-[#1A1A1A] text-3xl md:text-4xl mb-8">Returns</h2>
            <div className="space-y-6 text-[#666] text-sm leading-relaxed">
              <p>
                We want you to be delighted with your purchase. If for any reason you&apos;re not
                completely satisfied, we accept returns within 14 days of delivery.
              </p>
              <div className="space-y-4">
                <h3 className="text-[#1A1A1A] font-medium text-sm uppercase tracking-widest">
                  Return Conditions
                </h3>
                <ul className="space-y-2 text-[#666] text-sm">
                  <li className="flex items-start gap-3">
                    <span className="text-[#C08A6F] mt-1">—</span>
                    Items must be unworn, unwashed, and in original condition
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#C08A6F] mt-1">—</span>
                    All original tags must be attached
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#C08A6F] mt-1">—</span>
                    Items must be returned in original packaging
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#C08A6F] mt-1">—</span>
                    Sale items are final sale and cannot be returned
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#C08A6F] mt-1">—</span>
                    Raw fabric rolls cannot be returned once cut
                  </li>
                </ul>
              </div>
              <p>
                To initiate a return, please contact us at{" "}
                <a href="mailto:returns@janes.com" className="text-[#C08A6F] hover:underline">
                  returns@janes.com
                </a>{" "}
                with your order number and reason for return. We will provide you with a
                prepaid return label and instructions.
              </p>
              <p>
                Refunds are processed within 5-7 business days of receiving the returned
                item. The refund will be credited to your original payment method.
              </p>
            </div>
          </motion.div>

          {/* Exchanges */}
          <motion.div
            className="mt-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="font-serif text-[#1A1A1A] text-3xl md:text-4xl mb-8">Exchanges</h2>
            <div className="space-y-6 text-[#666] text-sm leading-relaxed">
              <p>
                We are happy to exchange items for a different size or colour, subject to
                availability. Exchanges follow the same 14-day window and condition requirements
                as returns.
              </p>
              <p>
                For the fastest service, we recommend placing a new order for the desired item
                and returning the original for a refund.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}

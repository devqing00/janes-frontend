"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import PageHero from "@/components/PageHero";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut" as const },
  },
};

interface ContactInfo {
  email: string;
  phone: string;
  address: string;
  instagram: string;
}

interface ContactPageClientProps {
  contactInfo?: ContactInfo;
}

export default function ContactPageClient({ contactInfo }: ContactPageClientProps) {
  const email = contactInfo?.email || "hello@janes.com";
  const phone = contactInfo?.phone || "+234 801 234 5678";
  const address = contactInfo?.address || "24 Victoria Island Crescent, Lagos, Nigeria";
  const instagram = contactInfo?.instagram
    ? `https://instagram.com/${contactInfo.instagram.replace(/^@/, "")}`
    : "#";

  const contactDetails = [
    { label: "Email", value: email, href: `mailto:${email}` },
    { label: "Phone", value: phone, href: `tel:${phone.replace(/\s/g, "")}` },
    { label: "Showroom", value: address, href: "#" },
    { label: "Hours", value: "Mon – Sat, 10am – 7pm WAT", href: "#" },
  ];

  const socials = [
    { label: "Instagram", href: instagram },
    { label: "Twitter", href: "#" },
    { label: "Pinterest", href: "#" },
  ];

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setSubmitted(true);
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data?.error || "Failed to send message. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full bg-transparent border-b border-brand-text/20 pb-3 text-sm text-brand-text focus:outline-none focus:border-brand-accent transition-colors";

  return (
    <>
      <PageHero
        title="Get in"
        titleItalic="Touch"
        subtitle="Contact"
        description="We'd love to hear from you. Whether it's a styling question, wholesale inquiry, or just to say hello."
      />

      <section className="bg-brand-bg py-24 md:py-36">
        <div className="mx-auto max-w-[1440px] px-6 md:px-12">
          <div className="grid grid-cols-12 gap-12 md:gap-16">
            {/* Contact info */}
            <motion.div
              className="col-span-12 md:col-span-5"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeUp}
            >
              <p className="text-brand-muted uppercase text-[10px] tracking-widest mb-8">
                Contact Information
              </p>
              <div className="space-y-8">
                {contactDetails.map((item) => (
                  <div key={item.label}>
                    <p className="text-brand-muted uppercase text-[9px] tracking-widest mb-1">
                      {item.label}
                    </p>
                    {item.href !== "#" ? (
                      <a
                        href={item.href}
                        className="text-brand-text text-sm hover:text-brand-accent transition-colors"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-brand-text text-sm">{item.value}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Social links */}
              <div className="mt-12">
                <p className="text-brand-muted uppercase text-[9px] tracking-widest mb-4">
                  Follow Us
                </p>
                <div className="flex gap-6">
                  {socials.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target={social.href !== "#" ? "_blank" : undefined}
                      rel={social.href !== "#" ? "noopener noreferrer" : undefined}
                      className="text-brand-text text-xs hover:text-brand-accent transition-colors"
                    >
                      {social.label}
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Contact form */}
            <motion.div
              className="col-span-12 md:col-span-7"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { delay: 0.15, duration: 0.7, ease: "easeOut" as const },
                },
              }}
            >
              <p className="text-brand-muted uppercase text-[10px] tracking-widest mb-8">
                Send a Message
              </p>

              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="py-12 text-center"
                >
                  <div className="w-12 h-12 rounded-full bg-brand-accent/10 flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-brand-accent">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  </div>
                  <h3 className="font-serif text-brand-text text-2xl mb-3">
                    Thank you, <span className="italic font-normal">{formData.name || "friend"}</span>
                  </h3>
                  <p className="text-brand-muted text-sm max-w-sm mx-auto">
                    Your message has been received. We&apos;ll be in touch shortly.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-8 text-brand-muted text-xs uppercase tracking-widest hover:text-brand-accent transition-colors"
                  >
                    Send another message
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="text-brand-muted uppercase text-[9px] tracking-widest block mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="text-brand-muted uppercase text-[9px] tracking-widest block mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-brand-muted uppercase text-[9px] tracking-widest block mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="text-brand-muted uppercase text-[9px] tracking-widest block mb-2">
                      Message
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className={inputClass + " resize-none"}
                    />
                  </div>
                  {error && (
                    <p className="text-red-500 text-xs">{error}</p>
                  )}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-brand-accent text-white uppercase text-[10px] tracking-[0.2em] px-10 py-3.5 hover:bg-brand-accent/90 transition-all mt-4 disabled:opacity-60"
                  >
                    {submitting ? "Sending..." : "Send Message"}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}

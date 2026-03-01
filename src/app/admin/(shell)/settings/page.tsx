"use client";

import { useToast } from "@/components/admin/Toast";
import { useState, useEffect } from "react";

interface ShippingRate {
  _key?: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
}

interface BankAccount {
  _key?: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  sortCode: string;
}

interface Settings {
  brandName: string;
  tagline: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  instagramUrl: string;
  currency: string;
  shippingNote: string;
}

const defaults: Settings = {
  brandName: "JANES",
  tagline: "",
  contactEmail: "",
  contactPhone: "",
  contactAddress: "",
  instagramUrl: "",
  currency: "USD",
  shippingNote: "",
};

export default function SettingsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Settings>(defaults);
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
  const [activePaymentMethods, setActivePaymentMethods] = useState<string[]>(["paystack"]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/settings");
        if (res.ok) {
          const data = await res.json();
          setForm({
            brandName: data.brandName || defaults.brandName,
            tagline: data.tagline || "",
            contactEmail: data.contactEmail || "",
            contactPhone: data.contactPhone || "",
            contactAddress: data.contactAddress || "",
            instagramUrl: data.instagramUrl || "",
            currency: data.currency || "USD",
            shippingNote: data.shippingNote || "",
          });
          if (data.shippingRates) setShippingRates(data.shippingRates);
          if (data.activePaymentMethods) setActivePaymentMethods(data.activePaymentMethods);
          if (data.bankAccounts) setBankAccounts(data.bankAccounts);
        }
      } catch {
        toast("Failed to load settings", "error");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [toast]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, shippingRates, activePaymentMethods, bankAccounts }),
      });
      if (res.ok) {
        toast("Settings saved successfully");
      } else {
        toast("Failed to save settings", "error");
      }
    } catch {
      toast("Something went wrong", "error");
    } finally {
      setSaving(false);
    }
  };

  const addRate = () =>
    setShippingRates((p) => [
      ...p,
      { name: "", description: "", price: 0, estimatedDays: "" },
    ]);

  const removeRate = (i: number) =>
    setShippingRates((p) => p.filter((_, idx) => idx !== i));

  const updateRate = (i: number, field: keyof ShippingRate, value: string | number) =>
    setShippingRates((p) =>
      p.map((r, idx) => (idx === i ? { ...r, [field]: value } : r))
    );

  const togglePaymentMethod = (method: string) => {
    setActivePaymentMethods((p) =>
      p.includes(method) ? (p.length > 1 ? p.filter((m) => m !== method) : p) : [...p, method]
    );
  };

  const addBankAccount = () =>
    setBankAccounts((p) => [...p, { bankName: "", accountName: "", accountNumber: "", sortCode: "" }]);

  const removeBankAccount = (i: number) =>
    setBankAccounts((p) => p.filter((_, idx) => idx !== i));

  const updateBankAccount = (i: number, field: keyof BankAccount, value: string) =>
    setBankAccounts((p) =>
      p.map((a, idx) => (idx === i ? { ...a, [field]: value } : a))
    );

  const inputClass =
    "w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#C08A6F] transition-colors bg-white";

  if (loading) {
    return (
        <div className="max-w-3xl space-y-6">
          <div className="space-y-2">
            <div className="skeleton h-6 w-28" />
            <div className="skeleton h-3 w-52" />
          </div>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <div className="skeleton h-4 w-32" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="skeleton h-10 w-full" />
                <div className="skeleton h-10 w-full" />
              </div>
            </div>
          ))}
        </div>
    );
  }

  return (
      <div className="max-w-3xl">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-semibold text-[#1A1A1A]">Settings</h1>
          <p className="text-[#666] text-sm mt-1">Manage your store configuration</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          {/* Brand */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 space-y-5">
            <h2 className="font-medium text-[#1A1A1A] text-sm uppercase tracking-widest">Brand</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div>
                <label className="text-[#666] text-xs block mb-1.5">Brand Name</label>
                <input name="brandName" value={form.brandName} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className="text-[#666] text-xs block mb-1.5">Currency</label>
                <select name="currency" value={form.currency} onChange={handleChange} className={inputClass}>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="NGN">NGN (₦)</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-[#666] text-xs block mb-1.5">Tagline</label>
                <input name="tagline" value={form.tagline} onChange={handleChange} className={inputClass} placeholder="Your brand's tagline" />
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 space-y-5">
            <h2 className="font-medium text-[#1A1A1A] text-sm uppercase tracking-widest">Contact Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div>
                <label className="text-[#666] text-xs block mb-1.5">Email Address</label>
                <input name="contactEmail" type="email" value={form.contactEmail} onChange={handleChange} className={inputClass} placeholder="hello@janes.com" />
              </div>
              <div>
                <label className="text-[#666] text-xs block mb-1.5">Phone Number</label>
                <input name="contactPhone" value={form.contactPhone} onChange={handleChange} className={inputClass} placeholder="+1 234 567 8900" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-[#666] text-xs block mb-1.5">Showroom Address</label>
                <textarea name="contactAddress" rows={2} value={form.contactAddress} onChange={handleChange} className={inputClass + " resize-none"} placeholder="24 Victoria Island Crescent, Lagos, Nigeria" />
              </div>
            </div>
          </div>

          {/* Social */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 space-y-5">
            <h2 className="font-medium text-[#1A1A1A] text-sm uppercase tracking-widest">Social & Shipping</h2>
            <div className="space-y-4 sm:space-y-5">
              <div>
                <label className="text-[#666] text-xs block mb-1.5">Instagram URL</label>
                <input name="instagramUrl" value={form.instagramUrl} onChange={handleChange} className={inputClass} placeholder="https://instagram.com/janes" />
              </div>
              <div>
                <label className="text-[#666] text-xs block mb-1.5">Shipping Note</label>
                <textarea name="shippingNote" rows={3} value={form.shippingNote} onChange={handleChange} className={inputClass + " resize-none"} placeholder="Displayed on product pages..." />
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 space-y-5">
            <h2 className="font-medium text-[#1A1A1A] text-sm uppercase tracking-widest">Payment Methods</h2>
            <p className="text-[#999] text-xs -mt-3">Toggle which payment methods are available at checkout. At least one must remain active.</p>
            <div className="space-y-3">
              {([
                { key: "paystack", label: "Paystack", desc: "Online card & bank payments via Paystack" },
                { key: "bank_transfer", label: "Direct Bank Transfer", desc: "Customer transfers directly to your bank account" },
              ] as const).map((m) => {
                const isActive = activePaymentMethods.includes(m.key);
                return (
                  <label
                    key={m.key}
                    className={`flex items-start gap-3 p-3.5 border rounded-lg cursor-pointer transition-colors ${
                      isActive ? "border-[#C08A6F] bg-[#fdf9f7]" : "border-gray-200 bg-white"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={() => togglePaymentMethod(m.key)}
                      className="mt-0.5 accent-[#C08A6F]"
                    />
                    <div>
                      <p className="text-sm font-medium text-[#1A1A1A]">{m.label}</p>
                      <p className="text-[11px] text-[#999] mt-0.5">{m.desc}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Bank Accounts */}
          {activePaymentMethods.includes("bank_transfer") && (
            <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="font-medium text-[#1A1A1A] text-sm uppercase tracking-widest">Bank Accounts</h2>
                <button type="button" onClick={addBankAccount}
                  className="text-[10px] uppercase tracking-widest text-[#C08A6F] hover:text-[#1A1A1A] border border-[#C08A6F] hover:border-[#1A1A1A] px-3 py-1.5 transition-colors">
                  + Add Account
                </button>
              </div>
              {bankAccounts.length === 0 ? (
                <p className="text-sm text-[#999] italic">No bank accounts configured. Add one so customers know where to send payment.</p>
              ) : (
                <div className="space-y-4">
                  {bankAccounts.map((acct, i) => (
                    <div key={acct._key ?? i} className="border border-gray-200 rounded-lg p-4 space-y-3 relative">
                      <button type="button" onClick={() => removeBankAccount(i)}
                        className="absolute top-3 right-3 text-[#bbb] hover:text-red-500 transition-colors"
                        title="Remove account">
                        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                          <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75H4a.75.75 0 000 1.5h.25v10.5a2 2 0 002 2h7.5a2 2 0 002-2V5.25H16a.75.75 0 000-1.5h-2A2.75 2.75 0 0011.25 1h-2.5zm0 1.5h2.5c.69 0 1.25.56 1.25 1.25H7.5c0-.69.56-1.25 1.25-1.25zM6.75 5.25h6.5v10.5a.5.5 0 01-.5.5h-7.5a.5.5 0 01-.5-.5V5.25z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[#666] text-xs block mb-1">Bank Name <span className="text-[#C08A6F]">*</span></label>
                          <input value={acct.bankName} onChange={(e) => updateBankAccount(i, "bankName", e.target.value)}
                            className={inputClass} placeholder="GTBank" />
                        </div>
                        <div>
                          <label className="text-[#666] text-xs block mb-1">Account Name <span className="text-[#C08A6F]">*</span></label>
                          <input value={acct.accountName} onChange={(e) => updateBankAccount(i, "accountName", e.target.value)}
                            className={inputClass} placeholder="Jane Doe" />
                        </div>
                        <div>
                          <label className="text-[#666] text-xs block mb-1">Account Number <span className="text-[#C08A6F]">*</span></label>
                          <input value={acct.accountNumber} onChange={(e) => updateBankAccount(i, "accountNumber", e.target.value)}
                            className={inputClass} placeholder="0123456789" />
                        </div>
                        <div>
                          <label className="text-[#666] text-xs block mb-1">Sort Code <span className="text-[#999]">(optional)</span></label>
                          <input value={acct.sortCode} onChange={(e) => updateBankAccount(i, "sortCode", e.target.value)}
                            className={inputClass} placeholder="058" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Shipping Rates */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-medium text-[#1A1A1A] text-sm uppercase tracking-widest">Shipping Rates</h2>
              <button type="button" onClick={addRate}
                className="text-[10px] uppercase tracking-widest text-[#C08A6F] hover:text-[#1A1A1A] border border-[#C08A6F] hover:border-[#1A1A1A] px-3 py-1.5 transition-colors">
                + Add Rate
              </button>
            </div>
            {shippingRates.length === 0 ? (
              <p className="text-sm text-[#999] italic">No shipping rates configured. Click &quot;Add Rate&quot; to create one.</p>
            ) : (
              <div className="space-y-4">
                {shippingRates.map((rate, i) => (
                  <div key={rate._key ?? i} className="border border-gray-200 rounded-lg p-4 space-y-3 relative">
                    <button type="button" onClick={() => removeRate(i)}
                      className="absolute top-3 right-3 text-[#bbb] hover:text-red-500 transition-colors"
                      title="Remove rate">
                      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75H4a.75.75 0 000 1.5h.25v10.5a2 2 0 002 2h7.5a2 2 0 002-2V5.25H16a.75.75 0 000-1.5h-2A2.75 2.75 0 0011.25 1h-2.5zm0 1.5h2.5c.69 0 1.25.56 1.25 1.25H7.5c0-.69.56-1.25 1.25-1.25zM6.75 5.25h6.5v10.5a.5.5 0 01-.5.5h-7.5a.5.5 0 01-.5-.5V5.25z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[#666] text-xs block mb-1">Rate Name <span className="text-[#C08A6F]">*</span></label>
                        <input value={rate.name} onChange={(e) => updateRate(i, "name", e.target.value)}
                          className={inputClass} placeholder="Standard Delivery" />
                      </div>
                      <div>
                        <label className="text-[#666] text-xs block mb-1">Price (in base currency) <span className="text-[#C08A6F]">*</span></label>
                        <input type="number" min={0} value={rate.price}
                          onChange={(e) => updateRate(i, "price", parseFloat(e.target.value) || 0)}
                          className={inputClass} placeholder="3000" />
                      </div>
                      <div>
                        <label className="text-[#666] text-xs block mb-1">Description</label>
                        <input value={rate.description} onChange={(e) => updateRate(i, "description", e.target.value)}
                          className={inputClass} placeholder="Ships within Nigeria" />
                      </div>
                      <div>
                        <label className="text-[#666] text-xs block mb-1">Estimated Days</label>
                        <input value={rate.estimatedDays} onChange={(e) => updateRate(i, "estimatedDays", e.target.value)}
                          className={inputClass} placeholder="5–7 business days" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-[#232323] text-white text-sm px-8 py-2.5 rounded-lg hover:bg-[#C08A6F] transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </form>
      </div>
  );
}

const siteSettings = {
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    // ── Payment & Shipping ──
    {
      name: "activePaymentMethods",
      title: "Active Payment Methods",
      type: "array",
      description: "Which payment methods are available to customers at checkout",
      of: [{ type: "string" }],
      options: {
        list: [
          { title: "Paystack (Card / Bank / USSD)", value: "paystack" },
          { title: "Direct Bank Transfer", value: "bank_transfer" },
        ],
      },
    },
    {
      name: "bankAccounts",
      title: "Bank Accounts",
      type: "array",
      description: "Bank account details shown to customers who choose direct transfer",
      of: [
        {
          type: "object",
          fields: [
            { name: "bankName", title: "Bank Name", type: "string" },
            { name: "accountName", title: "Account Name", type: "string" },
            { name: "accountNumber", title: "Account Number", type: "string" },
            { name: "sortCode", title: "Sort Code / Routing Number", type: "string" },
          ],
          preview: {
            select: { title: "bankName", subtitle: "accountNumber" },
          },
        },
      ],
    },
    {
      name: "shippingRates",
      title: "Shipping Rates",
      type: "array",
      description: "Available shipping options shown to customers at checkout",
      of: [
        {
          type: "object",
          fields: [
            { name: "name", title: "Name", type: "string", description: 'e.g. "Standard Delivery"' },
            { name: "description", title: "Description", type: "string", description: 'e.g. "5–7 business days"' },
            { name: "price", title: "Price", type: "number", description: "Price in your store currency" },
            { name: "estimatedDays", title: "Estimated Days Label", type: "string", description: 'e.g. "5–7 days"' },
          ],
          preview: {
            select: { title: "name", subtitle: "price" },
            prepare({ title, subtitle }: { title: string; subtitle: number }) {
              return { title, subtitle: subtitle != null ? String(subtitle) : "" };
            },
          },
        },
      ],
    },
    // ── Lookbook ──
    {
      name: "lookbookTitle",
      title: "Lookbook Title",
      type: "string",
      description: 'Main heading, e.g. "The Edit"',
    },
    {
      name: "lookbookSubtitle",
      title: "Lookbook Subtitle (italic)",
      type: "string",
      description: "Displayed in italics after the title",
    },
    {
      name: "lookbookDescription",
      title: "Lookbook Description",
      type: "text",
      description: "Short paragraph beneath the heading",
    },
    {
      name: "lookbookImages",
      title: "Lookbook Images",
      type: "array",
      description: "Editorial images displayed in the lookbook grid",
      of: [
        {
          type: "object",
          fields: [
            { name: "image", title: "Image", type: "image", options: { hotspot: true } },
            { name: "caption", title: "Caption", type: "string" },
          ],
          preview: {
            select: { title: "caption", media: "image" },
            prepare({ title, media }: { title: string; media: unknown }) {
              return { title: title || "Untitled", media };
            },
          },
        },
      ],
    },
  ],
};

export default siteSettings;

const siteSettings = {
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    // ── General ──
    {
      name: "brandName",
      title: "Brand Name",
      type: "string",
    },
    {
      name: "tagline",
      title: "Hero Tagline",
      type: "text",
      description: 'Main hero text, e.g. "Luxurious and Contemporary Apparel for Every Woman"',
    },
    {
      name: "heroImages",
      title: "Hero Section Images",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
      description: "3 images for the hero section (left, top-right, bottom-right)",
    },
    {
      name: "heroSeasonLabel",
      title: "Hero Season Label",
      type: "string",
      description: 'e.g. "SS 2026"',
    },
    {
      name: "heroCTAText",
      title: "Hero CTA Button Text",
      type: "string",
      description: 'e.g. "Explore Collection"',
    },

    // ── Categories Section ──
    {
      name: "categoryCards",
      title: "Category Cards",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "title", title: "Title", type: "string" },
            { name: "image", title: "Image", type: "image", options: { hotspot: true } },
            { name: "link", title: "Link URL", type: "string", description: 'e.g. "/shop?category=Womenswear"' },
          ],
          preview: {
            select: { title: "title", media: "image" },
          },
        },
      ],
    },

    // ── Editorial Grid ──
    {
      name: "editorialItems",
      title: "Editorial Grid Items",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "image", title: "Image", type: "image", options: { hotspot: true } },
            { name: "title", title: "Title", type: "string" },
            { name: "category", title: "Category Label", type: "string", description: 'e.g. "Editorial", "Trend Report"' },
          ],
          preview: {
            select: { title: "title", subtitle: "category", media: "image" },
          },
        },
      ],
      description: "3 editorial items for the homepage grid (first is large, other two stack on the right)",
    },

    // ── Parallax Section ──
    {
      name: "parallaxImage",
      title: "Parallax Background Image",
      type: "image",
      options: { hotspot: true },
    },
    {
      name: "parallaxSubtitle",
      title: "Parallax Subtitle",
      type: "string",
      description: 'e.g. "Our Philosophy"',
    },
    {
      name: "parallaxHeading",
      title: "Parallax Heading",
      type: "text",
      description: 'e.g. "Fashion that transcends the ordinary"',
    },
    {
      name: "parallaxCTAText",
      title: "Parallax CTA Text",
      type: "string",
      description: 'e.g. "Our Story"',
    },
    {
      name: "parallaxCTALink",
      title: "Parallax CTA Link",
      type: "string",
      description: 'e.g. "/about"',
    },

    // ── Lookbook ──
    {
      name: "lookbookTitle",
      title: "Lookbook Page Title",
      type: "string",
    },
    {
      name: "lookbookSubtitle",
      title: "Lookbook Italic Subtitle",
      type: "string",
      description: 'e.g. "SS26"',
    },
    {
      name: "lookbookDescription",
      title: "Lookbook Description",
      type: "text",
    },
    {
      name: "lookbookImages",
      title: "Lookbook Images",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "image", title: "Image", type: "image", options: { hotspot: true } },
            { name: "caption", title: "Caption", type: "string" },
          ],
          preview: {
            select: { title: "caption", media: "image" },
          },
        },
      ],
    },

    // ── Contact & Social ──
    {
      name: "instagramHandle",
      title: "Instagram Handle",
      type: "string",
    },
    {
      name: "instagramImages",
      title: "Instagram Section Images",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
    },
    {
      name: "email",
      title: "Contact Email",
      type: "string",
    },
    {
      name: "phone",
      title: "Contact Phone",
      type: "string",
    },
    {
      name: "address",
      title: "Address",
      type: "text",
      description: "Physical showroom / studio address",
    },
    {
      name: "currency",
      title: "Currency",
      type: "string",
      options: {
        list: [
          { title: "USD ($)", value: "USD" },
          { title: "EUR (€)", value: "EUR" },
          { title: "GBP (£)", value: "GBP" },
          { title: "NGN (₦)", value: "NGN" },
        ],
      },
      initialValue: "USD",
    },
    {
      name: "shippingNote",
      title: "Shipping Note",
      type: "text",
      description: "Displayed on product pages",
    },
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
  ],
};

export default siteSettings;

const product = {
  name: "product",
  title: "Product",
  type: "document",
  fields: [
    {
      name: "name",
      title: "Name",
      type: "string",
      validation: (Rule: { required: () => unknown }) => Rule.required(),
    },
    {
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name", maxLength: 96 },
    },
    {
      name: "category",
      title: "Main Category",
      type: "reference",
      to: [{ type: "category" }],
      options: {
        filter: "level == 1",
      },
    },
    {
      name: "subcategory",
      title: "Sub-section",
      type: "reference",
      to: [{ type: "category" }],
      options: {
        filter: "level == 2",
      },
    },
    {
      name: "tags",
      title: "Tags (Sub-sub-sections)",
      type: "array",
      of: [{ type: "reference", to: [{ type: "category" }] }],
      description: "Level 3 category tags for this product",
    },
    {
      name: "price",
      title: "Price",
      type: "number",
    },
    {
      name: "comparePrice",
      title: "Compare-at Price",
      type: "number",
      description: "Original price before discount. Leave empty if not on sale.",
    },
    {
      name: "images",
      title: "Images",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
    },
    {
      name: "description",
      title: "Description",
      type: "text",
    },
    {
      name: "details",
      title: "Details",
      type: "array",
      of: [{ type: "string" }],
      description: "Product detail bullet points",
    },
    {
      name: "sizes",
      title: "Sizes",
      type: "array",
      of: [{ type: "string" }],
      description: "Available sizes e.g. XS, S, M, L, XL",
    },
    {
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Draft", value: "draft" },
          { title: "Published", value: "published" },
        ],
      },
      initialValue: "draft",
    },
    {
      name: "inStock",
      title: "In Stock",
      type: "boolean",
      initialValue: true,
    },
    {
      name: "featured",
      title: "Featured",
      type: "boolean",
      initialValue: false,
    },
  ],
};

export default product;

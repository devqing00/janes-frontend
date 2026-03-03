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
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "Womenswear", value: "womenswear" },
          { title: "Menswear", value: "menswear" },
          { title: "Fabrics", value: "fabrics" },
        ],
      },
    },
    {
      name: "subcategory",
      title: "Subcategory",
      type: "string",
      options: {
        list: [
          { title: "Agbada", value: "agbada" },
          { title: "Kaftan", value: "kaftan" },
          { title: "Ankara", value: "ankara" },
          { title: "Aso-Oke", value: "aso-oke" },
          { title: "Two-Piece", value: "two-piece" },
          { title: "Tops", value: "tops" },
          { title: "Dresses", value: "dresses" },
          { title: "Trousers", value: "trousers" },
        ],
      },
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

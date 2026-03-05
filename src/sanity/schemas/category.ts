const category = {
  name: "category",
  title: "Category",
  type: "document",
  fields: [
    {
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule: { required: () => unknown }) => Rule.required(),
    },
    {
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
    },
    {
      name: "level",
      title: "Level",
      type: "number",
      description: "1 = Main, 2 = Sub-section, 3 = Tag",
      options: {
        list: [
          { title: "Main Category", value: 1 },
          { title: "Sub-section", value: 2 },
          { title: "Tag (Sub-sub-section)", value: 3 },
        ],
      },
      initialValue: 1,
    },
    {
      name: "parent",
      title: "Parent Category",
      type: "reference",
      to: [{ type: "category" }],
    },
    {
      name: "image",
      title: "Category Image",
      type: "image",
      options: { hotspot: true },
    },
    {
      name: "description",
      title: "Description",
      type: "text",
    },
    {
      name: "order",
      title: "Sort Order",
      type: "number",
      initialValue: 0,
    },
    // ── Fabric-specific fields (only for level-3 tags under the Fabrics category) ──
    {
      name: "fabricPrice",
      title: "Fabric Price (NGN)",
      type: "number",
      description: "Price per N units of the chosen metric (e.g. ₦3,000 per 2 yards)",
    },
    {
      name: "fabricPricePerN",
      title: "Units per Price",
      type: "number",
      description: "How many units of the metric are included in the price (the N in '₦X per N yards')",
      initialValue: 1,
    },
    {
      name: "fabricUnit",
      title: "Fabric Unit",
      type: "string",
      description: "Measurement unit for this fabric tag",
      options: {
        list: [
          { title: "Yard", value: "yard" },
          { title: "Meter", value: "meter" },
          { title: "Piece", value: "piece" },
          { title: "Roll", value: "roll" },
          { title: "Kg", value: "kg" },
          { title: "Length", value: "length" },
        ],
      },
    },
    {
      name: "minQuantity",
      title: "Minimum Order Quantity",
      type: "number",
      description: "Minimum units a customer must order",
      initialValue: 1,
    },
    {
      name: "maxQuantity",
      title: "Maximum Order Quantity",
      type: "number",
      description: "Maximum units a customer may order. Leave blank for no limit.",
    },
  ],
};

export default category;

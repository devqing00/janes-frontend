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
  ],
};

export default category;

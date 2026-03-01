const collection = {
  name: "collection",
  title: "Collection",
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
      name: "season",
      title: "Season",
      type: "string",
      description: 'e.g. "Spring / Summer"',
    },
    {
      name: "year",
      title: "Year",
      type: "string",
    },
    {
      name: "description",
      title: "Description",
      type: "text",
    },
    {
      name: "image",
      title: "Cover Image",
      type: "image",
      options: { hotspot: true },
    },
    {
      name: "heroImages",
      title: "Hero Images",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
    },
    {
      name: "lookbookImages",
      title: "Lookbook Images",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
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
      name: "active",
      title: "Active (Show on Homepage)",
      type: "boolean",
      initialValue: true,
    },
  ],
};

export default collection;
